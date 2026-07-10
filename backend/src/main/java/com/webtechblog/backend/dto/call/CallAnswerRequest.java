package com.webtechblog.backend.dto.call;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CallAnswerRequest {

    private String roomUuid;

    private String callerUuid;

    private String answer;

}