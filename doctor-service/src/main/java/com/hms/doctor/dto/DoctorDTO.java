package com.hms.doctor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorDTO {
    private Long id;
    private Long userId;
    private String firstName;
    private String lastName;
    private String specialization;
    private String phoneNumber;
    private DepartmentDTO department;
    private LocalDateTime createdAt;
}
