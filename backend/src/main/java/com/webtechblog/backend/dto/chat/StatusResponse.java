package com.webtechblog.backend.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class StatusResponse {

    private String userUuid;

    private Boolean online;

}