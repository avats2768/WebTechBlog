package com.webtechblog.backend.service.impl;

import com.webtechblog.backend.dto.UserResponse;
import com.webtechblog.backend.entity.UserEntity;
import com.webtechblog.backend.repository.UserRepository;
import com.webtechblog.backend.service.UserService;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl
        implements UserService {

    private final UserRepository userRepository;

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
}