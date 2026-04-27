package com.hms.appointment.exception;

import java.time.LocalDate;
import java.time.LocalTime;

public class SlotAlreadyBookedException extends RuntimeException {
    public SlotAlreadyBookedException(Long doctorId, LocalDate date, LocalTime time) {
        super("Doctor " + doctorId + " is already booked on " + date + " at " + time);
    }
}
