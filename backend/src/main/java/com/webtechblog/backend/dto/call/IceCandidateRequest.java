package com.webtechblog.backend.dto.call;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class IceCandidateRequest {

    private String roomUuid;

    // Sender UUID
    private String senderUuid;

    // Receiver UUID
    private String receiverUuid;

    private String candidate;

    private String sdpMid;

    private Integer sdpMLineIndex;

}