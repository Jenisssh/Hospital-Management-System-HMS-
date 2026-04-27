package com.hms.payment.repository;

import com.hms.payment.entity.Payment;
import com.hms.payment.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByPatientIdOrderByCreatedAtDesc(Long patientId);

    List<Payment> findByAppointmentIdOrderByCreatedAtDesc(Long appointmentId);

    boolean existsByAppointmentIdAndPaymentStatus(Long appointmentId, PaymentStatus status);
}
