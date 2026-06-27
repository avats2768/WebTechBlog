package com.webtechblog.backend.service;

import com.webtechblog.backend.entity.PostLikeEntity;
import com.webtechblog.backend.entity.UserEntity;
import com.webtechblog.backend.repository.PostLikeRepository;
import com.webtechblog.backend.repository.PostRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.webtechblog.backend.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class PostLikeService {

    private final PostLikeRepository postLikeRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

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

        return liked;
    }

    public long getLikeCount(Long postId) {
        return postLikeRepository.countByPostIdAndStatus(postId, 1);
    }

    public boolean isLiked(Long postId) {

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

        PostLikeEntity like =
                postLikeRepository.findByPostIdAndUserId(postId, userId);

        return like != null && like.getStatus() == 1;
    }
}