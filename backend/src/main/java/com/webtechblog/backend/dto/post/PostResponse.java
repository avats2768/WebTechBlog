package com.webtechblog.backend.dto.post;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
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

    private String username;
    private String profession;

    private List<String> skills;

    private LocalDateTime createdAt;
}