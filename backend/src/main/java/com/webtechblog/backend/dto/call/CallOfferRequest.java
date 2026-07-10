package com.webtechblog.backend.dto.call;

import com.webtechblog.backend.enums.call.CallType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CallOfferRequest {

    private String roomUuid;

    private String receiverUuid;

    private CallType callType;

    private String offer;

}