package com.hms.auth.dto;

import com.hms.auth.entity.DepartmentName;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class DoctorRegisterRequest {

    @NotBlank(message = "Username is required")
    @Pattern(regexp = "^[a-zA-Z0-9._-]{3,50}$",
            message = "Username must be 3-50 chars, letters/digits/._- only")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100, message = "Password must be at least 6 characters")
    private String password;

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
