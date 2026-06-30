package com.webtechblog.backend.service;

import com.webtechblog.backend.dto.post.PostResponse;
import com.webtechblog.backend.entity.PostEntity;
import com.webtechblog.backend.entity.UserEntity;
import com.webtechblog.backend.enums.ActivityType;
import com.webtechblog.backend.helper.PostResponseHelper;
import com.webtechblog.backend.repository.PostRepository;
import com.webtechblog.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostResponseHelper postResponseHelper;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final HistoryWriteService historyService;

    @Value("${server.servlet.context-path}")
    private String contextPath;

    @Value("${app.base-url}")
    private String baseUrl;


    public PostEntity createPost(
            String title,
            String description,
            String code,
            MultipartFile image,
            String skills,
            String customSkill
    ) throws Exception {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String email = authentication.getName();

        UserEntity user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new IllegalArgumentException("User not found"));

        String imageUrl = null;

        if (image != null && !image.isEmpty()) {

            String fileName =
                    UUID.randomUUID()
                            + "_"
                            + image.getOriginalFilename();

            Path uploadPath =
                    Paths.get("public/uploads");

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Files.copy(
                    image.getInputStream(),
                    uploadPath.resolve(fileName)
            );

            imageUrl = "/public/uploads/" + fileName;
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

    public List<PostResponse> getAllPosts() {

        return postRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(postResponseHelper::build)
                .toList();
    }

    public List<PostResponse> getUserPosts(String userUuid) {

        UserEntity user = userRepository.findByUuid(userUuid)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return postRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(postResponseHelper::build)
                .toList();
    }

    public PostResponse getPost(Long id) {

        PostEntity post = postRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Post not found"));

        historyService.saveHistory(
                post.getId(),
                ActivityType.VIEW
        );

        return postResponseHelper.build(post);
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

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String email = authentication.getName();

        UserEntity user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new IllegalArgumentException("User not found"));

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

            String fileName =
                    UUID.randomUUID()
                            + "_"
                            + image.getOriginalFilename();

            Path uploadPath =
                    Paths.get("public/uploads");

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Files.copy(
                    image.getInputStream(),
                    uploadPath.resolve(fileName)
            );

            post.setImageUrl(
                    "/public/uploads/" + fileName
            );
        }

        post.setUpdatedBy(user.getId());

        return postRepository.save(post);
    }

    public List<PostResponse> getMyPosts() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String email = authentication.getName();

        UserEntity user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new IllegalArgumentException("User not found"));

        return postRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(postResponseHelper::build)
                .toList();
    }

    public void deletePost(Long postId) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String email = authentication.getName();

        UserEntity user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new IllegalArgumentException("User not found"));

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
        if (post.getImageUrl() != null) {

            try {

                String imagePath =
                        post.getImageUrl()
                                .replace("/public/uploads/", "");

                Path filePath =
                        Paths.get("public/uploads")
                                .resolve(imagePath);

                Files.deleteIfExists(filePath);

            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        postRepository.delete(post);
    }
}