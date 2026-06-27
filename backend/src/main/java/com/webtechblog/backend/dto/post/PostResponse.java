package com.webtechblog.backend.dto.post;

import com.webtechblog.backend.entity.PostCommentEntity;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
public class PostResponse {

    private Long id;
    private String uuid;
    private String title;
    private String description;
    private String code;
    private String imageUrl;

    private Long viewCount;
    private Long likeCount;
    private Long commentCount;
    private Boolean isLiked;
    private List<PostCommentResponse> comments;

    private String username;
    private String firstName;
    private String lastName;
    private String headline;
    private String profileImage;
    private String company;
    private String designation;

    private List<String> skills;

    private LocalDateTime createdAt;
}