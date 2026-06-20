package com.webtechblog.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "posts")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostEntity {

    @Id
    @GeneratedValue(strategy =
            GenerationType.IDENTITY)
    private Long id;

    private String uuid;

    private Long userId;

    private String title;

    private String slug;

    @Column(columnDefinition = "LONGTEXT")
    private String description;

    @Column(columnDefinition = "LONGTEXT")
    private String code;

    private String imageUrl;

    @Column(columnDefinition = "json")
    private String skills;

    private Boolean status;

    private Boolean isPublished;

    private Long viewCount;

    private Long likeCount;

    private Long commentCount;

    private Long shareCount;

    private Long bookmarkCount;

    private Long createdBy;

    private Long updatedBy;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {

        this.uuid =
                UUID.randomUUID().toString();

        this.status = true;

        this.isPublished = true;

        this.viewCount = 0L;

        this.likeCount = 0L;

        this.commentCount = 0L;

        this.shareCount = 0L;

        this.bookmarkCount = 0L;

        this.createdAt =
                LocalDateTime.now();

        this.updatedAt =
                LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {

        this.updatedAt =
                LocalDateTime.now();
    }
}