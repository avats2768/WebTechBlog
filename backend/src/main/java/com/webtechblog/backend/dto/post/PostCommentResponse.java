package com.webtechblog.backend.dto.post;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PostCommentResponse {

    private Long id;
    private Long postId;
    private Long userId;

    private String comment;
    private Long commentCount;

    private String username;
    private String firstName;
    private String lastName;
    private String designation;
    private String profileImage;

    private LocalDateTime createdAt;
}