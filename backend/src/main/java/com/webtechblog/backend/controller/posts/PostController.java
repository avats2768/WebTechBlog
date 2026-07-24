package com.webtechblog.backend.controller.posts;

import com.webtechblog.backend.dto.ApiResponse;
import com.webtechblog.backend.dto.post.PostPageResponse;
import com.webtechblog.backend.dto.post.PostResponse;
import com.webtechblog.backend.entity.PostEntity;
import com.webtechblog.backend.service.FeedService;
import com.webtechblog.backend.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/post")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;
    private final FeedService feedService;

    @PostMapping("/save")
    public ApiResponse<PostResponse> savePost(
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam(required = false) String code,
            @RequestParam(required = false) MultipartFile image,
            @RequestParam String skills,
            @RequestParam(required = false) String customSkill
    ) throws Exception {

        PostEntity post = postService.createPost(
                title,
                description,
                code,
                image,
                skills,
                customSkill
        );

        return ApiResponse.<PostResponse>builder()
                .success(true)
                .message("Post created successfully")
                .data(feedService.getPost(post.getId()))
                .build();
    }

    @GetMapping("/all")
    public ApiResponse<PostPageResponse> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {

        return ApiResponse.<PostPageResponse>builder()
                .success(true)
                .message("Posts fetched successfully")
                .data(postService.getAllPosts(page, size))
                .build();
    }

    @GetMapping("/user/{userUuid}")
    public ApiResponse<PostPageResponse> getUserPosts(
            @PathVariable String userUuid,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {

        return ApiResponse.<PostPageResponse>builder()
                .success(true)
                .message("User posts fetched successfully")
                .data(postService.getUserPosts(userUuid, page, size))
                .build();
    }

    @GetMapping("/{postId}")
    public ApiResponse<PostResponse> getPost(
            @PathVariable Long postId
    ) {

        return ApiResponse.<PostResponse>builder()
                .success(true)
                .message("Post fetched successfully")
                .data(postService.getPost(postId))
                .build();
    }

    @GetMapping("/my-post")
    public ApiResponse<PostPageResponse> getMyPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {

        return ApiResponse.<PostPageResponse>builder()
                .success(true)
                .message("My posts fetched successfully")
                .data(postService.getMyPosts(page, size))
                .build();
    }

    @PutMapping("/save/{postId}")
    public ApiResponse<PostResponse> updatePost(
            @PathVariable Long postId,
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam(required = false) String code,
            @RequestParam(required = false) MultipartFile image,
            @RequestParam String skills,
            @RequestParam(required = false) String customSkill
    ) throws Exception {

        PostEntity post = postService.updatePost(
                postId,
                title,
                description,
                code,
                image,
                skills,
                customSkill
        );

        return ApiResponse.<PostResponse>builder()
                .success(true)
                .message("Post updated successfully")
                .data(feedService.getPost(post.getId()))
                .build();
    }

    @DeleteMapping("/{postId}")
    public ApiResponse<Void> deletePost(
            @PathVariable Long postId
    ) {

        postService.deletePost(postId);

        return ApiResponse.<Void>builder()
                .success(true)
                .message("Post deleted successfully")
                .build();
    }
}