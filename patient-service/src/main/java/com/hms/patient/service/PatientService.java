package com.hms.patient.service;

import com.hms.patient.dto.PatientCreateRequest;
import com.hms.patient.dto.PatientDTO;
import com.hms.patient.dto.PatientUpdateRequest;
import com.hms.patient.entity.Patient;
import com.hms.patient.exception.PatientNotFoundException;
import com.hms.patient.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;

    @CacheEvict(value = "patients", allEntries = true)
    @Transactional
    public PatientDTO create(PatientCreateRequest req) {
        Patient p = Patient.builder()
                .userId(req.getUserId())
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .gender(req.getGender())
                .dateOfBirth(req.getDateOfBirth())
                .phoneNumber(req.getPhoneNumber())
                .build();
        Patient saved = patientRepository.save(p);
        log.info("Patient created: id={}, userId={}", saved.getId(), saved.getUserId());
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<PatientDTO> findAll() {
        return patientRepository.findAll().stream().map(this::toDto).toList();
    }

    @Cacheable(value = "patients", key = "'id:' + #id")
    @Transactional(readOnly = true)
    public PatientDTO findById(Long id) {
        return toDto(loadOrThrow(id));
    }

    @Cacheable(value = "patients", key = "'user:' + #userId")
    @Transactional(readOnly = true)
    public PatientDTO findByUserId(Long userId) {
        Patient p = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new PatientNotFoundException(
                        "No patient linked to userId: " + userId));
        return toDto(p);
    }

    @CacheEvict(value = "patients", allEntries = true)
    @Transactional
    public PatientDTO update(Long id, PatientUpdateRequest req) {
        Patient p = loadOrThrow(id);
        if (req.getFirstName() != null) p.setFirstName(req.getFirstName());
        if (req.getLastName() != null) p.setLastName(req.getLastName());
        if (req.getGender() != null) p.setGender(req.getGender());
        if (req.getDateOfBirth() != null) p.setDateOfBirth(req.getDateOfBirth());
        if (req.getPhoneNumber() != null) p.setPhoneNumber(req.getPhoneNumber());
        log.info("Patient updated: id={}", id);
        return toDto(patientRepository.save(p));
    }

    @CacheEvict(value = "patients", allEntries = true)
    @Transactional
    public void delete(Long id) {
        if (!patientRepository.existsById(id)) {
            throw new PatientNotFoundException(id);
        }
        patientRepository.deleteById(id);
        log.info("Patient deleted: id={}", id);
    }

    private Patient loadOrThrow(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new PatientNotFoundException(id));
    }

    private PatientDTO toDto(Patient p) {
        return PatientDTO.builder()
                .id(p.getId())
                .userId(p.getUserId())
                .firstName(p.getFirstName())
                .lastName(p.getLastName())
                .gender(p.getGender())
                .dateOfBirth(p.getDateOfBirth())
                .phoneNumber(p.getPhoneNumber())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
