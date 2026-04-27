package com.hms.auth.client.dto;

import com.hms.auth.entity.DepartmentName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorCreatePayload {
    private Long userId;
    private String firstName;
    private String lastName;
    private String specialization;
    private String phoneNumber;
    private DepartmentName department;
}
