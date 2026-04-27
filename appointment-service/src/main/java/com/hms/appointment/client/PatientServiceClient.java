package com.hms.appointment.client;

import com.hms.appointment.client.dto.PatientLookup;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(
        name = "patient-service",
        configuration = SystemAdminFeignConfig.class
)
public interface PatientServiceClient {

    @GetMapping("/patients/{id}")
    PatientLookup findById(@PathVariable("id") Long id);
}
