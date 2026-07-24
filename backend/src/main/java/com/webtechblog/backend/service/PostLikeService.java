package com.webtechblog.backend.service;

import com.webtechblog.backend.dto.post.PostResponse;
import com.webtechblog.backend.entity.PostLikeEntity;
import com.webtechblog.backend.entity.UserEntity;
import com.webtechblog.backend.enums.ActivityType;
import com.webtechblog.backend.repository.PostLikeRepository;
import com.webtechblog.backend.repository.PostRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.webtechblog.backend.repository.UserRepository;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PostLikeService {

    private final CurrentUserService currentUserService;
    private final PostLikeRepository postLikeRepository;
    private final PostRepository postRepository;
    private final FeedService feedService;
    private final HistoryWriteService historyService;

    @Transactional
    public boolean toggleLike(Long postId) {

        UserEntity user = currentUserService.getCurrentUser();

        Long userId = user.getId();

        Optional<PostLikeEntity> optional =
                postLikeRepository.findByPostIdAndUserId(postId, userId);

        PostLikeEntity existing = optional.orElse(null);

        boolean liked;

        if (existing != null) {

            if (existing.getStatus() == 1) {

                existing.setStatus(0);

                postRepository.decrementLikeCount(postId);

                liked = false;

            } else {

                existing.setStatus(1);

                postRepository.incrementLikeCount(postId);

                liked = true;
            }

            postLikeRepository.save(existing);

        } else {

            PostLikeEntity like = PostLikeEntity.builder()
                    .postId(postId)
                    .userId(userId)
                    .status(1)
                    .build();

            postLikeRepository.save(like);

            postRepository.incrementLikeCount(postId);

            liked = true;
        }

        if (liked) {

            historyService.saveHistory(
                    postId,
                    ActivityType.LIKE
            );

        }

        return liked;
    }

    public long getLikeCount(Long postId) {
        return postLikeRepository.countByPostIdAndStatus(postId, 1);
    }

    public List<PostResponse> getMyLikedPosts() {

        UserEntity user = currentUserService.getCurrentUser();

        List<Long> postIds =
                postLikeRepository
                        .findAllByUserIdAndStatusOrderByCreatedAtDesc(
                                user.getId(),
                                1
                        )
                        .stream()
                        .map(PostLikeEntity::getPostId)
                        .toList();

        if (postIds.isEmpty()) {
            return List.of();
        }

        return feedService.getPostsByIds(postIds);

    }
}