package com.viralfood.authservice.controller;

import java.security.Principal;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.viralfood.authservice.dto.Structures.ChangePasswordRequest;
import com.viralfood.authservice.dto.Structures.ConfirmEmailChangeRequest;
import com.viralfood.authservice.dto.Structures.CreateAdminRequest;
import com.viralfood.authservice.dto.Structures.ForgotPasswordRequest;
import com.viralfood.authservice.dto.Structures.LoginRequest;
import com.viralfood.authservice.dto.Structures.RequestEmailChangeRequest;
import com.viralfood.authservice.dto.Structures.ResetPasswordRequest;
import com.viralfood.authservice.entity.AdminUser;
import com.viralfood.authservice.service.AuthService;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/admins")
    public ResponseEntity<List<AdminUser>> getAllAdmins() {
        return authService.getAllAdmins();
    }

    @PostMapping("/admins")
    public ResponseEntity<?> createAdmin(@RequestBody CreateAdminRequest request) {
        return authService.createAdmin(request);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        return authService.forgotPassword(request);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        return authService.resetPassword(request);
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        return authService.changePassword(request);
    }

    @PostMapping("/request-email-change")
    public ResponseEntity<?> requestEmailChange(@RequestBody RequestEmailChangeRequest request) {
        return authService.requestEmailChange(request);
    }

    @PostMapping("/confirm-email-change")
    public ResponseEntity<?> confirmEmailChange(@RequestBody ConfirmEmailChangeRequest request) {
        return authService.confirmEmailChange(request);
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        return authService.getCurrentUser(principal.getName());
    }
}