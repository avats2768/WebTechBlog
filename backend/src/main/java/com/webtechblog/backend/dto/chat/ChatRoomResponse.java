package com.webtechblog.backend.dto.chat;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoomResponse {

    private String roomUuid;

    private String userUuid;

    private String username;

    private String profileImage;

    private Boolean online;

    private LocalDateTime lastSeen;

    private String lastMessage;

    private LocalDateTime lastMessageAt;

    private Integer unreadCount;

}