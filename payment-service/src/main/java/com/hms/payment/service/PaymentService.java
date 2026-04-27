package com.hms.payment.service;

import com.hms.payment.client.AppointmentServiceClient;
import com.hms.payment.client.dto.AppointmentLookup;
import com.hms.payment.dto.PaymentDTO;
import com.hms.payment.dto.ProcessPaymentRequest;
import com.hms.payment.entity.Payment;
import com.hms.payment.entity.PaymentStatus;
import com.hms.payment.exception.*;
import com.hms.payment.repository.PaymentRepository;
import com.hms.payment.security.CurrentUserDetails;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final AppointmentServiceClient appointmentServiceClient;

    /**
     * Process a payment for an appointment.
     * - PATIENT: must own the appointment (appointment.patientId == caller.linkedId)
     * - ADMIN: any
     * - DOCTOR: not allowed
     */
    @Transactional
    public PaymentDTO process(ProcessPaymentRequest req, CurrentUserDetails me) {
        if (me.isDoctor()) {
            throw new ForbiddenException("Doctors cannot process payments");
        }

        AppointmentLookup appt = lookupAppointment(req.getAppointmentId());

        if (me.isPatient() && !appt.getPatientId().equals(me.linkedId())) {
            throw new ForbiddenException("You can only pay for your own appointments");
        }

        if (paymentRepository.existsByAppointmentIdAndPaymentStatus(
                req.getAppointmentId(), PaymentStatus.PAID)) {
            throw new AlreadyPaidException(req.getAppointmentId());
        }

        Payment payment = Payment.builder()
                .appointmentId(req.getAppointmentId())
                .patientId(appt.getPatientId())
                .amount(req.getAmount())
                .paymentMethod(req.getPaymentMethod())
                .paymentStatus(simulateGateway())
                .transactionRef("TXN-" + UUID.randomUUID())
                .build();

        Payment saved = paymentRepository.save(payment);
        log.info("Payment {} processed for appointment {} (status={})",
                saved.getId(), saved.getAppointmentId(), saved.getPaymentStatus());
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<PaymentDTO> findVisible(CurrentUserDetails me) {
        if (me.isAdmin()) {
            return paymentRepository.findAll().stream().map(this::toDto).toList();
        }
        if (me.isPatient()) {
            if (me.linkedId() == null) return List.of();
            return paymentRepository
                    .findByPatientIdOrderByCreatedAtDesc(me.linkedId())
                    .stream().map(this::toDto).toList();
        }
        throw new ForbiddenException("Doctors cannot view payments");
    }

    @Transactional(readOnly = true)
    public PaymentDTO findVisibleById(Long id, CurrentUserDetails me) {
        Payment p = loadOrThrow(id);
        ensureCanView(p, me);
        return toDto(p);
    }

    @Transactional(readOnly = true)
    public List<PaymentDTO> findByAppointmentId(Long appointmentId, CurrentUserDetails me) {
        List<Payment> all = paymentRepository.findByAppointmentIdOrderByCreatedAtDesc(appointmentId);
        if (me.isAdmin()) {
            return all.stream().map(this::toDto).toList();
        }
        if (me.isPatient()) {
            return all.stream()
                    .filter(p -> p.getPatientId().equals(me.linkedId()))
                    .map(this::toDto).toList();
        }
        throw new ForbiddenException("Doctors cannot view payments");
    }

    @Transactional
    public PaymentDTO refund(Long id, CurrentUserDetails me) {
        if (!me.isAdmin()) {
            throw new ForbiddenException("Only admins can issue refunds");
        }
        Payment p = loadOrThrow(id);
        if (p.getPaymentStatus() != PaymentStatus.PAID) {
            throw new RefundNotAllowedException(p.getPaymentStatus());
        }
        p.setPaymentStatus(PaymentStatus.REFUNDED);
        log.info("Payment {} refunded", id);
        return toDto(paymentRepository.save(p));
    }

    // ---- helpers ----

    private AppointmentLookup lookupAppointment(Long appointmentId) {
        try {
            return appointmentServiceClient.findById(appointmentId);
        } catch (FeignException.NotFound e) {
            throw new ForbiddenException("Appointment not found: " + appointmentId);
        } catch (FeignException e) {
            throw new DownstreamServiceException(
                    "Failed to verify appointment: " + e.getMessage(), e);
        }
    }

    private void ensureCanView(Payment p, CurrentUserDetails me) {
        if (me.isAdmin()) return;
        if (me.isPatient() && p.getPatientId().equals(me.linkedId())) return;
        throw new ForbiddenException("You cannot view this payment");
    }

    /** Mock gateway — always returns PAID. Real impl would call Stripe/Razorpay/etc. */
    private PaymentStatus simulateGateway() {
        return PaymentStatus.PAID;
    }

    private Payment loadOrThrow(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new PaymentNotFoundException(id));
    }

    private PaymentDTO toDto(Payment p) {
        return PaymentDTO.builder()
                .id(p.getId())
                .appointmentId(p.getAppointmentId())
                .patientId(p.getPatientId())
                .amount(p.getAmount())
                .paymentMethod(p.getPaymentMethod())
                .paymentStatus(p.getPaymentStatus())
                .transactionRef(p.getTransactionRef())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
