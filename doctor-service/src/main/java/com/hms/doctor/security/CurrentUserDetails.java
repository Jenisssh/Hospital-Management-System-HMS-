package com.hms.doctor.security;

public record CurrentUserDetails(String username, Role role, Long userId, Long linkedId) {

    public boolean isAdmin() {
        return role == Role.ADMIN;
    }

    public boolean isDoctor() {
        return role == Role.DOCTOR;
    }

    public boolean ownsDoctor(Long doctorId) {
        return linkedId != null && linkedId.equals(doctorId);
    }
}
