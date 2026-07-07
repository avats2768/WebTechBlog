package com.webtechblog.backend.config.websocket;

import com.webtechblog.backend.dto.chat.StatusResponse;
import com.webtechblog.backend.entity.chat.ChatUserStatusEntity;
import com.webtechblog.backend.repository.UserRepository;
import com.webtechblog.backend.repository.chat.ChatUserStatusRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class WebSocketEventListener {

    private final ChatUserStatusRepository chatUserStatusRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;

    @EventListener
    public void handleSessionConnected(SessionConnectedEvent event) {
        System.out.println("CONNECTED EVENT");
    }

    @EventListener
    public void handleSessionDisconnect(SessionDisconnectEvent event) {
        System.out.println("DISCONNECTED EVENT");
    }

    @EventListener
    public void handleWebSocketConnect(
            SessionConnectedEvent event
    ) {

        StompHeaderAccessor accessor =
                StompHeaderAccessor.wrap(event.getMessage());

        Authentication authentication =
                (Authentication) accessor.getUser();

        if (authentication == null) {
            return;
        }

        String email = authentication.getName();

        userRepository.findByEmail(email).ifPresent(user -> {

            ChatUserStatusEntity status =
                    chatUserStatusRepository
                            .findByUserId(user.getId())
                            .orElseGet(() -> {

                                ChatUserStatusEntity entity =
                                        new ChatUserStatusEntity();

                                entity.setUserId(user.getId());

                                return entity;
                            });

            status.setOnline(true);

            status.setSocketSession(
                    accessor.getSessionId()
            );

            status.setLastSeen(LocalDateTime.now());

            chatUserStatusRepository.save(status);


            messagingTemplate.convertAndSend(
                    "/topic/status",
                    new StatusResponse(
                            user.getUuid(),
                            true
                    )
            );


        });

    }

    @EventListener
    public void handleWebSocketDisconnect(
            SessionDisconnectEvent event
    ) {

        StompHeaderAccessor accessor =
                StompHeaderAccessor.wrap(event.getMessage());

        Authentication authentication =
                (Authentication) accessor.getUser();

        if (authentication == null) {
            return;
        }

        String email = authentication.getName();

        userRepository.findByEmail(email).ifPresent(user -> {

            chatUserStatusRepository
                    .findByUserId(user.getId())
                    .ifPresent(status -> {

                        status.setOnline(false);

                        status.setSocketSession(null);

                        status.setLastSeen(
                                LocalDateTime.now()
                        );

                        chatUserStatusRepository
                                .save(status);

                        messagingTemplate.convertAndSend(
                                "/topic/status",
                                new StatusResponse(
                                        user.getUuid(),
                                        false
                                )
                        );

                    });

        });

    }

}