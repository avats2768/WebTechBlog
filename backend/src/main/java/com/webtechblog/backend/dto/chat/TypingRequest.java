package com.webtechblog.backend.dto.chat;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TypingRequest {

    private String roomUuid;

    private Boolean typing;

}