package com.webtechblog.backend.repository;

import com.webtechblog.backend.entity.PostLikeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

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
}