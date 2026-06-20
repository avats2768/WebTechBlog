package com.webtechblog.backend.dto;

import com.webtechblog.backend.entity.RoleEntity;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record RegisterRequest(

        @NotBlank
        String username,

        @Email
        String email,

        @NotBlank
        String password,

        RoleEntity role

) {}

