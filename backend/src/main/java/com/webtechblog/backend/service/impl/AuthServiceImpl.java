package com.webtechblog.backend.service.impl;

import com.webtechblog.backend.dto.*;

import com.webtechblog.backend.entity.UserEntity;

import com.webtechblog.backend.repository.UserRepository;
import com.webtechblog.backend.entity.ProfileEntity;
import com.webtechblog.backend.repository.ProfileRepository;

import com.webtechblog.backend.security.JwtService;

import com.webtechblog.backend.service.AuthService;

import com.webtechblog.backend.service.EmailService;
import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl
        implements AuthService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;
    private final EmailService emailService;

    @Override
    @Transactional
    public void verifyEmail(String token) {

        UserEntity user = userRepository
                .findByVerificationToken(token)
                .orElseThrow(() ->
                        new RuntimeException("Invalid verification link.")
                );

        if (user.getVerificationTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Verification link has expired.");
        }

        user.setEmailVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiry(null);

        userRepository.save(user);
    }

    @Override
    @Transactional
    public void resendVerificationEmail(String email) {

        UserEntity user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found.")
                );

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new RuntimeException("Email is already verified.");
        }

        String token = UUID.randomUUID().toString();

        user.setVerificationToken(token);
        user.setVerificationTokenExpiry(LocalDateTime.now().plusHours(24));

        userRepository.save(user);

        // Non-fatal: EmailService logs and swallows send failures so a
        // flaky mail provider doesn't turn into a 400 here either.
        emailService.sendVerificationEmail(
                user.getEmail(),
                user.getUsername(),
                token
        );
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByUsername(request.username())) {
            throw new RuntimeException("Username already exists");
        }

        if (userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Email already exists");
        }

        String verificationToken = UUID.randomUUID().toString();

        UserEntity user =
                UserEntity.builder()
                        .username(request.username())
                        .email(request.email())
                        .password(passwordEncoder.encode(request.password()))
                        .profileImage("https://res.cloudinary.com/hsu6oxwy/image/upload/vxxxxxxxx/webtechblog/default/default-profile.jpg")
                        .emailVerified(false)
                        .verificationToken(verificationToken)
                        .verificationTokenExpiry(LocalDateTime.now().plusHours(24))
                        .build();

        UserEntity savedUser = userRepository.save(user);

        ProfileEntity profile =
                ProfileEntity.builder()
                        .userId(savedUser.getId())
                        .firstName(savedUser.getUsername())
                        .profileImage("https://res.cloudinary.com/hsu6oxwy/image/upload/vxxxxxxxx/webtechblog/default/default-profile.jpg")
                        .coverImage("https://res.cloudinary.com/hsu6oxwy/image/upload/vxxxxxxxx/webtechblog/default/default-cover.jpg")
                        .headline("")
                        .bio("")
                        .status(1)
                        .build();

        profileRepository.save(profile);

        // sendVerificationEmail no longer throws on failure (see
        // EmailService) — registration always completes and returns
        // success even if the mail provider is temporarily unreachable.
        // The user can always request a new link via
        // POST /auth/resend-verification-email.
        emailService.sendVerificationEmail(
                savedUser.getEmail(),
                savedUser.getUsername(),
                savedUser.getVerificationToken()
        );

        return new AuthResponse(
                null,
                savedUser.getUuid(),
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                savedUser.getProfileImage(),
                savedUser.getRoleEntity()
        );
    }

    @Override
    public AuthResponse login(
            LoginRequest request
    ) {

        UserEntity user =
                userRepository
                        .findByEmail(
                                request.email()
                        )
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "User not found"
                                )
                        );

        if (
                !passwordEncoder.matches(
                        request.password(),
                        user.getPassword()
                )
        ) {

            throw new RuntimeException(
                    "Invalid password"
            );
        }

        if (!Boolean.TRUE.equals(user.getEmailVerified())) {

            throw new RuntimeException(
                    "Please verify your email before logging in."
            );

        }

        String token =
                jwtService.generateToken(
                        user.getEmail()
                );

        return new AuthResponse(
                token,
                user.getUuid(),
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getProfileImage(),
                user.getRoleEntity()
        );
    }
}