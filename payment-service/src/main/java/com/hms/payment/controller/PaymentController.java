package com.hms.payment.controller;

import com.hms.payment.dto.PaymentDTO;
import com.hms.payment.dto.ProcessPaymentRequest;
import com.hms.payment.security.CurrentUser;
import com.hms.payment.security.CurrentUserDetails;
import com.hms.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<PaymentDTO> process(
            @Valid @RequestBody ProcessPaymentRequest req,
            @CurrentUser CurrentUserDetails me) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.process(req, me));
    }

    @GetMapping
    public List<PaymentDTO> list(@CurrentUser CurrentUserDetails me) {
        return paymentService.findVisible(me);
    }

    @GetMapping("/{id}")
    public PaymentDTO findById(@PathVariable Long id, @CurrentUser CurrentUserDetails me) {
        return paymentService.findVisibleById(id, me);
    }

    @GetMapping("/appointment/{appointmentId}")
    public List<PaymentDTO> findByAppointmentId(
            @PathVariable Long appointmentId,
            @CurrentUser CurrentUserDetails me) {
        return paymentService.findByAppointmentId(appointmentId, me);
    }

    @PostMapping("/{id}/refund")
    public PaymentDTO refund(@PathVariable Long id, @CurrentUser CurrentUserDetails me) {
        return paymentService.refund(id, me);
    }
}
