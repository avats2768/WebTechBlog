package com.webtechblog.backend.entity;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    @Column(length = 500)
    private String profileImage;

    @Column(length = 500)
    private String coverImage;

    @Column(nullable = false, length = 100)
    private String firstName;

    @Column(length = 100)
    private String lastName;

    @Column(length = 255)
    private String headline;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    private LocalDate dob;

    @Column(length = 20)
    private String phone;

    @Column(columnDefinition = "json")
    private String skills;

    @Column(length = 100)
    private String country;

    @Column(length = 100)
    private String state;

    @Column(length = 100)
    private String city;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(length = 255)
    private String company;


    @Column(length = 255)
    private String designation;

    @Column(length = 255)
    private String websiteUrl;

    @Column(length = 255)
    private String githubUrl;

    @Column(length = 255)
    private String linkedinUrl;

    @Column(length = 255)
    private String twitterUrl;

    private Integer experienceYears = 0;

    private Integer profileCompletionPercentage = 0;

    private Integer status = 1;

    private Long createdBy;

    private Long updatedBy;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum Gender {
        MALE,
        FEMALE,
        OTHER
    }
}
