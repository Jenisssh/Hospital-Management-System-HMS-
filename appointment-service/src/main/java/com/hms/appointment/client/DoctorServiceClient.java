package com.hms.appointment.client;

import com.hms.appointment.client.dto.DoctorLookup;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(
        name = "doctor-service",
        configuration = SystemAdminFeignConfig.class
)
public interface DoctorServiceClient {

    @GetMapping("/doctors/{id}")
    DoctorLookup findById(@PathVariable("id") Long id);
}
