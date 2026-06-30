package com.webtechblog.backend.repository;

import com.webtechblog.backend.entity.PostLikeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostLikeRepository
        extends JpaRepository<PostLikeEntity, Long> {

    PostLikeEntity findByPostIdAndUserId(
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
}