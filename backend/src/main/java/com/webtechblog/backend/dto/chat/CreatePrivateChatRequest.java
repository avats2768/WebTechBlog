package com.webtechblog.backend.dto.chat;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreatePrivateChatRequest {

    private String receiverUuid;

}
