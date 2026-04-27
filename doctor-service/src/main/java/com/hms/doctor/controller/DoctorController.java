package com.hms.doctor.controller;

import com.hms.doctor.dto.DoctorCreateRequest;
import com.hms.doctor.dto.DoctorDTO;
import com.hms.doctor.dto.DoctorUpdateRequest;
import com.hms.doctor.exception.ForbiddenException;
import com.hms.doctor.security.CurrentUser;
import com.hms.doctor.security.CurrentUserDetails;
import com.hms.doctor.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    /** Admin only. Phase 6 will additionally add internal Feign hook. */
    @PostMapping
    public ResponseEntity<DoctorDTO> create(
            @Valid @RequestBody DoctorCreateRequest req,
            @CurrentUser CurrentUserDetails me) {
        requireAdmin(me, "Only admins can create doctors");
        return ResponseEntity.status(HttpStatus.CREATED).body(doctorService.create(req));
    }

    /** Open to all authenticated users — patients pick a doctor when booking. */
    @GetMapping
    public List<DoctorDTO> findAll() {
        return doctorService.findAll();
    }

    /** The currently logged-in doctor's own record. */
    @GetMapping("/me")
    public DoctorDTO me(@CurrentUser CurrentUserDetails me) {
        return doctorService.findByUserId(me.userId());
    }

    /** Open to all authenticated users. */
    @GetMapping("/{id}")
    public DoctorDTO findById(@PathVariable Long id) {
        return doctorService.findById(id);
    }

    /** Admin or the doctor themselves. */
    @PutMapping("/{id}")
    public DoctorDTO update(@PathVariable Long id,
                            @Valid @RequestBody DoctorUpdateRequest req,
                            @CurrentUser CurrentUserDetails me) {
        if (!me.isAdmin() && !me.ownsDoctor(id)) {
            throw new ForbiddenException("You can only update your own doctor record");
        }
        return doctorService.update(id, req);
    }

    /** Admin only. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @CurrentUser CurrentUserDetails me) {
        requireAdmin(me, "Only admins can delete doctors");
        doctorService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private static void requireAdmin(CurrentUserDetails me, String message) {
        if (!me.isAdmin()) {
            throw new ForbiddenException(message);
        }
    }
}
