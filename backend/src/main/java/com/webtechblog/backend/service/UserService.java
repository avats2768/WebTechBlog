package com.webtechblog.backend.service;

import com.webtechblog.backend.dto.UserResponse;

public interface UserService {

    UserResponse getProfile(
            String email
    );
}