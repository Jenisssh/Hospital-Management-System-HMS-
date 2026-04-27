package com.hms.patient.security;

/**
 * Authenticated caller, populated from headers added by api-gateway:
 *   X-Username, X-Role, X-User-Id, X-Linked-Id.
 */
public record CurrentUserDetails(String username, Role role, Long userId, Long linkedId) {

    public boolean isAdmin() {
        return role == Role.ADMIN;
    }

    public boolean isPatient() {
        return role == Role.PATIENT;
    }

    public boolean ownsPatient(Long patientId) {
        return linkedId != null && linkedId.equals(patientId);
    }
}
