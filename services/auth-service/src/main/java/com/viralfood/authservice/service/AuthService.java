package com.viralfood.authservice.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.viralfood.authservice.client.MailClient;
import com.viralfood.authservice.dto.Structures;
import com.viralfood.authservice.dto.Structures.ChangePasswordRequest;
import com.viralfood.authservice.dto.Structures.ConfirmEmailChangeRequest;
import com.viralfood.authservice.dto.Structures.CreateAdminRequest;
import com.viralfood.authservice.dto.Structures.ForgotPasswordRequest;
import com.viralfood.authservice.dto.Structures.LoginRequest;
import com.viralfood.authservice.dto.Structures.RequestEmailChangeRequest;
import com.viralfood.authservice.dto.Structures.ResetPasswordRequest;
import com.viralfood.authservice.entity.AdminUser;
import com.viralfood.authservice.repository.AdminUserRepository;

@Service
public class AuthService {

    private static final String INVALID_CREDENTIALS_MESSAGE = "Invalid username or password";
    private static final String DUMMY_BCRYPT_HASH =
            "$2a$10$7EqJtq98hPqEX7fNZaFWoOHi6M1s9m6V0w8AV/QXpVZl8vLwTkxOe";

    private final AdminUserRepository adminUserRepository;
    private final MailClient mailClient;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthService(AdminUserRepository adminUserRepository,
                       MailClient mailClient,
                       JwtService jwtService) {
        this.adminUserRepository = adminUserRepository;
        this.mailClient = mailClient;
        this.jwtService = jwtService;
    }

    public ResponseEntity<List<AdminUser>> getAllAdmins() {
        return ResponseEntity.ok(adminUserRepository.findAll());
    }

    public ResponseEntity<?> getCurrentUser(String username) {
        Optional<AdminUser> optionalAdminUser = adminUserRepository.findByUsername(username);

        if (optionalAdminUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
        }

        AdminUser adminUser = optionalAdminUser.get();

        return ResponseEntity.ok(Map.of(
                "username", adminUser.getUsername(),
                "email", adminUser.getEmail(),
                "isActive", adminUser.getIsActive(),
                "createdAt", adminUser.getCreatedAt()
        ));
    }

    public ResponseEntity<?> createAdmin(CreateAdminRequest request) {
        if (request.getUsername() == null || request.getUsername().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username is required"));
        }

        if (request.getEmail() == null || request.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }

        if (request.getPassword() == null || request.getPassword().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password is required"));
        }

        if (request.getPassword().length() < 8) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Password must be at least 8 characters long"));
        }

        if (adminUserRepository.existsByUsername(request.getUsername().trim())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Username already exists"));
        }

        if (adminUserRepository.existsByEmail(request.getEmail().trim())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Email already exists"));
        }

        AdminUser adminUser = new AdminUser();
        adminUser.setUsername(request.getUsername().trim());
        adminUser.setEmail(request.getEmail().trim());
        adminUser.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        adminUser.setIsActive(true);

