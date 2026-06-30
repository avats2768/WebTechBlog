package com.webtechblog.backend.helper;

import com.webtechblog.backend.dto.post.PostResponse;
import com.webtechblog.backend.entity.PostEntity;
import com.webtechblog.backend.entity.ProfileEntity;
import com.webtechblog.backend.entity.UserEntity;
import com.webtechblog.backend.mapper.PostMapper;
import com.webtechblog.backend.repository.ProfileRepository;
import com.webtechblog.backend.repository.UserRepository;
import com.webtechblog.backend.service.PostCommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PostResponseHelper {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final SkillsHelper skillsHelper;
    private final LikeHelper likeHelper;
    private final BookmarkHelper bookmarkHelper;
    private final PostCommentService postCommentService;
    private final PostMapper postMapper;

    public PostResponse build(PostEntity post) {

        UserEntity author =
                userRepository
                        .findById(post.getUserId())
                        .orElse(null);

        ProfileEntity profile =
                profileRepository
                        .findByUserId(post.getUserId())
                        .orElse(null);

        return postMapper.toResponse(
                post,
                author,
                profile,
                skillsHelper.getSkillNames(post.getSkills()),
                likeHelper.isLiked(post.getId()),
                bookmarkHelper.isBookmarked(post.getId()),
                postCommentService.getComments(post.getId())
        );
    }
}