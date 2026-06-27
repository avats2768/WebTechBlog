package com.webtechblog.backend.service.impl;

import com.webtechblog.backend.dto.*;

import com.webtechblog.backend.entity.UserEntity;

import com.webtechblog.backend.repository.UserRepository;
import com.webtechblog.backend.entity.ProfileEntity;
import com.webtechblog.backend.repository.ProfileRepository;

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
    private final ProfileRepository profileRepository;
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

        UserEntity savedUser =
                userRepository.save(user);

        ProfileEntity profile =
                ProfileEntity.builder()
                        .userId(savedUser.getId())
                        .firstName(savedUser.getUsername())
                        .profileImage("/public/profile/default-profile.jpeg")
                        .coverImage("/public/cover/default-cover.jpeg")
                        .headline("")
                        .bio("")
                        .status(1)
                        .build();

        profileRepository.save(profile);

        String token =
                jwtService.generateToken(
                        savedUser.getEmail()
                );

        return new AuthResponse(
                token,
                savedUser.getUuid(),
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getEmail(),
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
                user.getRoleEntity()
        );
    }
}