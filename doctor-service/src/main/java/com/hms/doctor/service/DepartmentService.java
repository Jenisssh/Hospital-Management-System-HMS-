package com.hms.doctor.service;

import com.hms.doctor.dto.DepartmentDTO;
import com.hms.doctor.entity.Department;
import com.hms.doctor.entity.DepartmentName;
import com.hms.doctor.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    // List caching disabled — see DoctorService.findAll() comment.
    @Transactional(readOnly = true)
    public List<DepartmentDTO> findAll() {
        return departmentRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    /** Idempotent — fetches existing or creates the row for the given enum value. */
    @CacheEvict(value = "departments", allEntries = true)
    @Transactional
    public Department getOrCreate(DepartmentName name) {
        return departmentRepository.findByName(name).orElseGet(() ->
                departmentRepository.save(Department.builder().name(name).build()));
    }

    public DepartmentDTO toDto(Department d) {
        return DepartmentDTO.builder().id(d.getId()).name(d.getName()).build();
    }
}
