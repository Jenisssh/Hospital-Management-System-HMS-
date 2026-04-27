package com.hms.doctor.dto;

import com.hms.doctor.entity.DepartmentName;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class DoctorUpdateRequest {

    private String firstName;
    private String lastName;
    private String specialization;

    @Pattern(regexp = "^[6-9]\\d{9}$",
            message = "Phone must be a valid 10-digit Indian mobile number")
    private String phoneNumber;

    private DepartmentName department;
}
