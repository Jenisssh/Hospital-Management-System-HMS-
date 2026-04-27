package com.hms.payment.client.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentLookup {
    private Long id;
    private Long patientId;
    private Long doctorId;
    private String status;
}
