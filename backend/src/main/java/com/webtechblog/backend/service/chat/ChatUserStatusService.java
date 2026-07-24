package com.webtechblog.backend.service.chat;

import com.webtechblog.backend.entity.chat.ChatUserStatusEntity;
import com.webtechblog.backend.repository.chat.ChatUserStatusRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class ChatUserStatusService {

    private final ChatUserStatusRepository
            chatUserStatusRepository;

    /**
     * User Online
     */
    public void setOnline(
            Long userId,
            String sessionId
    ) {

        ChatUserStatusEntity status =
                chatUserStatusRepository
                        .findByUserId(userId)
                        .orElseGet(() -> {

                            ChatUserStatusEntity entity =
                                    new ChatUserStatusEntity();

                            entity.setUserId(userId);

                            return entity;
                        });

        status.setOnline(true);

        status.setSocketSession(sessionId);

        status.setLastSeen(LocalDateTime.now());

        chatUserStatusRepository.save(status);

    }

    /**
     * User Offline
     */
    public void setOffline(
            Long userId
    ) {

        chatUserStatusRepository
                .findByUserId(userId)
                .ifPresent(status -> {

                    status.setOnline(false);

                    status.setSocketSession(null);

                    status.setLastSeen(LocalDateTime.now());

                    chatUserStatusRepository.save(status);

                });

    }

    /**
     * Is User Online
     */
    @Transactional(readOnly = true)
    public boolean isOnline(
            Long userId
    ) {

        return chatUserStatusRepository
                .findByUserId(userId)
                .map(ChatUserStatusEntity::getOnline)
                .orElse(false);

    }

    /**
     * Last Seen
     */
    @Transactional(readOnly = true)
    public LocalDateTime getLastSeen(
            Long userId
    ) {

        return chatUserStatusRepository
                .findByUserId(userId)
                .map(ChatUserStatusEntity::getLastSeen)
                .orElse(null);

    }

}