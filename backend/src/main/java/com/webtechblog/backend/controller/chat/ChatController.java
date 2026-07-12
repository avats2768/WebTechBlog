package com.webtechblog.backend.controller.chat;

import com.webtechblog.backend.dto.ApiResponse;
import com.webtechblog.backend.dto.chat.ChatRoomResponse;
import com.webtechblog.backend.dto.chat.CreatePrivateChatRequest;
import com.webtechblog.backend.entity.UserEntity;
import com.webtechblog.backend.entity.chat.ChatMessageEntity;
import com.webtechblog.backend.repository.UserRepository;
import com.webtechblog.backend.service.chat.ChatReadService;
import com.webtechblog.backend.service.chat.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/chat")
public class ChatController {

    private final ChatService chatService;
    private final ChatReadService chatReadService;
    private final UserRepository userRepository;

    @GetMapping("/history/{roomUuid}")
    public List<ChatMessageEntity> history(
            @PathVariable String roomUuid
    ) {

        return chatService.getHistory(
                roomUuid
        );

    }

    @GetMapping("/latest/{roomUuid}")
    public List<ChatMessageEntity> latest(
            @PathVariable String roomUuid
    ) {

        return chatService.latestMessages(
                roomUuid
        );

    }

    @PutMapping("/read/{roomUuid}/{messageUuid}")
    public void markRead(
            @PathVariable String roomUuid,
            @PathVariable String messageUuid,
            Authentication authentication
    ) {

        String email =
                authentication.getName();

        UserEntity user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException("User not found"));

        chatService.markRead(
                roomUuid,
                messageUuid,
                user
        );

    }

    @GetMapping("/list")
    public List<ChatRoomResponse> getMyChats(
            Authentication authentication
    ) {

        String email =
                authentication.getName();

        UserEntity user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException("User not found"));

        return chatService.getMyChats(
                user
        );

    }

    @PostMapping("/private")
    public ChatRoomResponse createPrivateChat(
            @RequestBody CreatePrivateChatRequest request,
            Authentication authentication
    ) {

        String email =
                authentication.getName();

        UserEntity sender =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException("User not found"));

        return chatService.createPrivateChat(
                sender,
                request.getReceiverUuid()
        );

    }

    @GetMapping("/total-unread-count")
    public ApiResponse<?> getTotalUnreadCount(){
        return ApiResponse.builder()
                .data(chatReadService.totalUnreadCount())
                .message("Total unread count fetch successfully")
                .success(true)
                .build();
    }

    @PutMapping("/clear/{roomUuid}")
    public ApiResponse<?> clearChat(
            @PathVariable String roomUuid
    ) {

        chatService.clearChat(
                roomUuid
        );

        return ApiResponse.builder()
                .success(true)
                .message("Chat cleared successfully.")
                .build();

    }

}