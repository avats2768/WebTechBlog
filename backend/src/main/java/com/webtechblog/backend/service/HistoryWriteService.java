package com.webtechblog.backend.service;

import com.webtechblog.backend.entity.HistoryEntity;
import com.webtechblog.backend.entity.UserEntity;
import com.webtechblog.backend.enums.ActivityType;
import com.webtechblog.backend.repository.HistoryRepository;
import com.webtechblog.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class HistoryWriteService {

    private final HistoryRepository historyRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;

    public void saveHistory(
            Long postId,
            ActivityType activityType
    ) {

        UserEntity user =
                currentUserService.getCurrentUser();

        if (user == null) {
            return;
        }

        HistoryEntity history =
                historyRepository
                        .findByUserIdAndPostIdAndActivityType(
                                user.getId(),
                                postId,
                                activityType
                        )
                        .orElse(null);

        // Already exists -> update timestamp
        if (history != null) {

            history.setCreatedAt(LocalDateTime.now());

            historyRepository.save(history);

            return;
        }

        // First time activity
        history = HistoryEntity.builder()
                .userId(user.getId())
                .postId(postId)
                .activityType(activityType)
                .createdAt(LocalDateTime.now())
                .build();

        historyRepository.save(history);
    }

    public void saveCommentHistory(
            Long postId,
            Long commentId
    ) {

        UserEntity user =
                currentUserService.getCurrentUser();

        if (user == null) {
            return;
        }

        HistoryEntity history =
                HistoryEntity.builder()
                        .userId(user.getId())
                        .postId(postId)
                        .activityType(ActivityType.COMMENT)
                        .referenceId(commentId)
                        .build();

        historyRepository.save(history);
    }

}