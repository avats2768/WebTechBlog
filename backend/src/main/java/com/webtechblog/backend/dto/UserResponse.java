package com.webtechblog.backend.dto;

import com.webtechblog.backend.entity.RoleEntity;

import java.time.LocalDateTime;

public record UserResponse(

        String uuid,

        String username,

        String email,

        String profileImage,

        String bio,

        RoleEntity roleEntity,

        Boolean status,

        LocalDateTime createdAt

) {
}