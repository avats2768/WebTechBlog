package com.webtechblog.backend.controller.chat;

import com.webtechblog.backend.dto.chat.ChatMessageResponse;
import com.webtechblog.backend.dto.chat.SendMessageRequest;
import com.webtechblog.backend.entity.UserEntity;
import com.webtechblog.backend.repository.UserRepository;
import com.webtechblog.backend.service.chat.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final ChatService chatService;

    private final UserRepository userRepository;

    @MessageMapping("/chat.send")
    public void sendMessage(
            @Payload SendMessageRequest request,
            Principal principal
    ) {

        System.out.println(principal.getName());

        UserEntity sender =
                userRepository.findByEmail(principal.getName())
                        .orElseThrow(() -> new RuntimeException("User not found"));

        chatService.sendMessage(sender, request);
    }

}