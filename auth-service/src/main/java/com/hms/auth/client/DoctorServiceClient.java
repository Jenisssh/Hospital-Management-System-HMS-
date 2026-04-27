package com.hms.auth.client;

import com.hms.auth.client.dto.DoctorCreatePayload;
import com.hms.auth.client.dto.DoctorResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(
        name = "doctor-service",
        configuration = SystemAdminFeignConfig.class
)
public interface DoctorServiceClient {

    @PostMapping("/doctors")
    DoctorResponse createDoctor(@RequestBody DoctorCreatePayload payload);
}
