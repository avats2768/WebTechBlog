package com.webtechblog.backend.service.chat;

import com.webtechblog.backend.entity.chat.ChatMessageEntity;
import com.webtechblog.backend.entity.chat.ChatRoomParticipantEntity;
import com.webtechblog.backend.enums.chat.MessageStatus;
import com.webtechblog.backend.repository.chat.ChatMessageRepository;
import com.webtechblog.backend.repository.chat.ChatRoomParticipantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ChatReadService {

    private final ChatRoomParticipantRepository participantRepository;

    private final ChatMessageRepository messageRepository;

    /**
     * Increase receiver unread count
     */
    public void incrementUnreadCount(
            Long roomId,
            Long receiverId
    ) {

        participantRepository
                .findByRoomIdAndUserId(
                        roomId,
                        receiverId
                )
                .ifPresent(participant -> {

                    participant.setUnreadCount(
                            participant.getUnreadCount() + 1
                    );

                    participantRepository.save(participant);

                });

    }

    /**
     * Reset unread count
     */
    public void resetUnreadCount(
            Long roomId,
            Long userId
    ) {

        participantRepository
                .findByRoomIdAndUserId(
                        roomId,
                        userId
                )
                .ifPresent(participant -> {

                    participant.setUnreadCount(0);

                    participantRepository.save(participant);

                });

    }

    /**
     * Update last read message
     */
    public void updateLastReadMessage(
            Long roomId,
            Long userId,
            Long messageId
    ) {

        participantRepository
                .findByRoomIdAndUserId(
                        roomId,
                        userId
                )
                .ifPresent(participant -> {

                    participant.setLastReadMessageId(
                            messageId
                    );

                    participantRepository.save(participant);

                });

    }

    /**
     * Message Delivered
     */
    public void markDelivered(
            ChatMessageEntity message
    ) {

        if (message.getStatus() == MessageStatus.SENT) {

            message.setStatus(
                    MessageStatus.DELIVERED
            );

            messageRepository.save(message);

        }

    }

    /**
     * Message Read
     */
    public void markRead(
            ChatMessageEntity message
    ) {

        if (message.getStatus() != MessageStatus.READ) {

            message.setStatus(
                    MessageStatus.READ
            );

            messageRepository.save(message);

        }

    }

}