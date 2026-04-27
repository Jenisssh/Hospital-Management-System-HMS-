package com.hms.auth.client;

import com.hms.auth.client.dto.PatientCreatePayload;
import com.hms.auth.client.dto.PatientResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(
        name = "patient-service",
        configuration = SystemAdminFeignConfig.class
)
public interface PatientServiceClient {

    @PostMapping("/patients")
    PatientResponse createPatient(@RequestBody PatientCreatePayload payload);
}
