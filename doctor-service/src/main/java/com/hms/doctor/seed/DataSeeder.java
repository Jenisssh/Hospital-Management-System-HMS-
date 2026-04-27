package com.hms.doctor.seed;

import com.hms.doctor.entity.Department;
import com.hms.doctor.entity.DepartmentName;
import com.hms.doctor.entity.Doctor;
import com.hms.doctor.repository.DepartmentRepository;
import com.hms.doctor.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/**
 * Seeds all 10 departments + 14 demo doctors on first startup. None are linked
 * to a User — an admin can link them via Doctors page, or doctors register
 * via /auth/register/doctor which creates their own linked record.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final DepartmentRepository departmentRepository;
    private final DoctorRepository doctorRepository;

    @Override
    public void run(String... args) {
        Map<DepartmentName, Department> depts = seedDepartments();
        seedDoctors(depts);
    }

    private Map<DepartmentName, Department> seedDepartments() {
        Map<DepartmentName, Department> result = new EnumMap<>(DepartmentName.class);
        int created = 0;
        for (DepartmentName name : DepartmentName.values()) {
            Department d = departmentRepository.findByName(name).orElseGet(() ->
                    departmentRepository.save(Department.builder().name(name).build()));
            result.put(name, d);
            if (d.getId() != null && departmentRepository.findByName(name).isPresent()) {
                // counted only-if newly created via "save" path
            }
        }
        if (departmentRepository.count() > 0) {
            log.info("Department seed: {} departments present", departmentRepository.count());
        }
        return result;
    }

    private void seedDoctors(Map<DepartmentName, Department> depts) {
        if (doctorRepository.count() > 0) {
            log.info("Doctor seed skipped — table already has data");
            return;
        }

        List<Doctor> doctors = List.of(
                build("Robert", "Smith", "Interventional Cardiologist", "9811112221", depts.get(DepartmentName.CARDIOLOGY)),
                build("Anjali", "Desai", "Cardiac Surgeon", "9811112222", depts.get(DepartmentName.CARDIOLOGY)),
                build("Priya", "Patel", "Neurologist", "9822223332", depts.get(DepartmentName.NEUROLOGY)),
                build("Rohan", "Mehta", "Neurosurgeon", "9822223333", depts.get(DepartmentName.NEUROLOGY)),
                build("Vinod", "Kulkarni", "Orthopedic Surgeon", "9866667771", depts.get(DepartmentName.ORTHOPEDICS)),
                build("Amit", "Joshi", "Pediatrician", "9833334443", depts.get(DepartmentName.PEDIATRICS)),
                build("Neha", "Bhatia", "Pediatric Specialist", "9833334444", depts.get(DepartmentName.PEDIATRICS)),
                build("Kavya", "Rao", "Dermatologist", "9877778881", depts.get(DepartmentName.DERMATOLOGY)),
                build("Sara", "Khan", "General Physician", "9844445554", depts.get(DepartmentName.GENERAL_MEDICINE)),
                build("Manish", "Gupta", "Family Medicine", "9844445555", depts.get(DepartmentName.GENERAL_MEDICINE)),
                build("Divya", "Menon", "Gynecologist", "9855556661", depts.get(DepartmentName.GYNECOLOGY)),
                build("Arvind", "Saxena", "Oncologist", "9888889991", depts.get(DepartmentName.ONCOLOGY)),
                build("Suresh", "Iyer", "Radiologist", "9899990001", depts.get(DepartmentName.RADIOLOGY)),
                build("Farah", "Ahmed", "Emergency Physician", "9800001111", depts.get(DepartmentName.EMERGENCY))
        );
        doctorRepository.saveAll(doctors);
        log.info("Doctor seed: created {} doctors across {} departments",
                doctors.size(), depts.size());
    }

    private static Doctor build(String first, String last, String specialization,
                                String phone, Department department) {
        return Doctor.builder()
                .firstName(first)
                .lastName(last)
                .specialization(specialization)
                .phoneNumber(phone)
                .department(department)
                .build();
    }
}
