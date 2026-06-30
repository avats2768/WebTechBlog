package com.webtechblog.backend.mapper;

import com.webtechblog.backend.dto.post.PostCommentResponse;
import com.webtechblog.backend.dto.post.PostResponse;
import com.webtechblog.backend.entity.PostEntity;
import com.webtechblog.backend.entity.ProfileEntity;
import com.webtechblog.backend.entity.UserEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class PostMapper {

    @Value("${server.servlet.context-path}")
    private String contextPath;

    @Value("${app.base-url}")
    private String baseUrl;

    public PostResponse toResponse(
            PostEntity post,
            UserEntity user,
            ProfileEntity profile,
            List<String> skills,
            Boolean isLiked,
            Boolean isBookmarked,
            List<PostCommentResponse> comments
    ) {


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

                .isLiked(isLiked)
                .isBookmarked(isBookmarked)
                .comments(comments)


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
                .userUuid(
                user != null ? user.getUuid() : null
        )

                .skills(skills)

                .createdAt(post.getCreatedAt())

                .build();
    }
}