package com.hms.patient.seed;

import com.hms.patient.entity.Gender;
import com.hms.patient.entity.Patient;
import com.hms.patient.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

/**
 * Seeds 12 demo patients on first startup. None are linked to a User —
 * an admin can link them via Patients page, OR a self-registered patient
 * gets their own row created via the linked-registration flow (Phase 6).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final PatientRepository patientRepository;

    @Override
    public void run(String... args) {
        if (patientRepository.count() > 0) {
            log.info("Patient seed skipped — table already has data");
            return;
        }

        List<Patient> patients = List.of(
                build("John", "Doe", Gender.MALE, "1990-05-15", "9876543210"),
                build("Jane", "Smith", Gender.FEMALE, "1985-08-22", "9123456789"),
                build("Alex", "Patel", Gender.OTHER, "2000-01-10", "9988776655"),
                build("Rahul", "Sharma", Gender.MALE, "1978-03-05", "9811223344"),
                build("Anita", "Verma", Gender.FEMALE, "1992-11-30", "9822334455"),
                build("Vikram", "Singh", Gender.MALE, "1965-07-18", "9833445566"),
                build("Sneha", "Iyer", Gender.FEMALE, "1996-04-12", "9844556677"),
                build("Karan", "Mehta", Gender.MALE, "2010-09-25", "9855667788"),
                build("Pooja", "Reddy", Gender.FEMALE, "1988-01-07", "9866778899"),
                build("Arjun", "Nair", Gender.MALE, "1972-12-19", "9877889900"),
                build("Meera", "Kapoor", Gender.FEMALE, "2005-06-03", "9888990011"),
                build("Sam", "Taylor", Gender.OTHER, "1999-10-28", "9899001122")
        );
        patientRepository.saveAll(patients);
        log.info("Patient seed: created {} patients", patients.size());
    }

    private static Patient build(String first, String last, Gender gender, String dob, String phone) {
        return Patient.builder()
                .firstName(first)
                .lastName(last)
                .gender(gender)
                .dateOfBirth(LocalDate.parse(dob))
                .phoneNumber(phone)
                .build();
    }
}
