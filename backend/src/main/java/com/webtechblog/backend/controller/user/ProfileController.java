package com.webtechblog.backend.controller.user;

import com.webtechblog.backend.dto.ApiResponse;
import com.webtechblog.backend.dto.ProfileResponse;
import com.webtechblog.backend.dto.UpdateProfileRequest;
import com.webtechblog.backend.entity.ProfileEntity;
import com.webtechblog.backend.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService  profileService;

    @GetMapping
    public ApiResponse<ProfileResponse> getProfile() {
        return ApiResponse.<ProfileResponse>builder()
                .success(true)
                .message("Fetch Profile successfully")
                .data(profileService.getProfile())
                .build();

    }


    @PutMapping(
            value = "/update",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ApiResponse<ProfileEntity> updateProfile(
            @ModelAttribute UpdateProfileRequest request
    ) {

        return ApiResponse.<ProfileEntity>builder()
                .success(true)
                .message("Profile Updated Successfully")
                .data(
                        profileService.updateProfile(request)
                )
                .build();
    }
}