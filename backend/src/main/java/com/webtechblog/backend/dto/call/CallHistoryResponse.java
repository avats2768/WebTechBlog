package com.webtechblog.backend.dto.call;

import com.webtechblog.backend.enums.call.CallStatus;
import com.webtechblog.backend.enums.call.CallType;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class CallHistoryResponse {

    private String callUuid;

    private String roomUuid;

    private String userUuid;

    private String username;

    private String profileImage;

    private CallType callType;

    private CallStatus status;

    private Boolean incoming;

    private Long durationSeconds;

    private LocalDateTime endedAt;

}
