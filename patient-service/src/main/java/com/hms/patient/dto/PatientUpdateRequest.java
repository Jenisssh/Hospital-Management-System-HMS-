package com.hms.patient.dto;

import com.hms.patient.entity.Gender;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalDate;

/** All fields optional — only non-null values are applied. */
@Data
public class PatientUpdateRequest {

    private String firstName;
    private String lastName;
    private Gender gender;

    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    @Pattern(regexp = "^[6-9]\\d{9}$",
            message = "Phone must be a valid 10-digit Indian mobile number")
    private String phoneNumber;
}
