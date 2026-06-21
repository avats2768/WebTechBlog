package com.webtechblog.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webtechblog.backend.dto.post.PostResponse;
import com.webtechblog.backend.entity.PostEntity;
import com.webtechblog.backend.entity.SkillEntity;
import com.webtechblog.backend.entity.UserEntity;
import com.webtechblog.backend.entity.ProfileEntity;
import com.webtechblog.backend.repository.ProfileRepository;
import com.webtechblog.backend.repository.PostRepository;
import com.webtechblog.backend.repository.SkillRepository;
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

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final ProfileRepository profileRepository;

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

    private List<String> getSkillNames(String skillsJson) {

        try {

            ObjectMapper objectMapper =
                    new ObjectMapper();

            List<Long> skillIds =
                    objectMapper.readValue(
                            skillsJson,
                            new TypeReference<List<Long>>() {}
                    );

            return skillRepository
                    .findAllById(skillIds)
                    .stream()
                    .map(SkillEntity::getName)
                    .toList();

        } catch (Exception e) {

            return List.of();
        }
    }

    public PostResponse convertToResponse(PostEntity post) {

        UserEntity user =
                userRepository
                        .findById(post.getUserId())
                        .orElse(null);

        ProfileEntity profile =
                profileRepository
                        .findByUserId(post.getUserId())
                        .orElse(null);

        return PostResponse.builder()
                .id(post.getId())
                .uuid(post.getUuid())
                .title(post.getTitle())
                .description(post.getDescription())
                .code(post.getCode())

                .imageUrl(
                        post.getImageUrl() != null
                                ? baseUrl + contextPath + post.getImageUrl()
                                : null
                )

                .viewCount(post.getViewCount())
                .likeCount(post.getLikeCount())
                .commentCount(post.getCommentCount())

                .username(
                        user != null
                                ? user.getUsername()
                                : "Unknown User"
                )

                .firstName(
                        profile != null
                                ? profile.getFirstName()
                                : null
                )

                .lastName(
                        profile != null
                                ? profile.getLastName()
                                : null
                )

                .headline(
                        profile != null
                                ? profile.getHeadline()
                                : null
                )

                .company(
                        profile != null
                                ? profile.getCompany()
                                : null
                )

                .designation(
                        profile != null
                                ? profile.getDesignation()
                                : null
                )

                .profileImage(
                        profile != null &&
                                profile.getProfileImage() != null
                                ? baseUrl + contextPath + profile.getProfileImage()
                                : null
                )

                .skills(
                        getSkillNames(post.getSkills())
                )

                .createdAt(post.getCreatedAt())
                .build();
    }

    public List<PostResponse> getAllPosts() {

        return postRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    public PostResponse getPost(long id) {

        PostEntity post = postRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Post not found"));

        return convertToResponse(post);
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
                .map(this::convertToResponse)
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