package com.webtechblog.backend.controller.user;

import com.webtechblog.backend.dto.UserResponse;
import com.webtechblog.backend.service.UserService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public UserResponse profile(
            Authentication authentication
    ) {

        return userService.getProfile(
                authentication.getName()
        );
    }
}