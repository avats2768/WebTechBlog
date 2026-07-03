package com.webtechblog.backend.service.chat;

import com.webtechblog.backend.entity.UserEntity;
import com.webtechblog.backend.entity.chat.ChatRoomEntity;
import com.webtechblog.backend.entity.chat.ChatRoomParticipantEntity;
import com.webtechblog.backend.enums.chat.RoomType;
import com.webtechblog.backend.repository.UserRepository;
import com.webtechblog.backend.repository.chat.ChatRoomParticipantRepository;
import com.webtechblog.backend.repository.chat.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ChatRoomService {

    private final ChatRoomRepository chatRoomRepository;

    private final ChatRoomParticipantRepository
            participantRepository;

    private final UserRepository userRepository;

    /**
     * Find existing private room.
     * If room doesn't exist then create one.
     */
    public ChatRoomEntity findOrCreatePrivateRoom(
            UserEntity sender,
            UserEntity receiver
    ) {

        return chatRoomRepository
                .findPrivateRoom(
                        sender.getId(),
                        receiver.getId()
                )
                .orElseGet(() ->
                        createPrivateRoom(
                                sender,
                                receiver
                        )
                );
    }

    /**
     * Create Private Room
     */
    public ChatRoomEntity createPrivateRoom(
            UserEntity sender,
            UserEntity receiver
    ) {

        ChatRoomEntity room =
                new ChatRoomEntity();

        room.setRoomType(RoomType.PRIVATE);

        room.setUser1Id(sender.getId());

        room.setUser2Id(receiver.getId());

        room.setCreatedBy(sender.getId());

        room.setUpdatedBy(sender.getId());

        room =
                chatRoomRepository.save(room);

        addParticipant(
                room.getId(),
                sender.getId()
        );

        addParticipant(
                room.getId(),
                receiver.getId()
        );

        return room;
    }

    /**
     * Add User Into Room
     */
    public void addParticipant(
            Long roomId,
            Long userId
    ) {

        if (
                participantRepository
                        .existsByRoomIdAndUserId(
                                roomId,
                                userId
                        )
        ) {
            return;
        }

        ChatRoomParticipantEntity participant =
                new ChatRoomParticipantEntity();

        participant.setRoomId(roomId);

        participant.setUserId(userId);

        participantRepository.save(
                participant
        );

    }

    /**
     * Get Room By UUID
     */
    public ChatRoomEntity getRoomByUuid(
            String roomUuid
    ) {

        return chatRoomRepository
                .findByUuid(roomUuid)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Chat room not found"
                        )
                );

    }

    /**
     * Get User By UUID
     */
    public UserEntity getUserByUuid(
            String userUuid
    ) {

        return userRepository
                .findByUuid(userUuid)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );

    }

}