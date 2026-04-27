package com.hms.appointment.service;

import com.hms.appointment.client.DoctorServiceClient;
import com.hms.appointment.client.PatientServiceClient;
import com.hms.appointment.dto.AppointmentDTO;
import com.hms.appointment.dto.BookAppointmentRequest;
import com.hms.appointment.dto.RescheduleRequest;
import com.hms.appointment.entity.Appointment;
import com.hms.appointment.entity.AppointmentStatus;
import com.hms.appointment.exception.*;
import com.hms.appointment.repository.AppointmentRepository;
import com.hms.appointment.security.CurrentUserDetails;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientServiceClient patientServiceClient;
    private final DoctorServiceClient doctorServiceClient;

    /**
     * Books a new appointment.
     * - PATIENT: patientId always = caller.linkedId (their own).
     * - ADMIN: patientId must be supplied in the request.
     * - DOCTOR: cannot book — they only manage existing appointments.
     */
    @Transactional
    public AppointmentDTO book(BookAppointmentRequest req, CurrentUserDetails me) {
        Long patientId = resolvePatientId(req, me);

        verifyPatientExists(patientId);
        verifyDoctorExists(req.getDoctorId());

        if (appointmentRepository.existsByDoctorIdAndAppointmentDateAndAppointmentTime(
                req.getDoctorId(), req.getAppointmentDate(), req.getAppointmentTime())) {
            throw new SlotAlreadyBookedException(
                    req.getDoctorId(), req.getAppointmentDate(), req.getAppointmentTime());
        }

        Appointment a = Appointment.builder()
                .patientId(patientId)
                .doctorId(req.getDoctorId())
                .appointmentDate(req.getAppointmentDate())
                .appointmentTime(req.getAppointmentTime())
                .status(AppointmentStatus.SCHEDULED)
                .build();
        Appointment saved = appointmentRepository.save(a);
        log.info("Booked appointment id={} patient={} doctor={} on {}",
                saved.getId(), patientId, req.getDoctorId(), req.getAppointmentDate());
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<AppointmentDTO> findVisible(CurrentUserDetails me) {
        if (me.isAdmin()) {
            return appointmentRepository.findAll().stream().map(this::toDto).toList();
        }
        if (me.isDoctor()) {
            return appointmentRepository
                    .findByDoctorIdOrderByAppointmentDateDescAppointmentTimeDesc(me.linkedId())
                    .stream().map(this::toDto).toList();
        }
        // patient
        return appointmentRepository
                .findByPatientIdOrderByAppointmentDateDescAppointmentTimeDesc(me.linkedId())
                .stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public AppointmentDTO findVisibleById(Long id, CurrentUserDetails me) {
        Appointment a = loadOrThrow(id);
        ensureCanView(a, me);
        return toDto(a);
    }

    @Transactional
    public AppointmentDTO confirm(Long id, CurrentUserDetails me) {
        Appointment a = loadOrThrow(id);
        ensureDoctorOrAdmin(a, me, "confirm");
        if (a.getStatus() != AppointmentStatus.SCHEDULED) {
            throw new InvalidStatusTransitionException(a.getStatus(), "confirm");
        }
        a.setStatus(AppointmentStatus.CONFIRMED);
        return toDto(appointmentRepository.save(a));
    }

    @Transactional
    public AppointmentDTO cancel(Long id, CurrentUserDetails me) {
        Appointment a = loadOrThrow(id);
        ensureCanModify(a, me, "cancel");
        if (a.getStatus() != AppointmentStatus.SCHEDULED && a.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new InvalidStatusTransitionException(a.getStatus(), "cancel");
        }
        a.setStatus(AppointmentStatus.CANCELLED);
        return toDto(appointmentRepository.save(a));
    }

    @Transactional
    public AppointmentDTO complete(Long id, CurrentUserDetails me) {
        Appointment a = loadOrThrow(id);
        ensureDoctorOrAdmin(a, me, "complete");
        if (a.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new InvalidStatusTransitionException(a.getStatus(), "complete");
        }
        a.setStatus(AppointmentStatus.COMPLETED);
        return toDto(appointmentRepository.save(a));
    }

    @Transactional
    public AppointmentDTO reschedule(Long id, RescheduleRequest req, CurrentUserDetails me) {
        Appointment a = loadOrThrow(id);
        ensurePatientOrAdmin(a, me, "reschedule");
        if (a.getStatus() != AppointmentStatus.SCHEDULED && a.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new InvalidStatusTransitionException(a.getStatus(), "reschedule");
        }

        if (appointmentRepository.existsByDoctorIdAndAppointmentDateAndAppointmentTime(
                a.getDoctorId(), req.getAppointmentDate(), req.getAppointmentTime())) {
            throw new SlotAlreadyBookedException(
                    a.getDoctorId(), req.getAppointmentDate(), req.getAppointmentTime());
        }

        a.setAppointmentDate(req.getAppointmentDate());
        a.setAppointmentTime(req.getAppointmentTime());
        a.setStatus(AppointmentStatus.SCHEDULED);
        return toDto(appointmentRepository.save(a));
    }

    @Transactional
    public void delete(Long id, CurrentUserDetails me) {
        if (!me.isAdmin()) {
            throw new ForbiddenException("Only admins can delete appointments");
        }
        Appointment a = loadOrThrow(id);
        if (a.getStatus() != AppointmentStatus.CANCELLED && a.getStatus() != AppointmentStatus.COMPLETED) {
            throw new InvalidStatusTransitionException(a.getStatus(),
                    "delete (only CANCELLED or COMPLETED can be deleted)");
        }
        appointmentRepository.deleteById(id);
        log.info("Deleted appointment id={}", id);
    }

    // ---- helpers ----

    private Long resolvePatientId(BookAppointmentRequest req, CurrentUserDetails me) {
        if (me.isPatient()) {
            if (me.linkedId() == null) {
                throw new ForbiddenException("Your account is not linked to a patient profile");
            }
            return me.linkedId();
        }
        if (me.isAdmin()) {
            if (req.getPatientId() == null) {
                throw new ForbiddenException("Admin booking requires patientId in request body");
            }
            return req.getPatientId();
        }
        throw new ForbiddenException("Doctors cannot book appointments");
    }

    private void verifyPatientExists(Long patientId) {
        try {
            patientServiceClient.findById(patientId);
        } catch (FeignException.NotFound e) {
            throw new ForbiddenException("Patient not found: " + patientId);
        } catch (FeignException e) {
            throw new DownstreamServiceException(
                    "Failed to verify patient: " + e.getMessage(), e);
        }
    }

    private void verifyDoctorExists(Long doctorId) {
        try {
            doctorServiceClient.findById(doctorId);
        } catch (FeignException.NotFound e) {
            throw new ForbiddenException("Doctor not found: " + doctorId);
        } catch (FeignException e) {
            throw new DownstreamServiceException(
                    "Failed to verify doctor: " + e.getMessage(), e);
        }
    }

    private void ensureCanView(Appointment a, CurrentUserDetails me) {
        if (me.isAdmin()) return;
        if (me.isPatient() && a.getPatientId().equals(me.linkedId())) return;
        if (me.isDoctor() && a.getDoctorId().equals(me.linkedId())) return;
        throw new ForbiddenException("You cannot view this appointment");
    }

    private void ensureCanModify(Appointment a, CurrentUserDetails me, String action) {
        if (me.isAdmin()) return;
        if (me.isPatient() && a.getPatientId().equals(me.linkedId())) return;
        if (me.isDoctor() && a.getDoctorId().equals(me.linkedId())) return;
        throw new ForbiddenException("You cannot " + action + " this appointment");
    }

    private void ensureDoctorOrAdmin(Appointment a, CurrentUserDetails me, String action) {
        if (me.isAdmin()) return;
        if (me.isDoctor() && a.getDoctorId().equals(me.linkedId())) return;
        throw new ForbiddenException("Only the assigned doctor or an admin can " + action + " this appointment");
    }

    private void ensurePatientOrAdmin(Appointment a, CurrentUserDetails me, String action) {
        if (me.isAdmin()) return;
        if (me.isPatient() && a.getPatientId().equals(me.linkedId())) return;
        throw new ForbiddenException("Only the patient or an admin can " + action + " this appointment");
    }

    private Appointment loadOrThrow(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new AppointmentNotFoundException(id));
    }

    private AppointmentDTO toDto(Appointment a) {
        return AppointmentDTO.builder()
                .id(a.getId())
                .patientId(a.getPatientId())
                .doctorId(a.getDoctorId())
                .appointmentDate(a.getAppointmentDate())
                .appointmentTime(a.getAppointmentTime())
                .status(a.getStatus())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
