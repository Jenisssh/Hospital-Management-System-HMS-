package com.hms.auth.seed;

import com.hms.auth.entity.Role;
import com.hms.auth.entity.User;
import com.hms.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds a single bootstrap admin if no admin exists yet.
 * Patient/doctor seeding lives in patient-service / doctor-service in Phase 11.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.existsByRole(Role.ADMIN)) {
            log.info("Admin user already exists — skipping seed");
            return;
        }
        User admin = User.builder()
                .username("admin")
                .passwordHash(passwordEncoder.encode("admin123"))
                .role(Role.ADMIN)
                .build();
        userRepository.save(admin);
        log.info("Seeded bootstrap admin: username=admin, password=admin123");
    }
}
