package com.webtechblog.backend.repository;
import com.webtechblog.backend.entity.PostEntity;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Collection;
import java.util.List;

public interface PostRepository extends JpaRepository<PostEntity, Long> {

    List<PostEntity> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<PostEntity> findAllByOrderByCreatedAtDesc();

    Page<PostEntity> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Modifying
    @Query("UPDATE PostEntity p SET p.likeCount = :count WHERE p.id = :postId")
    void updateLikeCount(@Param("postId") Long postId,
                         @Param("count") Long count);

    @Modifying
    @Transactional
    @Query("UPDATE PostEntity p SET p.commentCount = :count WHERE p.id = :postId")
    void updateCommentCount(@Param("postId") Long postId,
                            @Param("count") Long count);

    List<PostEntity> findByIdIn(Collection<Long> ids);

    Page<PostEntity> findByUserIdOrderByCreatedAtDesc(
            Long userId,
            Pageable pageable
    );

    @Modifying
    @Transactional
    @Query("""
UPDATE PostEntity p
SET p.likeCount = p.likeCount + 1
WHERE p.id = :postId
""")
    void incrementLikeCount(@Param("postId") Long postId);

    @Modifying
    @Transactional
    @Query("""
UPDATE PostEntity p
SET p.likeCount =
CASE
WHEN p.likeCount > 0
THEN p.likeCount - 1
ELSE 0
END
WHERE p.id = :postId
""")
    void decrementLikeCount(@Param("postId") Long postId);


    @Modifying
    @Transactional
    @Query("""
UPDATE PostEntity p
SET p.bookmarkCount = p.bookmarkCount + 1
WHERE p.id = :postId
""")
    void incrementBookmarkCount(@Param("postId") Long postId);

    @Modifying
    @Transactional
    @Query("""
UPDATE PostEntity p
SET p.bookmarkCount =
CASE
WHEN p.bookmarkCount > 0
THEN p.bookmarkCount - 1
ELSE 0
END
WHERE p.id = :postId
""")
    void decrementBookmarkCount(@Param("postId") Long postId);

}