package com.hms.doctor.controller;

import com.hms.doctor.dto.DepartmentDTO;
import com.hms.doctor.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    /** Open to all authenticated users — used by the doctor form dropdown. */
    @GetMapping
    public List<DepartmentDTO> findAll() {
        return departmentService.findAll();
    }
}
