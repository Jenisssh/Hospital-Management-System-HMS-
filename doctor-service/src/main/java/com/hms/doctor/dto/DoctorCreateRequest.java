package com.hms.doctor.dto;

import com.hms.doctor.entity.DepartmentName;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class DoctorCreateRequest {

    /** Optional — set by Phase 6 registration when linking to a User. */
    private Long userId;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Specialization is required")
    private String specialization;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[6-9]\\d{9}$",
            message = "Phone must be a valid 10-digit Indian mobile number")
    private String phoneNumber;

    @NotNull(message = "Department is required")
    private DepartmentName department;
}
