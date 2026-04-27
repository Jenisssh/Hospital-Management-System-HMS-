package com.hms.appointment.exception;

import com.hms.appointment.entity.AppointmentStatus;

public class InvalidStatusTransitionException extends RuntimeException {
    public InvalidStatusTransitionException(AppointmentStatus from, String action) {
        super("Cannot " + action + " an appointment in status " + from);
    }
}
