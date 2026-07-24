package com.webtechblog.backend.service;

import com.webtechblog.backend.dto.post.PostResponse;
import com.webtechblog.backend.entity.PostEntity;
import com.webtechblog.backend.entity.UserEntity;
import com.webtechblog.backend.enums.ActivityType;
import com.webtechblog.backend.repository.HistoryRepository;
import com.webtechblog.backend.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class HistoryReadService {

    private final HistoryRepository historyRepository;

    private final PostRepository postRepository;

    private final CurrentUserService currentUserService;

    private final FeedService feedService;

    public List<PostResponse> getHistory() {

        UserEntity user =
                currentUserService.getCurrentUser();

        Set<Long> postIds =
                new LinkedHashSet<>(
                        historyRepository
                                .findByUserIdOrderByCreatedAtDesc(user.getId())
                                .stream()
                                .map(history -> history.getPostId())
                                .toList()
                );

        List<PostEntity> posts =
                postRepository.findByIdIn(postIds);

        return feedService.buildFeed(posts);

    }

    public List<PostResponse> getHistory(
            ActivityType activityType
    ) {

        UserEntity user =
                currentUserService.getCurrentUser();

        Set<Long> postIds =
                new LinkedHashSet<>(
                        historyRepository
                                .findByUserIdAndActivityTypeOrderByCreatedAtDesc(
                                        user.getId(),
                                        activityType
                                )
                                .stream()
                                .map(history -> history.getPostId())
                                .toList()
                );

        List<PostEntity> posts =
                postRepository.findByIdIn(postIds);

        return feedService.buildFeed(posts);

    }

}