package com.webtechblog.backend.service;

import com.webtechblog.backend.dto.post.PostPageResponse;
import com.webtechblog.backend.dto.post.PostResponse;
import com.webtechblog.backend.entity.PostEntity;
import com.webtechblog.backend.entity.UserEntity;
import com.webtechblog.backend.repository.PostRepository;
import com.webtechblog.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@Service
@RequiredArgsConstructor
public class PostService {

    private final FeedService feedService;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final HistoryWriteService historyService;
    private final CurrentUserService currentUserService;
    private final CloudinaryService cloudinaryService;

    public PostEntity createPost(
            String title,
            String description,
            String code,
            MultipartFile image,
            String skills,
            String customSkill
    ) throws Exception {

        UserEntity user =
                currentUserService.getCurrentUser();

        String imageUrl = null;

        if (image != null && !image.isEmpty()) {

            imageUrl = cloudinaryService.uploadImage(
                    image,
                    "webtechblog/posts"
            );

        }

        PostEntity post = new PostEntity();

        post.setUserId(user.getId());
        post.setCreatedBy(user.getId());
        post.setUpdatedBy(user.getId());

        post.setTitle(title);
        post.setDescription(description);
        post.setCode(code);
        post.setImageUrl(imageUrl);
        post.setSkills(skills);

        return postRepository.save(post);
    }

    public PostPageResponse getAllPosts(
            int page,
            int size
    ){

        return feedService.getFeed(
                page,
                size
        );

    }

    public PostPageResponse getUserPosts(
            String userUuid,
            int page,
            int size
    ){

        UserEntity user =
                userRepository.findByUuid(userUuid)
                        .orElseThrow(() ->
                                new RuntimeException("User not found"));

        return feedService.getUserFeed(
                user.getId(),
                page,
                size
        );

    }

    public PostResponse getPost(Long id) {

        return feedService.getPost(id);
    }

    public PostEntity updatePost(
            Long postId,
            String title,
            String description,
            String code,
            MultipartFile image,
            String skills,
            String customSkill
    ) throws Exception {

        UserEntity user =
                currentUserService.getCurrentUser();

        PostEntity post =
                postRepository
                        .findById(postId)
                        .orElseThrow(() ->
                                new RuntimeException("Post not found"));

        if (!post.getUserId().equals(user.getId())) {
            throw new RuntimeException("You are not allowed to edit this post");
        }

        post.setTitle(title);
        post.setDescription(description);
        post.setCode(code);
        post.setSkills(skills);

        if (image != null && !image.isEmpty()) {

            if (post.getImageUrl() != null &&
                    !post.getImageUrl().isBlank()) {

                cloudinaryService.deleteImage(
                        post.getImageUrl()
                );

            }

            String imageUrl =
                    cloudinaryService.uploadImage(
                            image,
                            "webtechblog/posts"
                    );

            post.setImageUrl(imageUrl);

        }

        post.setUpdatedBy(user.getId());

        return postRepository.save(post);
    }

    public PostPageResponse getMyPosts(
            int page,
            int size
    ){

        UserEntity user =
                currentUserService.getCurrentUser();

        return feedService.getMyFeed(
                user.getId(),
                page,
                size
        );

    }

    public void deletePost(Long postId) {

        UserEntity user =
                currentUserService.getCurrentUser();

        PostEntity post =
                postRepository
                        .findById(postId)
                        .orElseThrow(() ->
                                new RuntimeException("Post not found"));

        // Ownership Validation
        if (!post.getUserId().equals(user.getId())) {
            throw new RuntimeException(
                    "You are not allowed to delete this post"
            );
        }

        // Delete image if exists
        if (post.getImageUrl() != null &&
                !post.getImageUrl().isBlank()) {

            cloudinaryService.deleteImage(
                    post.getImageUrl()
            );

        }

        postRepository.delete(post);
    }
}