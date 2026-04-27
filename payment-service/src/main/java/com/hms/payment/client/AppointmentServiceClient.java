package com.hms.payment.client;

import com.hms.payment.client.dto.AppointmentLookup;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(
        name = "appointment-service",
        configuration = SystemAdminFeignConfig.class
)
public interface AppointmentServiceClient {

    @GetMapping("/appointments/{id}")
    AppointmentLookup findById(@PathVariable("id") Long id);
}
