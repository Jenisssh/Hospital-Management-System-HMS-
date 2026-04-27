package com.hms.auth.service;

import com.hms.auth.client.DoctorServiceClient;
import com.hms.auth.client.PatientServiceClient;
import com.hms.auth.client.dto.DoctorCreatePayload;
import com.hms.auth.client.dto.DoctorResponse;
import com.hms.auth.client.dto.PatientCreatePayload;
import com.hms.auth.client.dto.PatientResponse;
import com.hms.auth.dto.AuthResponse;
import com.hms.auth.dto.DoctorRegisterRequest;
import com.hms.auth.dto.LoginRequest;
import com.hms.auth.dto.PatientRegisterRequest;
import com.hms.auth.dto.RegisterRequest;
import com.hms.auth.entity.Role;
import com.hms.auth.entity.User;
import com.hms.auth.exception.DownstreamServiceException;
import com.hms.auth.exception.InvalidCredentialsException;
import com.hms.auth.exception.UsernameAlreadyExistsException;
import com.hms.auth.repository.UserRepository;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final PatientServiceClient patientServiceClient;
    private final DoctorServiceClient doctorServiceClient;

    /** Generic register — used for ADMIN bootstrap. No linked profile created. */
    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByUsername(req.getUsername())) {
            throw new UsernameAlreadyExistsException(req.getUsername());
        }
        User user = User.builder()
                .username(req.getUsername())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .role(req.getRole())
                .build();
        user = userRepository.save(user);
        log.info("Registered user (no link): {} ({})", user.getUsername(), user.getRole());
        return buildAuthResponse(user);
    }

    /**
     * One-step patient registration:
     *  1. Create User (role=PATIENT)
     *  2. Call patient-service via Feign to create the linked Patient row
     *  3. Update User.linkedId = patient.id
     *  4. Issue JWT with linkedId populated
     *
     * If step 2 fails (FeignException), @Transactional rolls back the User
     * before the DownstreamServiceException propagates — no orphan rows.
     */
    @Transactional
    public AuthResponse registerPatient(PatientRegisterRequest req) {
        if (userRepository.existsByUsername(req.getUsername())) {
            throw new UsernameAlreadyExistsException(req.getUsername());
        }

        User user = userRepository.save(User.builder()
                .username(req.getUsername())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .role(Role.PATIENT)
                .build());

        PatientResponse patient;
        try {
            patient = patientServiceClient.createPatient(PatientCreatePayload.builder()
                    .userId(user.getId())
                    .firstName(req.getFirstName())
                    .lastName(req.getLastName())
                    .gender(req.getGender())
                    .dateOfBirth(req.getDateOfBirth())
                    .phoneNumber(req.getPhoneNumber())
                    .build());
        } catch (FeignException e) {
            throw new DownstreamServiceException(
                    "Failed to create patient profile: " + e.getMessage(), e);
        }

        user.setLinkedId(patient.getId());
        user = userRepository.save(user);
        log.info("Registered patient {} (userId={}, patientId={})",
                user.getUsername(), user.getId(), patient.getId());

        return buildAuthResponse(user);
    }

    /** One-step doctor registration. Same saga pattern as registerPatient. */
    @Transactional
    public AuthResponse registerDoctor(DoctorRegisterRequest req) {
        if (userRepository.existsByUsername(req.getUsername())) {
            throw new UsernameAlreadyExistsException(req.getUsername());
        }

        User user = userRepository.save(User.builder()
                .username(req.getUsername())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .role(Role.DOCTOR)
                .build());

        DoctorResponse doctor;
        try {
            doctor = doctorServiceClient.createDoctor(DoctorCreatePayload.builder()
                    .userId(user.getId())
                    .firstName(req.getFirstName())
                    .lastName(req.getLastName())
                    .specialization(req.getSpecialization())
                    .phoneNumber(req.getPhoneNumber())
                    .department(req.getDepartment())
                    .build());
        } catch (FeignException e) {
            throw new DownstreamServiceException(
                    "Failed to create doctor profile: " + e.getMessage(), e);
        }

        user.setLinkedId(doctor.getId());
        user = userRepository.save(user);
        log.info("Registered doctor {} (userId={}, doctorId={})",
                user.getUsername(), user.getId(), doctor.getId());

        return buildAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByUsername(req.getUsername())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid username or password"));
        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid username or password");
        }
        log.info("User logged in: {}", user.getUsername());
        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        return AuthResponse.builder()
                .token(jwtService.generateToken(user))
                .userId(user.getId())
                .username(user.getUsername())
                .role(user.getRole())
                .linkedId(user.getLinkedId())
                .build();
    }
}
