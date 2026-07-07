package com.webtechblog.backend.controller.user;

import com.webtechblog.backend.dto.ApiResponse;
import com.webtechblog.backend.dto.UserResponse;
import com.webtechblog.backend.service.UserService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
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

    @PutMapping("/update-password")
    public ApiResponse<?> updatePassword(
            @RequestParam String oldPassword,
            @RequestParam String newPassword
    ) {

        System.out.println("oldPassword:"+oldPassword+"----"+"newPassword:"+newPassword);

        userService.updatePassword(oldPassword, newPassword);

        return ApiResponse.builder()
                .success(true)
                .message("Password changed successfully.")
                .build();
    }
}