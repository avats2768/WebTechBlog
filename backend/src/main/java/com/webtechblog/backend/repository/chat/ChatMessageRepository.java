package com.webtechblog.backend.repository.chat;

import com.webtechblog.backend.entity.chat.ChatMessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatMessageRepository
        extends JpaRepository<ChatMessageEntity, Long> {

    Optional<ChatMessageEntity> findByUuid(String uuid);

    List<ChatMessageEntity> findByRoomIdOrderByCreatedAtAsc(
            Long roomId
    );

    List<ChatMessageEntity> findTop50ByRoomIdOrderByCreatedAtDesc(
            Long roomId
    );

    Optional<ChatMessageEntity> findTopByRoomIdOrderByCreatedAtDesc(
            Long roomId
    );

}