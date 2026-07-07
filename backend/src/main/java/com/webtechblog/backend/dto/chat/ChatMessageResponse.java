package com.webtechblog.backend.dto.chat;

import com.webtechblog.backend.enums.chat.MessageStatus;
import com.webtechblog.backend.enums.chat.MessageType;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class ChatMessageResponse {

    private String uuid;

    private String roomUuid;

    private String senderUuid;

    private long senderId;

    private String receiverUuid;

    private String message;

    private MessageType messageType;

    private MessageStatus status;

    private LocalDateTime createdAt;

}