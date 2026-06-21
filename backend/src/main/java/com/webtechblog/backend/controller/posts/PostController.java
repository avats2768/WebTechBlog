package com.webtechblog.backend.controller.posts;

import com.webtechblog.backend.dto.ApiResponse;
import com.webtechblog.backend.dto.post.PostResponse;
import com.webtechblog.backend.entity.PostEntity;
import com.webtechblog.backend.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/post")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

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
                .data(postService.convertToResponse(post))
                .build();
    }

    @GetMapping("/all")
    public ApiResponse<List<PostResponse>> getAllPosts() {

        return ApiResponse.<List<PostResponse>>builder()
                .success(true)
                .message("Posts fetched successfully")
                .data(postService.getAllPosts())
                .build();
    }

    @GetMapping("/{postId}")
    public ApiResponse<PostResponse> getPost(@PathVariable long postId) {

        return ApiResponse.<PostResponse>builder()
                .success(true)
                .message("Post fetched successfully")
                .data(postService.getPost(postId))
                .build();
    }

    @GetMapping("/my-post")
    public ApiResponse<List<PostResponse>> getAllUserPosts() {
        return ApiResponse.<List<PostResponse>>builder()
                .success(true)
                .message("Posts fetched successfully")
                .data(postService.getMyPosts())
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
                .data(postService.convertToResponse(post))
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
