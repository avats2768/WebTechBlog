package com.webtechblog.backend.service.chat;

import com.webtechblog.backend.dto.chat.ChatMessageResponse;
import com.webtechblog.backend.dto.chat.ChatRoomResponse;
import com.webtechblog.backend.dto.chat.SendMessageRequest;
import com.webtechblog.backend.entity.UserEntity;
import com.webtechblog.backend.entity.chat.ChatMessageEntity;
import com.webtechblog.backend.entity.chat.ChatRoomEntity;
import com.webtechblog.backend.entity.chat.ChatRoomParticipantEntity;
import com.webtechblog.backend.entity.chat.ChatUserStatusEntity;
import com.webtechblog.backend.repository.UserRepository;
import com.webtechblog.backend.repository.chat.ChatRoomParticipantRepository;
import com.webtechblog.backend.repository.chat.ChatRoomRepository;
import com.webtechblog.backend.repository.chat.ChatUserStatusRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ChatService {

    private final ChatRoomService chatRoomService;
    private final ChatMessageService chatMessageService;
    private final ChatReadService chatReadService;
    private final ChatRoomRepository chatRoomRepository;
    private final ChatRoomParticipantRepository participantRepository;
    private final ChatUserStatusRepository chatUserStatusRepository;
    private final ChatUserStatusService chatUserStatusService;
    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;

    @Value("${server.servlet.context-path}")
    private String contextPath;

    @Value("${app.base-url}")
    private String baseUrl;

    /**
     * Send Message
     */
    public ChatMessageResponse sendMessage(
            UserEntity sender,
            SendMessageRequest request
    ) {

        UserEntity receiver =
                chatRoomService.getUserByUuid(
                        request.getReceiverUuid()
                );

        ChatRoomEntity room =
                chatRoomService.findOrCreatePrivateRoom(
                        sender,
                        receiver
                );

        ChatMessageEntity message =
                chatMessageService.saveMessage(
                        room,
                        sender,
                        request.getMessage(),
                        request.getMessageType()
                );

        chatReadService.incrementUnreadCount(
                room.getId(),
                receiver.getId()
        );

        if (
                chatUserStatusService.isOnline(
                        receiver.getId()
                )
        ) {

            chatReadService.markDelivered(
                    message
            );

        }

        ChatMessageResponse response =
                ChatMessageResponse
                        .builder()
                        .uuid(message.getUuid())
                        .roomUuid(room.getUuid())
                        .senderUuid(sender.getUuid())
                        .senderId(sender.getId())
                        .receiverUuid(receiver.getUuid())
                        .message(message.getMessage())
                        .messageType(message.getMessageType())
                        .status(message.getStatus())
                        .createdAt(message.getCreatedAt())
                        .build();

        // Receiver ko message bhejo
        messagingTemplate.convertAndSendToUser(
                receiver.getEmail(),
                "/queue/messages",
                response
        );

// Sender ko bhi same message bhejo
        messagingTemplate.convertAndSendToUser(
                sender.getEmail(),
                "/queue/messages",
                response
        );

        return response;

    }

    /**
     * Chat History
     */
    public List<ChatMessageEntity> getHistory(
            String roomUuid
    ) {

        ChatRoomEntity room =
                chatRoomService.getRoomByUuid(
                        roomUuid
                );

        return chatMessageService.getMessages(
                room.getId()
        );

    }

    /**
     * Latest Messages
     */
    public List<ChatMessageEntity> latestMessages(
            String roomUuid
    ) {

        ChatRoomEntity room =
                chatRoomService.getRoomByUuid(
                        roomUuid
                );

        return chatMessageService.getLatestMessages(
                room.getId()
        );

    }

    /**
     * Read Message
     */
    public void markRead(
            String roomUuid,
            String messageUuid,
            UserEntity user
    ) {

        ChatRoomEntity room =
                chatRoomService.getRoomByUuid(
                        roomUuid
                );

        ChatMessageEntity message =
                chatMessageService.getMessage(
                        messageUuid
                );

        List<ChatMessageEntity> messages =
                chatMessageService.getMessages(room.getId());

        for (ChatMessageEntity msg : messages) {

            if (!msg.getSenderId().equals(user.getId())) {

                chatReadService.markRead(msg);

            }

        }

        chatReadService.resetUnreadCount(
                room.getId(),
                user.getId()
        );

        chatReadService.updateLastReadMessage(
                room.getId(),
                user.getId(),
                message.getId()
        );

    }

    @Transactional(readOnly = true)
    public List<ChatRoomResponse> getMyChats(
            UserEntity currentUser
    ) {

        List<ChatRoomParticipantEntity> participants =
                participantRepository.findAllByUserId(
                        currentUser.getId()
                );

        List<ChatRoomResponse> chats =
                new ArrayList<>();

        for (ChatRoomParticipantEntity participant : participants) {

            ChatRoomEntity room =
                    chatRoomRepository
                            .findById(participant.getRoomId())
                            .orElse(null);

            if (room == null) {
                continue;
            }

            Long otherUserId =
                    room.getUser1Id().equals(currentUser.getId())
                            ? room.getUser2Id()
                            : room.getUser1Id();

            UserEntity otherUser =
                    userRepository
                            .findById(otherUserId)
                            .orElse(null);

            if (otherUser == null) {
                continue;
            }

            ChatUserStatusEntity status =
                    chatUserStatusRepository
                            .findByUserId(otherUserId)
                            .orElse(null);

            chats.add(

                    ChatRoomResponse.builder()

                            .roomUuid(room.getUuid())

                            .userUuid(otherUser.getUuid())

                            .username(otherUser.getUsername())

                            .profileImage(baseUrl+contextPath+otherUser.getProfileImage())

                            .online(
                                    status != null &&
                                            Boolean.TRUE.equals(
                                                    status.getOnline()
                                            )
                            )

                            .lastSeen(
                                    status != null
                                            ? status.getLastSeen()
                                            : null
                            )

                            .lastMessage(
                                    room.getLastMessage()
                            )

                            .lastMessageAt(
                                    room.getLastMessageAt()
                            )

                            .unreadCount(
                                    participant.getUnreadCount()
                            )

                            .build()

            );

        }

        chats.sort((a, b) -> {

            if (a.getLastMessageAt() == null) return 1;

            if (b.getLastMessageAt() == null) return -1;

            return b.getLastMessageAt()
                    .compareTo(a.getLastMessageAt());

        });

        return chats;
    }

    @Transactional
    public ChatRoomResponse createPrivateChat(
            UserEntity sender,
            String receiverUuid
    ) {

        UserEntity receiver =
                chatRoomService.getUserByUuid(
                        receiverUuid
                );

        ChatRoomEntity room =
                chatRoomService.findOrCreatePrivateRoom(
                        sender,
                        receiver
                );

        ChatUserStatusEntity status =
                chatUserStatusRepository
                        .findByUserId(receiver.getId())
                        .orElse(null);

        ChatRoomParticipantEntity participant =
                participantRepository
                        .findByRoomIdAndUserId(
                                room.getId(),
                                sender.getId()
                        )
                        .orElse(null);

        return ChatRoomResponse
                .builder()

                .roomUuid(room.getUuid())

                .userUuid(receiver.getUuid())

                .username(receiver.getUsername())

                .profileImage(receiver.getProfileImage())

                .online(
                        status != null &&
                                Boolean.TRUE.equals(status.getOnline())
                )

                .lastSeen(
                        status != null
                                ? status.getLastSeen()
                                : null
                )

                .lastMessage(room.getLastMessage())

                .lastMessageAt(room.getLastMessageAt())

                .unreadCount(
                        participant != null
                                ? participant.getUnreadCount()
                                : 0
                )

                .build();

    }

}