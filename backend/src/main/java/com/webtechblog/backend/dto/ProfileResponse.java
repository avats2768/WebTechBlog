package com.webtechblog.backend.dto;

import com.webtechblog.backend.entity.ProfileEntity;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ProfileResponse {

    private Long userId;

    private String firstName;
    private String lastName;
    private String phone;
    private LocalDate dob;
    private ProfileEntity.Gender Gender;

    private String profileImage;
    private String coverImage;

    private String headline;
    private String bio;
    private String skills;

    private String company;
    private String designation;

    private String city;
    private String state;
    private String country;

    private String githubUrl;
    private String linkedinUrl;
}
