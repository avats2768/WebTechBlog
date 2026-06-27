package com.webtechblog.backend.repository;
import com.webtechblog.backend.entity.PostEntity;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PostRepository extends JpaRepository<PostEntity, Long> {

    List<PostEntity> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<PostEntity> findAllByOrderByCreatedAtDesc();

    @Modifying
    @Query("UPDATE PostEntity p SET p.likeCount = :count WHERE p.id = :postId")
    void updateLikeCount(@Param("postId") Long postId,
                         @Param("count") Long count);

    @Modifying
    @Transactional
    @Query("UPDATE PostEntity p SET p.commentCount = :count WHERE p.id = :postId")
    void updateCommentCount(@Param("postId") Long postId,
                            @Param("count") Long count);
}