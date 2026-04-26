package com.viralfood.authservice.client;

import org.springframework.stereotype.Component;

@Component
public class MailClient {

    public void sendResetPasswordEmail(String email, String token) {
        System.out.println("RESET PASSWORD EMAIL");
        System.out.println("To: " + email);
        System.out.println("Token: " + token);
        System.out.println("Link: http://localhost:3000/reset-password?token=" + token);
    }

    public void sendEmailChangeConfirmation(String email, String token) {
        System.out.println("EMAIL CHANGE CONFIRMATION");
        System.out.println("To: " + email);
        System.out.println("Token: " + token);
        System.out.println("Link: http://localhost:3000/confirm-email-change?token=" + token);
    }
}