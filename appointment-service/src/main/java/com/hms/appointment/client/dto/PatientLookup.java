package com.hms.appointment.client.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientLookup {
    private Long id;
    private Long userId;
    private String firstName;
    private String lastName;
}
