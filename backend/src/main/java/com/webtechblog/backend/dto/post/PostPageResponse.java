package com.webtechblog.backend.dto.post;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PostPageResponse {

    private List<PostResponse> posts;

    private int page;

    private int size;

    private long totalElements;

    private int totalPages;

    private boolean hasNext;

    private boolean hasPrevious;

}