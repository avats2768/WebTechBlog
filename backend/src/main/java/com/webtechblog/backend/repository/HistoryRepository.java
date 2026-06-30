package com.webtechblog.backend.repository;

import com.webtechblog.backend.entity.HistoryEntity;
import com.webtechblog.backend.enums.ActivityType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HistoryRepository extends JpaRepository<HistoryEntity, Long> {

    List<HistoryEntity> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<HistoryEntity> findByUserIdAndActivityTypeOrderByCreatedAtDesc(
            Long userId,
            ActivityType activityType
    );

    Optional<HistoryEntity> findByUserIdAndPostIdAndActivityType(
            Long userId,
            Long postId,
            ActivityType activityType
    );
}