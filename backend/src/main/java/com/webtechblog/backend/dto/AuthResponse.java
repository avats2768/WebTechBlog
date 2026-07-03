package com.webtechblog.backend.dto;

import com.webtechblog.backend.enums.RoleEntity;

public record AuthResponse(

        String token,

        String uuid,

        Long userId,

        String username,

        String email,

        String profileImage,

        RoleEntity roleEntity

) {
}