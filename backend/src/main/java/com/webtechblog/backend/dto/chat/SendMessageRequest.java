package com.webtechblog.backend.dto.chat;

import com.webtechblog.backend.enums.chat.MessageType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SendMessageRequest {

    private String roomUuid;

    private String receiverUuid;

    private String message;

    private MessageType messageType;

}