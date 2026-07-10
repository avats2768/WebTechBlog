package com.webtechblog.backend.dto.call;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CallRejectRequest {

    private String roomUuid;

    private String callerUuid;

}