package com.webtechblog.backend.service;

import com.webtechblog.backend.dto.ProfileResponse;
import com.webtechblog.backend.dto.UpdateProfileRequest;
import com.webtechblog.backend.entity.ProfileEntity;
import com.webtechblog.backend.entity.UserEntity;
import com.webtechblog.backend.repository.ProfileRepository;
import com.webtechblog.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;
    @Value("${server.servlet.context-path}")
    private String contextPath;

    @Value("${app.base-url}")
    private String baseUrl;

    public ProfileResponse getProfile() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String email = authentication.getName();

        UserEntity user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException("User not found"));

        ProfileEntity profile =
                profileRepository
                        .findByUserId(user.getId())
                        .orElseThrow(() ->
                                new RuntimeException("Profile not found"));

        ProfileResponse response = new ProfileResponse();

        response.setUserId(profile.getUserId());

        response.setFirstName(profile.getFirstName());
        response.setLastName(profile.getLastName());
        response.setGender(profile.getGender());

        response.setProfileImage(baseUrl+contextPath+profile.getProfileImage());
        response.setCoverImage(baseUrl+contextPath+profile.getCoverImage());
        response.setPhone(profile.getPhone());
        response.setDob(profile.getDob());

        response.setHeadline(profile.getHeadline());
        response.setBio(profile.getBio());
        response.setSkills(profile.getSkills());

        response.setCompany(profile.getCompany());
        response.setDesignation(profile.getDesignation());

        response.setCity(profile.getCity());
        response.setState(profile.getState());
        response.setCountry(profile.getCountry());

        response.setGithubUrl(profile.getGithubUrl());
        response.setLinkedinUrl(profile.getLinkedinUrl());

        return response;
    }

    public ProfileEntity updateProfile(
            UpdateProfileRequest request
    ) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String email = authentication.getName();

        UserEntity user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException("User not found"));

        ProfileEntity profile =
                profileRepository
                        .findByUserId(user.getId())
                        .orElseThrow(() ->
                                new RuntimeException("Profile not found"));

        // Basic Information
        profile.setFirstName(request.getFirstName());
        profile.setLastName(request.getLastName());

        profile.setHeadline(request.getHeadline());
        profile.setBio(request.getBio());

        // Contact
        profile.setPhone(request.getPhone());

        // Skills JSON
        profile.setSkills(request.getSkills());

        // Location
        profile.setCountry(request.getCountry());
        profile.setState(request.getState());
        profile.setCity(request.getCity());
        profile.setAddress(request.getAddress());

        // Professional
        profile.setCompany(request.getCompany());
        profile.setDesignation(request.getDesignation());

        profile.setWebsiteUrl(request.getWebsiteUrl());
        profile.setGithubUrl(request.getGithubUrl());
        profile.setLinkedinUrl(request.getLinkedinUrl());
        profile.setTwitterUrl(request.getTwitterUrl());

        profile.setExperienceYears(
                request.getExperienceYears()
        );

        // Gender
        if (
                request.getGender() != null &&
                        !request.getGender().isBlank()
        ) {

            profile.setGender(
                    ProfileEntity.Gender.valueOf(
                            request.getGender()
                                    .toUpperCase()
                    )
            );
        }

        // DOB
        if (
                request.getDob() != null &&
                        !request.getDob().isBlank()
        ) {

            profile.setDob(
                    LocalDate.parse(
                            request.getDob()
                    )
            );
        }

        // Profile Image Upload
        if (
                request.getProfileImage() != null &&
                        !request.getProfileImage().isEmpty()
        ) {

            try {

                String fileName =
                        UUID.randomUUID()
                                + "_"
                                + request.getProfileImage()
                                .getOriginalFilename();

                Path uploadPath =
                        Paths.get("public/profile");

                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                Files.copy(
                        request.getProfileImage().getInputStream(),
                        uploadPath.resolve(fileName),
                        StandardCopyOption.REPLACE_EXISTING
                );

                profile.setProfileImage(
                        "/public/profile/" + fileName
                );

            } catch (IOException e) {

                throw new RuntimeException(
                        "Failed to upload profile image",
                        e
                );
            }
        }

        // Cover Image Upload
        if (
                request.getCoverImage() != null &&
                        !request.getCoverImage().isEmpty()
        ) {

            try {

                String fileName =
                        UUID.randomUUID()
                                + "_"
                                + request.getCoverImage()
                                .getOriginalFilename();

                Path uploadPath =
                        Paths.get("public/cover");

                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                Files.copy(
                        request.getCoverImage().getInputStream(),
                        uploadPath.resolve(fileName),
                        StandardCopyOption.REPLACE_EXISTING
                );

                profile.setCoverImage(
                        "/public/cover/" + fileName
                );

            } catch (IOException e) {

                throw new RuntimeException(
                        "Failed to upload cover image",
                        e
                );
            }
        }

        return profileRepository.save(profile);
    }

    public void deleteProfile() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String email = authentication.getName();

        UserEntity user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException("User not found"));

        ProfileEntity profile =
                profileRepository
                        .findByUserId(user.getId())
                        .orElseThrow(() ->
                                new RuntimeException("Profile not found"));

        profileRepository.delete(profile);
    }
}