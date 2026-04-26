package com.viralfood.authservice.dto;

import lombok.Getter;
import lombok.Setter;

public class Structures {

    @Getter
    @Setter
    public static class LoginRequest {
        private String username;
        private String password;
    }

    @Getter
    @Setter
    public static class CreateAdminRequest {
        private String username;
        private String email;
        private String password;
    }

    @Getter
    @Setter
    public static class ForgotPasswordRequest {
        private String email;
    }

    @Getter
    @Setter
    public static class ResetPasswordRequest {
        private String token;
        private String newPassword;
    }

    @Getter
    @Setter
    public static class ChangePasswordRequest {
        private String username;
        private String currentPassword;
        private String newPassword;
    }

    @Getter
    @Setter
    public static class RequestEmailChangeRequest {
        private String username;
        private String newEmail;
    }

    @Getter
    @Setter
    public static class ConfirmEmailChangeRequest {
        private String token;
    }

    @Getter
    @Setter
    public static class LoginResponse {
        private String message;
        private String username;
        private String email;
        private String token;
    }
}