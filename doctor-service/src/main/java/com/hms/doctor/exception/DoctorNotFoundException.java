package com.hms.doctor.exception;

public class DoctorNotFoundException extends RuntimeException {
    public DoctorNotFoundException(Long id) {
        super("Doctor not found with id: " + id);
    }

    public DoctorNotFoundException(String message) {
        super(message);
    }
}
