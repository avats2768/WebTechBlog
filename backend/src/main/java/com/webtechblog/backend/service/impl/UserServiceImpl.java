package com.webtechblog.backend.service.impl;

import com.webtechblog.backend.dto.UserResponse;
import com.webtechblog.backend.entity.UserEntity;
import com.webtechblog.backend.repository.UserRepository;
import com.webtechblog.backend.service.UserService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl
        implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserResponse getProfile(
            String email
    ) {

        UserEntity user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "User not found"
                                )
                        );

        return new UserResponse(
                user.getUuid(),
                user.getUsername(),
                user.getEmail(),
                user.getProfileImage(),
                user.getBio(),
                user.getRoleEntity(),
                user.getStatus(),
                user.getCreatedAt()
        );
    }

    @Override
    public void updatePassword(String oldPassword, String newPassword) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String email = authentication.getName();

        UserEntity user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new IllegalArgumentException("User not found"));

        // Verify old password
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new IllegalArgumentException("Old password is incorrect.");
        }

        // Prevent same password
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new IllegalArgumentException(
                    "New password cannot be the same as the old password."
            );
        }

        // Encode new password
        user.setPassword(passwordEncoder.encode(newPassword));

        userRepository.save(user);
    }
}