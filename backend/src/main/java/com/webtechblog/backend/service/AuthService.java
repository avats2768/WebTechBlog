package com.webtechblog.backend.service;

import com.webtechblog.backend.dto.*;

public interface AuthService {

    AuthResponse register(
            RegisterRequest request
    );

    AuthResponse login(
            LoginRequest request
    );
}