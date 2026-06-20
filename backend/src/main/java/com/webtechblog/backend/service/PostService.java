package com.webtechblog.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webtechblog.backend.dto.post.PostResponse;
import com.webtechblog.backend.entity.PostEntity;
import com.webtechblog.backend.entity.SkillEntity;
import com.webtechblog.backend.entity.UserEntity;
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

                .profession("Developer")

                .skills(
                        getSkillNames(post.getSkills())
                )

                .createdAt(post.getCreatedAt())
                .build();
    }

    public List<PostResponse> getAllPosts() {

        return postRepository
                .findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }
}