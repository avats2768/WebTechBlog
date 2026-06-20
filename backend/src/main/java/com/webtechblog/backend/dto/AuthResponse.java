package com.webtechblog.backend.dto;

import com.webtechblog.backend.entity.RoleEntity;

public record AuthResponse(

        String token,

        String uuid,

        String username,

        String email,

        RoleEntity roleEntity

) {
}