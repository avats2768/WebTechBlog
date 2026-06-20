package com.webtechblog.backend.service.impl;

import com.webtechblog.backend.dto.*;

import com.webtechblog.backend.entity.UserEntity;

import com.webtechblog.backend.repository.UserRepository;

import com.webtechblog.backend.security.JwtService;

import com.webtechblog.backend.service.AuthService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl
        implements AuthService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;

    @Override
    public AuthResponse register(
            RegisterRequest request
    ) {

        if (
                userRepository.existsByEmail(
                        request.email()
                )
        ) {
            throw new RuntimeException(
                    "Email already exists"
            );
        }

        UserEntity user =
                UserEntity.builder()
                        .username(
                                request.username()
                        )
                        .email(
                                request.email()
                        )
                        .password(
                                passwordEncoder.encode(
                                        request.password()
                                )
                        )
                        .build();

        userRepository.save(user);

        String token =
                jwtService.generateToken(
                        user.getEmail()
                );

        return new AuthResponse(
                token,
                user.getUuid(),
                user.getUsername(),
                user.getEmail(),
                user.getRoleEntity()
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

        String token =
                jwtService.generateToken(
                        user.getEmail()
                );

        return new AuthResponse(
                token,
                user.getUuid(),
                user.getUsername(),
                user.getEmail(),
                user.getRoleEntity()
        );
    }
}