package com.webtechblog.backend.repository.chat;

import com.webtechblog.backend.entity.chat.ChatRoomEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface ChatRoomRepository
        extends JpaRepository<ChatRoomEntity, Long> {

    Optional<ChatRoomEntity> findByUuid(String uuid);

    Optional<ChatRoomEntity> findById(Long id);

    @Query("""
SELECT c
FROM ChatRoomEntity c
WHERE
(c.user1Id=:user1 AND c.user2Id=:user2)
OR
(c.user1Id=:user2 AND c.user2Id=:user1)
""")
    Optional<ChatRoomEntity> findPrivateRoom(
            Long user1,
            Long user2
    );

}