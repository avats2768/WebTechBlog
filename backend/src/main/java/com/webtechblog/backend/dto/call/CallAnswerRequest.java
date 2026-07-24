package com.webtechblog.backend.dto.call;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CallAnswerRequest {

    private String roomUuid;

    // Person who started the call
    private String callerUuid;

    // Person accepting the call
    private String receiverUuid;

    // SDP Answer
    private String answer;

}