        return ResponseEntity.status(HttpStatus.CREATED).body(adminUserRepository.save(adminUser));
    }

    public ResponseEntity<?> login(LoginRequest request) {
        if (request.getUsername() == null || request.getUsername().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username is required"));
        }

        if (request.getPassword() == null || request.getPassword().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password is required"));
        }

        Optional<AdminUser> optionalAdminUser = adminUserRepository.findByUsername(request.getUsername().trim());

        if (optionalAdminUser.isEmpty()) {
            passwordEncoder.matches(request.getPassword(), DUMMY_BCRYPT_HASH);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", INVALID_CREDENTIALS_MESSAGE));
        }

        AdminUser adminUser = optionalAdminUser.get();

        if (Boolean.FALSE.equals(adminUser.getIsActive())) {
            passwordEncoder.matches(request.getPassword(), adminUser.getPasswordHash());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", INVALID_CREDENTIALS_MESSAGE));
        }

        if (!passwordEncoder.matches(request.getPassword(), adminUser.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", INVALID_CREDENTIALS_MESSAGE));
        }

        var userDetails = org.springframework.security.core.userdetails.User
                .withUsername(adminUser.getUsername())
                .password(adminUser.getPasswordHash())
                .authorities("ROLE_ADMIN")
                .build();

        String token = jwtService.generateToken(userDetails);

        Structures.LoginResponse response = new Structures.LoginResponse();
        response.setMessage("Login successful");
        response.setUsername(adminUser.getUsername());
        response.setEmail(adminUser.getEmail());
        response.setToken(token);

        return ResponseEntity.ok(response);
    }

    public ResponseEntity<?> forgotPassword(ForgotPasswordRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }

        Optional<AdminUser> optionalAdminUser = adminUserRepository.findByEmail(request.getEmail().trim());

        if (optionalAdminUser.isPresent()) {
            AdminUser adminUser = optionalAdminUser.get();
            String token = UUID.randomUUID().toString();

            adminUser.setResetToken(token);
            adminUser.setResetTokenExpiresAt(LocalDateTime.now().plusMinutes(30));
            adminUserRepository.save(adminUser);

            mailClient.sendResetPasswordEmail(adminUser.getEmail(), token);
        }

        return ResponseEntity.ok(Map.of(
                "message", "If the email exists, a reset link has been sent"
        ));
    }

    public ResponseEntity<?> resetPassword(ResetPasswordRequest request) {
        if (request.getToken() == null || request.getToken().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Token is required"));
        }

        if (request.getNewPassword() == null || request.getNewPassword().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "New password is required"));
        }

        if (request.getNewPassword().length() < 8) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Password must be at least 8 characters long"));
        }

        Optional<AdminUser> optionalAdminUser = adminUserRepository.findByResetToken(request.getToken().trim());

        if (optionalAdminUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Invalid or expired token"));
        }

        AdminUser adminUser = optionalAdminUser.get();

        if (adminUser.getResetTokenExpiresAt() == null ||
                adminUser.getResetTokenExpiresAt().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Invalid or expired token"));
        }

        adminUser.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        adminUser.setResetToken(null);
        adminUser.setResetTokenExpiresAt(null);
        adminUserRepository.save(adminUser);

        return ResponseEntity.ok(Map.of("message", "Password reset successful"));
    }

    public ResponseEntity<?> changePassword(ChangePasswordRequest request) {
        if (request.getUsername() == null || request.getUsername().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username is required"));
        }

        if (request.getCurrentPassword() == null || request.getCurrentPassword().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Current password is required"));
        }

        if (request.getNewPassword() == null || request.getNewPassword().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "New password is required"));
        }

        if (request.getNewPassword().length() < 8) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Password must be at least 8 characters long"));
        }

        Optional<AdminUser> optionalAdminUser = adminUserRepository.findByUsername(request.getUsername().trim());

        if (optionalAdminUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", INVALID_CREDENTIALS_MESSAGE));
        }

        AdminUser adminUser = optionalAdminUser.get();

        if (!passwordEncoder.matches(request.getCurrentPassword(), adminUser.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", INVALID_CREDENTIALS_MESSAGE));
        }

        adminUser.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        adminUserRepository.save(adminUser);

        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    public ResponseEntity<?> requestEmailChange(RequestEmailChangeRequest request) {
        if (request.getUsername() == null || request.getUsername().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username is required"));
        }

        if (request.getNewEmail() == null || request.getNewEmail().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "New email is required"));
        }

        Optional<AdminUser> optionalAdminUser = adminUserRepository.findByUsername(request.getUsername().trim());

        if (optionalAdminUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
        }

        if (adminUserRepository.existsByEmail(request.getNewEmail().trim())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Email already exists"));
        }

        AdminUser adminUser = optionalAdminUser.get();
        String token = UUID.randomUUID().toString();

        adminUser.setPendingEmail(request.getNewEmail().trim());
        adminUser.setEmailChangeToken(token);
        adminUser.setEmailChangeTokenExpiresAt(LocalDateTime.now().plusMinutes(30));
        adminUserRepository.save(adminUser);

        mailClient.sendEmailChangeConfirmation(adminUser.getPendingEmail(), token);

        return ResponseEntity.ok(Map.of("message", "Email change confirmation sent"));
    }

    public ResponseEntity<?> confirmEmailChange(ConfirmEmailChangeRequest request) {
        if (request.getToken() == null || request.getToken().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Token is required"));
        }

        Optional<AdminUser> optionalAdminUser =
                adminUserRepository.findByEmailChangeToken(request.getToken().trim());

        if (optionalAdminUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Invalid or expired token"));
        }

        AdminUser adminUser = optionalAdminUser.get();

        if (adminUser.getEmailChangeTokenExpiresAt() == null ||
                adminUser.getEmailChangeTokenExpiresAt().isBefore(LocalDateTime.now()) ||
                adminUser.getPendingEmail() == null ||
                adminUser.getPendingEmail().isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Invalid or expired token"));
        }

        adminUser.setEmail(adminUser.getPendingEmail());
        adminUser.setPendingEmail(null);
        adminUser.setEmailChangeToken(null);
        adminUser.setEmailChangeTokenExpiresAt(null);
        adminUserRepository.save(adminUser);

        return ResponseEntity.ok(Map.of("message", "Email changed successfully"));
    }
}