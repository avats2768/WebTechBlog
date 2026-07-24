package com.webtechblog.backend.service;

import com.webtechblog.backend.dto.post.PostCommentResponse;
import com.webtechblog.backend.dto.post.PostPageResponse;
import com.webtechblog.backend.dto.post.PostResponse;
import com.webtechblog.backend.entity.*;
import com.webtechblog.backend.helper.SkillsHelper;
import com.webtechblog.backend.mapper.PostMapper;
import com.webtechblog.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeedService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final PostLikeRepository postLikeRepository;
    private final BookmarkRepository bookmarkRepository;
    private final SkillRepository skillRepository;
    private final PostCommentService postCommentService;
    private final SkillsHelper skillsHelper;
    private final CurrentUserService currentUserService;
    private final PostMapper postMapper;

    public PostPageResponse getFeed(
            int page,
            int size
    ) {

        Pageable pageable =
                PageRequest.of(page, size);

        Page<PostEntity> pageResult =
                postRepository
                        .findAllByOrderByCreatedAtDesc(
                                pageable
                        );

        return buildPage(pageResult);

    }

    public PostPageResponse getUserFeed(
            Long userId,
            int page,
            int size
    ) {

        Pageable pageable =
                PageRequest.of(page, size);

        Page<PostEntity> pageResult =
                postRepository
                        .findByUserIdOrderByCreatedAtDesc(
                                userId,
                                pageable
                        );

        return buildPage(pageResult);

    }

    public PostPageResponse getMyFeed(
            Long userId,
            int page,
            int size
    ) {

        Pageable pageable =
                PageRequest.of(page, size);

        Page<PostEntity> pageResult =
                postRepository
                        .findByUserIdOrderByCreatedAtDesc(
                                userId,
                                pageable
                        );

        return buildPage(pageResult);

    }

    private PostResponse buildPostResponse(

            PostEntity post,

            Map<Long, UserEntity> userMap,

            Map<Long, ProfileEntity> profileMap,

            Map<Long, List<PostCommentResponse>> commentsMap,

            Set<Long> likedPosts,

            Set<Long> bookmarkedPosts,

            Map<Long, String> skillMap

    ) {

        UserEntity author =
                userMap.get(post.getUserId());

        ProfileEntity profile =
                profileMap.get(post.getUserId());

        List<PostCommentResponse> comments =
                commentsMap.getOrDefault(
                        post.getId(),
                        Collections.emptyList()
                );

        return postMapper.toResponse(

                post,

                author,

                profile,

                getSkillNames(
                        post.getSkills(),
                        skillMap
                ),

                likedPosts.contains(post.getId()),

                bookmarkedPosts.contains(post.getId()),

                comments

        );

    }

    private PostPageResponse buildPage(
            Page<PostEntity> pageResult
    ) {

        List<PostResponse> responses =
                buildFeed(
                        pageResult.getContent()
                );

        return PostPageResponse.builder()

                .posts(responses)

                .page(pageResult.getNumber())

                .size(pageResult.getSize())

                .totalElements(
                        pageResult.getTotalElements()
                )

                .totalPages(
                        pageResult.getTotalPages()
                )

                .hasNext(
                        pageResult.hasNext()
                )

                .hasPrevious(
                        pageResult.hasPrevious()
                )

                .build();

    }

    public List<PostResponse> buildFeed(
            List<PostEntity> posts
    ) {

        if (posts.isEmpty()) {
            return Collections.emptyList();
        }

        UserEntity currentUser =
                currentUserService.getCurrentUser();

        Set<Long> userIds =
                posts.stream()
                        .map(PostEntity::getUserId)
                        .collect(Collectors.toSet());

        Set<Long> postIds =
                posts.stream()
                        .map(PostEntity::getId)
                        .collect(Collectors.toSet());

        Map<Long, UserEntity> userMap =
                userRepository
                        .findByIdIn(userIds)
                        .stream()
                        .collect(Collectors.toMap(
                                UserEntity::getId,
                                Function.identity()
                        ));

        Map<Long, ProfileEntity> profileMap =
                profileRepository
                        .findByUserIdIn(userIds)
                        .stream()
                        .collect(Collectors.toMap(
                                ProfileEntity::getUserId,
                                Function.identity()
                        ));

        Set<Long> likedPosts =
                postLikeRepository
                        .findByUserIdAndPostIdInAndStatus(
                                currentUser.getId(),
                                postIds,
                                1
                        )
                        .stream()
                        .map(PostLikeEntity::getPostId)
                        .collect(Collectors.toSet());

        Set<Long> bookmarkedPosts =
                bookmarkRepository
                        .findByUserIdAndPostIdInAndStatus(
                                currentUser.getId(),
                                postIds,
                                1
                        )
                        .stream()
                        .map(BookmarkEntity::getPostId)
                        .collect(Collectors.toSet());

        Map<Long, List<PostCommentResponse>> commentsMap =
                postCommentService.getCommentsByPosts(postIds);

        Set<Long> skillIds = new HashSet<>();

        for (PostEntity post : posts) {

            skillIds.addAll(
                    skillsHelper.getSkillIds(post.getSkills())
            );

        }

        Map<Long, String> skillMap =
                skillRepository.findByIdIn(skillIds)
                        .stream()
                        .collect(Collectors.toMap(
                                SkillEntity::getId,
                                SkillEntity::getName
                        ));

        return posts.stream()

                .map(post ->

                        buildPostResponse(

                                post,

                                userMap,

                                profileMap,

                                commentsMap,

                                likedPosts,

                                bookmarkedPosts,

                                skillMap

                        )

                )

                .toList();

    }

    public PostResponse getPost(Long postId) {

        PostEntity post =
                postRepository
                        .findById(postId)
                        .orElseThrow(() ->
                                new RuntimeException("Post not found"));

        List<PostResponse> responses =
                buildFeed(List.of(post));

        return responses.get(0);

    }

    public List<PostResponse> getPostsByIds(
            Collection<Long> postIds
    ) {

        List<PostEntity> posts =
                postRepository.findByIdIn(postIds);

        return buildFeed(posts);

    }

    private List<String> getSkillNames(
            String skillsJson,
            Map<Long, String> skillMap
    ) {

        List<Long> ids =
                skillsHelper.getSkillIds(skillsJson);

        return ids.stream()
                .map(skillMap::get)
                .filter(Objects::nonNull)
                .toList();

    }

}