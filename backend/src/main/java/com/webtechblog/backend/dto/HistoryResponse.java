package com.webtechblog.backend.dto;

import com.webtechblog.backend.dto.post.PostResponse;
import com.webtechblog.backend.enums.ActivityType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
class HistoryResponse {
    private ActivityType activityType;
    private LocalDateTime createdAt;
    private PostResponse post;
}
