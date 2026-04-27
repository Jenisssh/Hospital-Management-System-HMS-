package com.hms.patient.controller;

import com.hms.patient.dto.PatientCreateRequest;
import com.hms.patient.dto.PatientDTO;
import com.hms.patient.dto.PatientUpdateRequest;
import com.hms.patient.exception.ForbiddenException;
import com.hms.patient.security.CurrentUser;
import com.hms.patient.security.CurrentUserDetails;
import com.hms.patient.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    /** Admin only. Phase 6 will add auth-service-internal calls via Feign. */
    @PostMapping
    public ResponseEntity<PatientDTO> create(
            @Valid @RequestBody PatientCreateRequest req,
            @CurrentUser CurrentUserDetails me) {
        requireAdmin(me, "Only admins can create patients");
        return ResponseEntity.status(HttpStatus.CREATED).body(patientService.create(req));
    }

    /** Admin only — full list. */
    @GetMapping
    public List<PatientDTO> findAll(@CurrentUser CurrentUserDetails me) {
        requireAdmin(me, "Only admins can list all patients");
        return patientService.findAll();
    }

    /** The currently logged-in patient's own record. */
    @GetMapping("/me")
    public PatientDTO me(@CurrentUser CurrentUserDetails me) {
        return patientService.findByUserId(me.userId());
    }

    /** Admin or the owner of the patient record. */
    @GetMapping("/{id}")
    public PatientDTO findById(@PathVariable Long id, @CurrentUser CurrentUserDetails me) {
        if (!me.isAdmin() && !me.ownsPatient(id)) {
            throw new ForbiddenException("You can only view your own patient record");
        }
        return patientService.findById(id);
    }

    /** Admin or the owner. */
    @PatchMapping("/{id}")
    public PatientDTO update(@PathVariable Long id,
                             @Valid @RequestBody PatientUpdateRequest req,
                             @CurrentUser CurrentUserDetails me) {
        if (!me.isAdmin() && !me.ownsPatient(id)) {
            throw new ForbiddenException("You can only update your own patient record");
        }
        return patientService.update(id, req);
    }

    /** Admin only. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @CurrentUser CurrentUserDetails me) {
        requireAdmin(me, "Only admins can delete patients");
        patientService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private static void requireAdmin(CurrentUserDetails me, String message) {
        if (!me.isAdmin()) {
            throw new ForbiddenException(message);
        }
    }
}
