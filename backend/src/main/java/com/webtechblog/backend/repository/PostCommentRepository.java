package com.webtechblog.backend.repository;

import com.webtechblog.backend.entity.PostCommentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface PostCommentRepository
        extends JpaRepository<PostCommentEntity, Long> {

    List<PostCommentEntity>
    findByPostIdAndStatusOrderByCreatedAtDesc(
            Long postId,
            Integer status
    );

    long countByPostIdAndStatus(
            Long postId,
            Integer status
    );

    List<PostCommentEntity>
    findByPostIdInAndStatusOrderByCreatedAtDesc(
            Collection<Long> postIds,
            Integer status
    );

}