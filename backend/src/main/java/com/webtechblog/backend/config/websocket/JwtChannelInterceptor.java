package com.webtechblog.backend.config.websocket;

import com.webtechblog.backend.security.JwtService;
import com.webtechblog.backend.security.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.*;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JwtChannelInterceptor
        implements ChannelInterceptor {

    private final JwtService jwtService;

    private final UserDetailsServiceImpl userDetailsService;

    @Override
    public Message<?> preSend(
            Message<?> message,
            MessageChannel channel
    ) {

        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(
                        message,
                        StompHeaderAccessor.class
                );

        System.out.println("Command : " + accessor.getCommand());

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {

            System.out.println("CONNECT received");

            String authHeader =
                    accessor.getFirstNativeHeader("Authorization");

            System.out.println("Authorization = " + authHeader);

            if (
                    authHeader != null &&
                            authHeader.startsWith("Bearer ")
            ) {

                String token =
                        authHeader.substring(7);

                String email =
                        jwtService.extractUsername(token);

                UserDetails userDetails =
                        userDetailsService
                                .loadUserByUsername(email);

                if (jwtService.isTokenValid(token, userDetails.getUsername())) {

                    System.out.println("Token Valid");

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    accessor.setUser(authentication);

                    System.out.println("User = " + accessor.getUser());
                }

            }

        }

//        accessor.setUser(authentication);

        return MessageBuilder
                .fromMessage(message)
                .setHeaders(accessor)
                .build();
    }

}