package com.webtechblog.backend.service;

import com.webtechblog.backend.dto.ProfileResponse;
import com.webtechblog.backend.dto.PublicProfileResponse;
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
    private final CurrentUserService currentUserService;
    private final CloudinaryService cloudinaryService;

    public ProfileResponse getProfile() {

        UserEntity user =
                currentUserService.getCurrentUser();

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
        response.setExperienceYears(profile.getExperienceYears());

        response.setProfileImage(profile.getProfileImage());
        response.setCoverImage(profile.getCoverImage());
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
        response.setAddress(profile.getAddress());

        response.setGithubUrl(profile.getGithubUrl());
        response.setLinkedinUrl(profile.getLinkedinUrl());

        return response;
    }

    public PublicProfileResponse getPublicProfile(String uuid) {

        // Find user using UUID
        UserEntity user = userRepository
                .findByUuid(uuid)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        // Optional Security Check
        if (!Boolean.TRUE.equals(user.getStatus())) {
            throw new RuntimeException("User not found");
        }

        // Find profile using userId
        ProfileEntity profile = profileRepository
                .findByUserId(user.getId())
                .orElseThrow(() ->
                        new RuntimeException("Profile not found"));

        PublicProfileResponse response =
                new PublicProfileResponse();

        // User Table
        response.setUuid(user.getUuid());
        response.setUsername(user.getUsername());

        // Profile Table
        response.setFirstName(profile.getFirstName());
        response.setLastName(profile.getLastName());

        response.setHeadline(profile.getHeadline());
        response.setBio(profile.getBio());

        response.setProfileImage(
                profile.getProfileImage()
        );

        response.setCoverImage(
            profile.getCoverImage()
        );

        response.setSkills(profile.getSkills());

        response.setCompany(profile.getCompany());
        response.setDesignation(profile.getDesignation());

        response.setExperienceYears(
                profile.getExperienceYears()
        );

        response.setCity(profile.getCity());
        response.setState(profile.getState());
        response.setCountry(profile.getCountry());

        response.setWebsiteUrl(profile.getWebsiteUrl());
        response.setGithubUrl(profile.getGithubUrl());
        response.setLinkedinUrl(profile.getLinkedinUrl());
        response.setTwitterUrl(profile.getTwitterUrl());

        return response;
    }

    public ProfileEntity updateProfile(
            UpdateProfileRequest request
    ) {

        UserEntity user =
                currentUserService.getCurrentUser();

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
        if (request.getProfileImage() != null &&
                !request.getProfileImage().isEmpty()) {

            if (profile.getProfileImage() != null) {

                cloudinaryService.deleteImage(
                        profile.getProfileImage()
                );

            }

            String imageUrl =
                    cloudinaryService.uploadImage(
                            request.getProfileImage(),
                            "webtechblog/profile"
                    );

            user.setProfileImage(imageUrl);

            profile.setProfileImage(imageUrl);

        }

        // Cover Image Upload
        if (request.getCoverImage() != null &&
                !request.getCoverImage().isEmpty()) {

            if (profile.getCoverImage() != null) {

                cloudinaryService.deleteImage(
                        profile.getCoverImage()
                );

            }

            String imageUrl =
                    cloudinaryService.uploadImage(
                            request.getCoverImage(),
                            "webtechblog/cover"
                    );

            profile.setCoverImage(imageUrl);

        }

                userRepository.save(user);

        return profileRepository.save(profile);
    }

    public void deleteProfile() {

        UserEntity user =
                currentUserService.getCurrentUser();

        ProfileEntity profile =
                profileRepository
                        .findByUserId(user.getId())
                        .orElseThrow(() ->
                                new RuntimeException("Profile not found"));

        profileRepository.delete(profile);
    }

}