package com.webtechblog.backend.repository;

import com.webtechblog.backend.entity.BookmarkEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookmarkRepository extends JpaRepository<BookmarkEntity, Long> {

    Optional<BookmarkEntity> findByPostIdAndUserId(Long postId, Long userId);

    boolean existsByPostIdAndUserId(Long postId, Long userId);

    long countByPostIdAndStatus(Long postId, Integer status);

    void deleteByPostIdAndUserId(Long postId, Long userId);

    List<BookmarkEntity> findAllByUserIdAndStatusOrderByCreatedAtDesc(
            Long userId,
            Integer status
    );
}