package com.webtechblog.backend.service;

import com.webtechblog.backend.dto.post.PostResponse;
import com.webtechblog.backend.entity.UserEntity;
import com.webtechblog.backend.enums.ActivityType;
import com.webtechblog.backend.helper.PostResponseHelper;
import com.webtechblog.backend.repository.HistoryRepository;
import com.webtechblog.backend.repository.PostRepository;
import com.webtechblog.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class HistoryReadService {

    private final HistoryRepository historyRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final PostResponseHelper postResponseHelper;

    /**
     * Get Complete Activity History
     */
    public List<PostResponse> getHistory() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String email = authentication.getName();

        UserEntity user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException("User not found"));

        return historyRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(history -> postRepository
                        .findById(history.getPostId())
                        .orElse(null))
                .filter(Objects::nonNull)
                .map(postResponseHelper::build)
                .toList();
    }

    /**
     * Filter by Activity
     */
    public List<PostResponse> getHistory(
            ActivityType activityType
    ) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String email = authentication.getName();

        UserEntity user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException("User not found"));

        return historyRepository
                .findByUserIdAndActivityTypeOrderByCreatedAtDesc(
                        user.getId(),
                        activityType
                )
                .stream()
                .map(history -> postRepository
                        .findById(history.getPostId())
                        .orElse(null))
                .filter(Objects::nonNull)
                .map(postResponseHelper::build)
                .toList();
    }
}