package com.webtechblog.backend.dto;

import lombok.Data;

@Data
public class PublicProfileResponse {

    // User Information
    private String uuid;
    private String username;

    // Profile Information
    private String firstName;
    private String lastName;

    private String profileImage;
    private String coverImage;

    private String headline;
    private String bio;

    private String skills;

    // Professional
    private String company;
    private String designation;

    private Integer experienceYears;

    // Location
    private String city;
    private String state;
    private String country;

    // Social Links
    private String websiteUrl;
    private String githubUrl;
    private String linkedinUrl;
    private String twitterUrl;
}
