package com.webtechblog.backend.dto.call;

import com.webtechblog.backend.enums.call.CallType;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class IncomingCallResponse {

    private String callUuid;

    private String roomUuid;

    private String callerUuid;

    private String callerName;

    private String callerProfileImage;

    private CallType callType;

    private String offer;

}