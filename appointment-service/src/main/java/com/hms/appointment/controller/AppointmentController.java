package com.hms.appointment.controller;

import com.hms.appointment.dto.AppointmentDTO;
import com.hms.appointment.dto.BookAppointmentRequest;
import com.hms.appointment.dto.RescheduleRequest;
import com.hms.appointment.security.CurrentUser;
import com.hms.appointment.security.CurrentUserDetails;
import com.hms.appointment.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    /** Book an appointment (PATIENT books own; ADMIN books any). */
    @PostMapping
    public ResponseEntity<AppointmentDTO> book(
            @Valid @RequestBody BookAppointmentRequest req,
            @CurrentUser CurrentUserDetails me) {
        return ResponseEntity.status(HttpStatus.CREATED).body(appointmentService.book(req, me));
    }

    /**
     * List appointments visible to the caller:
     * - ADMIN: all
     * - DOCTOR: their own
     * - PATIENT: their own
     */
    @GetMapping
    public List<AppointmentDTO> list(@CurrentUser CurrentUserDetails me) {
        return appointmentService.findVisible(me);
    }

    @GetMapping("/{id}")
    public AppointmentDTO findById(@PathVariable Long id, @CurrentUser CurrentUserDetails me) {
        return appointmentService.findVisibleById(id, me);
    }

    /** Doctor or admin: SCHEDULED → CONFIRMED. */
    @PatchMapping("/{id}/confirm")
    public AppointmentDTO confirm(@PathVariable Long id, @CurrentUser CurrentUserDetails me) {
        return appointmentService.confirm(id, me);
    }

    /** Patient, doctor (assigned), or admin: SCHEDULED|CONFIRMED → CANCELLED. */
    @PatchMapping("/{id}/cancel")
    public AppointmentDTO cancel(@PathVariable Long id, @CurrentUser CurrentUserDetails me) {
        return appointmentService.cancel(id, me);
    }

    /** Doctor (assigned) or admin: CONFIRMED → COMPLETED. */
    @PatchMapping("/{id}/complete")
    public AppointmentDTO complete(@PathVariable Long id, @CurrentUser CurrentUserDetails me) {
        return appointmentService.complete(id, me);
    }

    /** Patient (their own) or admin: change date/time, only if SCHEDULED|CONFIRMED. */
    @PatchMapping("/{id}/reschedule")
    public AppointmentDTO reschedule(@PathVariable Long id,
                                     @Valid @RequestBody RescheduleRequest req,
                                     @CurrentUser CurrentUserDetails me) {
        return appointmentService.reschedule(id, req, me);
    }

    /** Admin only — only CANCELLED or COMPLETED rows can be deleted. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @CurrentUser CurrentUserDetails me) {
        appointmentService.delete(id, me);
        return ResponseEntity.noContent().build();
    }
}
