package com.webtechblog.backend.repository;

import com.webtechblog.backend.entity.PostLikeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface PostLikeRepository extends JpaRepository<PostLikeEntity, Long> {

    Optional<PostLikeEntity> findByPostIdAndUserId(
            Long postId,
            Long userId
    );

    long countByPostIdAndStatus(
            Long postId,
            Integer status
    );

    List<PostLikeEntity> findAllByUserIdAndStatusOrderByCreatedAtDesc(
            Long userId,
            Integer status
    );

    // NEW
    List<PostLikeEntity> findByUserIdAndPostIdInAndStatus(
            Long userId,
            Collection<Long> postIds,
            Integer status
    );

}