package com.hms.appointment.security;

public record CurrentUserDetails(String username, Role role, Long userId, Long linkedId) {

    public boolean isAdmin() { return role == Role.ADMIN; }
    public boolean isPatient() { return role == Role.PATIENT; }
    public boolean isDoctor() { return role == Role.DOCTOR; }
}
