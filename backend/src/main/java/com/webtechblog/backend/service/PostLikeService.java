package com.webtechblog.backend.service;

import com.webtechblog.backend.dto.post.PostResponse;
import com.webtechblog.backend.entity.PostLikeEntity;
import com.webtechblog.backend.entity.UserEntity;
import com.webtechblog.backend.enums.ActivityType;
import com.webtechblog.backend.helper.PostResponseHelper;
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

@Service
@RequiredArgsConstructor
public class PostLikeService {

    private final PostResponseHelper postResponseHelper;
    private final PostLikeRepository postLikeRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final HistoryWriteService historyService;

    @Transactional
    public boolean toggleLike(Long postId) {

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

        Long userId = user.getId();

        PostLikeEntity existing =
                postLikeRepository.findByPostIdAndUserId(postId, userId);

        boolean liked;

        if (existing != null) {

            if (existing.getStatus() == 1) {
                existing.setStatus(0);
                liked = false;
            } else {
                existing.setStatus(1);
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
            liked = true;
        }

        // Recalculate total active likes
        long likeCount = postLikeRepository.countByPostIdAndStatus(postId, 1);

        // Update only the like_count column
        postRepository.updateLikeCount(postId, likeCount);

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

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String email = authentication.getName();

        UserEntity loggedInUser =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException("User not found"));

        return postLikeRepository
                .findAllByUserIdAndStatusOrderByCreatedAtDesc(loggedInUser.getId(),1
                )
                .stream()
                .map(like -> postRepository.findById(like.getPostId()).orElse(null))
                .filter(Objects::nonNull)
                .map(postResponseHelper::build)
                .toList();
    }
}