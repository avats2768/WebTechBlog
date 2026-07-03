package com.webtechblog.backend.repository.chat;


import com.webtechblog.backend.entity.chat.ChatUserStatusEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ChatUserStatusRepository
        extends JpaRepository<ChatUserStatusEntity, Long> {

    Optional<ChatUserStatusEntity> findByUserId(Long userId);

}
