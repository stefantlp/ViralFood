package com.viralfood.authservice.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.viralfood.authservice.entity.AdminUser;

@Repository
public interface AdminUserRepository extends JpaRepository<AdminUser, Integer> {
    Optional<AdminUser> findByUsername(String username);
    Optional<AdminUser> findByEmail(String email);
    Optional<AdminUser> findByResetToken(String resetToken);
    Optional<AdminUser> findByEmailChangeToken(String emailChangeToken);

    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}