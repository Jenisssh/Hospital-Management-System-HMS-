package com.hms.payment.exception;

public class AlreadyPaidException extends RuntimeException {
    public AlreadyPaidException(Long appointmentId) {
        super("Appointment " + appointmentId + " is already paid");
    }
}
