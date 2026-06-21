package com.webtechblog.backend.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class UpdateProfileRequest {

    private MultipartFile profileImage;
    private MultipartFile coverImage;

    private String firstName;
    private String lastName;

    private String headline;
    private String bio;

    private String gender;
    private String dob;

    private String phone;

    private String skills;

    private String country;
    private String state;
    private String city;
    private String address;

    private String company;
    private String designation;

    private String websiteUrl;
    private String githubUrl;
    private String linkedinUrl;
    private String twitterUrl;

    private Integer experienceYears;
}