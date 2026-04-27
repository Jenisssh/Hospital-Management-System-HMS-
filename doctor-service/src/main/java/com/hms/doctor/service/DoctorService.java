package com.hms.doctor.service;

import com.hms.doctor.dto.DoctorCreateRequest;
import com.hms.doctor.dto.DoctorDTO;
import com.hms.doctor.dto.DoctorUpdateRequest;
import com.hms.doctor.entity.Department;
import com.hms.doctor.entity.Doctor;
import com.hms.doctor.exception.DoctorNotFoundException;
import com.hms.doctor.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final DepartmentService departmentService;

    @CacheEvict(value = "doctors", allEntries = true)
    @Transactional
    public DoctorDTO create(DoctorCreateRequest req) {
        Department dept = departmentService.getOrCreate(req.getDepartment());
        Doctor d = Doctor.builder()
                .userId(req.getUserId())
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .specialization(req.getSpecialization())
                .phoneNumber(req.getPhoneNumber())
                .department(dept)
                .build();
        Doctor saved = doctorRepository.save(d);
        log.info("Doctor created: id={}, userId={}", saved.getId(), saved.getUserId());
        return toDto(saved);
    }

    // List caching disabled — GenericJackson2JsonRedisSerializer + WRAPPER_ARRAY default
    // typing doesn't round-trip List<DTO> reliably. Per-id lookups stay cached.
    @Transactional(readOnly = true)
    public List<DoctorDTO> findAll() {
        return doctorRepository.findAll().stream().map(this::toDto).toList();
    }

    @Cacheable(value = "doctors", key = "'id:' + #id")
    @Transactional(readOnly = true)
    public DoctorDTO findById(Long id) {
        return toDto(loadOrThrow(id));
    }

    @Cacheable(value = "doctors", key = "'user:' + #userId")
    @Transactional(readOnly = true)
    public DoctorDTO findByUserId(Long userId) {
        Doctor d = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new DoctorNotFoundException(
                        "No doctor linked to userId: " + userId));
        return toDto(d);
    }

    @CacheEvict(value = "doctors", allEntries = true)
    @Transactional
    public DoctorDTO update(Long id, DoctorUpdateRequest req) {
        Doctor d = loadOrThrow(id);
        if (req.getFirstName() != null) d.setFirstName(req.getFirstName());
        if (req.getLastName() != null) d.setLastName(req.getLastName());
        if (req.getSpecialization() != null) d.setSpecialization(req.getSpecialization());
        if (req.getPhoneNumber() != null) d.setPhoneNumber(req.getPhoneNumber());
        if (req.getDepartment() != null) {
            d.setDepartment(departmentService.getOrCreate(req.getDepartment()));
        }
        log.info("Doctor updated: id={}", id);
        return toDto(doctorRepository.save(d));
    }

    @CacheEvict(value = "doctors", allEntries = true)
    @Transactional
    public void delete(Long id) {
        if (!doctorRepository.existsById(id)) {
            throw new DoctorNotFoundException(id);
        }
        doctorRepository.deleteById(id);
        log.info("Doctor deleted: id={}", id);
    }

    private Doctor loadOrThrow(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new DoctorNotFoundException(id));
    }

    private DoctorDTO toDto(Doctor d) {
        return DoctorDTO.builder()
                .id(d.getId())
                .userId(d.getUserId())
                .firstName(d.getFirstName())
                .lastName(d.getLastName())
                .specialization(d.getSpecialization())
                .phoneNumber(d.getPhoneNumber())
                .department(departmentService.toDto(d.getDepartment()))
                .createdAt(d.getCreatedAt())
                .build();
    }
}
