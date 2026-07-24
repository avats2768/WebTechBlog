package com.webtechblog.backend.repository.chat;

import com.webtechblog.backend.entity.chat.ChatRoomParticipantEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatRoomParticipantRepository
        extends JpaRepository<ChatRoomParticipantEntity, Long> {

    List<ChatRoomParticipantEntity> findByRoomId(Long roomId);

    List<ChatRoomParticipantEntity> findByUserId(Long userId);

    Optional<ChatRoomParticipantEntity> findByRoomIdAndUserId(
            Long roomId,
            Long userId
    );

    boolean existsByRoomIdAndUserId(
            Long roomId,
            Long userId
    );

    long countByRoomId(Long roomId);

    List<ChatRoomParticipantEntity> findAllByUserId(
            Long userId
    );

    @Query("""
    SELECT COALESCE(SUM(c.unreadCount), 0)
    FROM ChatRoomParticipantEntity c
    WHERE c.userId = :userId
""")
    Long getTotalUnreadCountByUserId(@Param("userId") Long userId);

}