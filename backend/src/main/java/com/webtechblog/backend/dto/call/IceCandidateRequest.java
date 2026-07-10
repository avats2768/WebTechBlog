package com.webtechblog.backend.dto.call;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class IceCandidateRequest {

    private String roomUuid;

    private String receiverUuid;

    private String candidate;

    private String sdpMid;

    private Integer sdpMLineIndex;

}