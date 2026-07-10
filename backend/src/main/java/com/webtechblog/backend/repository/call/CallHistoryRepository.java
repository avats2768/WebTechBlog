package com.webtechblog.backend.repository.call;

import com.webtechblog.backend.entity.call.CallHistoryEntity;
import com.webtechblog.backend.enums.call.CallStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CallHistoryRepository
        extends JpaRepository<CallHistoryEntity, Long> {

    /**
     * Find Call by UUID
     */
    Optional<CallHistoryEntity> findByUuid(
            String uuid
    );

    /**
     * All calls of a room
     */
    List<CallHistoryEntity> findByRoomIdOrderByCreatedAtDesc(
            Long roomId
    );

    /**
     * Latest call of a room
     */
    Optional<CallHistoryEntity> findTopByRoomIdOrderByCreatedAtDesc(
            Long roomId
    );

    /**
     * Calls started by user
     */
    List<CallHistoryEntity> findByCallerIdOrderByCreatedAtDesc(
            Long callerId
    );

    /**
     * Calls received by user
     */
    List<CallHistoryEntity> findByReceiverIdOrderByCreatedAtDesc(
            Long receiverId
    );

    /**
     * Running call of room
     */
    Optional<CallHistoryEntity> findByRoomIdAndStatus(
            Long roomId,
            CallStatus status
    );

    @Query("""
SELECT c
FROM CallHistoryEntity c
WHERE c.callerId = :userId
   OR c.receiverId = :userId
ORDER BY c.createdAt DESC
""")
    List<CallHistoryEntity> findMyCalls(Long userId);

}