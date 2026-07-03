package com.webtechblog.backend.service.chat;

import com.webtechblog.backend.entity.UserEntity;
import com.webtechblog.backend.entity.chat.ChatMessageEntity;
import com.webtechblog.backend.entity.chat.ChatRoomEntity;
import com.webtechblog.backend.enums.chat.MessageStatus;
import com.webtechblog.backend.enums.chat.MessageType;
import com.webtechblog.backend.repository.chat.ChatMessageRepository;
import com.webtechblog.backend.repository.chat.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;

    private final ChatRoomRepository chatRoomRepository;

    /**
     * Save Message
     */
    public ChatMessageEntity saveMessage(
            ChatRoomEntity room,
            UserEntity sender,
            String message,
            MessageType messageType
    ) {

        ChatMessageEntity chatMessage =
                new ChatMessageEntity();

        chatMessage.setRoomId(room.getId());

        chatMessage.setSenderId(sender.getId());

        chatMessage.setMessage(message);

        chatMessage.setMessageType(
                messageType == null
                        ? MessageType.TEXT
                        : messageType
        );

        chatMessage.setStatus(
                MessageStatus.SENT
        );

        chatMessage.setCreatedBy(
                sender.getId()
        );

        chatMessage.setUpdatedBy(
                sender.getId()
        );

        chatMessage =
                chatMessageRepository.save(chatMessage);

        updateLastMessage(room, chatMessage);

        return chatMessage;
    }

    /**
     * Update Room Last Message
     */
    private void updateLastMessage(
            ChatRoomEntity room,
            ChatMessageEntity message
    ) {

        room.setLastMessageId(
                message.getId()
        );

        room.setLastMessage(
                message.getMessage()
        );

        room.setLastMessageAt(
                message.getCreatedAt()
        );

        room.setUpdatedBy(
                message.getSenderId()
        );

        chatRoomRepository.save(room);

    }

    /**
     * Chat History
     */
    @Transactional(readOnly = true)
    public List<ChatMessageEntity> getMessages(
            Long roomId
    ) {

        return chatMessageRepository
                .findByRoomIdOrderByCreatedAtAsc(
                        roomId
                );

    }

    /**
     * Latest 50 Messages
     */
    @Transactional(readOnly = true)
    public List<ChatMessageEntity> getLatestMessages(
            Long roomId
    ) {

        return chatMessageRepository
                .findTop50ByRoomIdOrderByCreatedAtDesc(
                        roomId
                );

    }

    /**
     * Get Message By UUID
     */
    @Transactional(readOnly = true)
    public ChatMessageEntity getMessage(
            String uuid
    ) {

        return chatMessageRepository
                .findByUuid(uuid)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Message not found"
                        )
                );

    }

    /**
     * Delete Message
     */
    public void deleteMessage(
            ChatMessageEntity message
    ) {

        message.setIsDeleted(true);

        chatMessageRepository.save(message);

    }

    /**
     * Edit Message
     */
    public ChatMessageEntity editMessage(
            ChatMessageEntity message,
            String newMessage
    ) {

        message.setMessage(newMessage);

        message.setIsEdited(true);

        return chatMessageRepository.save(message);

    }

}