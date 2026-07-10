package com.webtechblog.backend.controller.call;

import com.webtechblog.backend.dto.call.CallAnswerRequest;
import com.webtechblog.backend.dto.call.CallEndRequest;
import com.webtechblog.backend.dto.call.CallOfferRequest;
import com.webtechblog.backend.dto.call.CallRejectRequest;
import com.webtechblog.backend.dto.call.IceCandidateRequest;
import com.webtechblog.backend.entity.UserEntity;
import com.webtechblog.backend.repository.UserRepository;
import com.webtechblog.backend.service.call.CallService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class CallWebSocketController {

    private final CallService callService;

    private final UserRepository userRepository;

    private UserEntity getCurrentUser(
            Authentication authentication
    ) {

        return userRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

    }

    /**
     * Start Call
     */
    @MessageMapping("/call.offer")
    public void sendOffer(

            @Payload CallOfferRequest request,

            Authentication authentication

    ) {

        callService.sendOffer(

                getCurrentUser(authentication),

                request

        );

    }

    /**
     * Accept Call
     */
    @MessageMapping("/call.answer")
    public void sendAnswer(
            @Payload CallAnswerRequest request,
            Authentication authentication
    ) {

        System.out.println("========== CALL ANSWER ==========");
        System.out.println(request);
        System.out.println(authentication);

        callService.sendAnswer(
                getCurrentUser(authentication),
                request
        );
    }

    /**
     * ICE Candidate
     */
    @MessageMapping("/call.ice")
    public void sendIceCandidate(

            @Payload IceCandidateRequest request,

            Authentication authentication

    ) {

        callService.sendIceCandidate(

                getCurrentUser(authentication),

                request

        );

    }

    /**
     * Reject Call
     */
    @MessageMapping("/call.reject")
    public void rejectCall(
            @Payload CallRejectRequest request,
            Authentication authentication
    ) {

        System.out.println("========== CALL REJECT ==========");
        System.out.println(request);
        System.out.println(authentication);

        callService.rejectCall(
                getCurrentUser(authentication),
                request
        );
    }

    /**
     * End Call
     */
    @MessageMapping("/call.end")
    public void endCall(

            @Payload CallEndRequest request,

            Authentication authentication

    ) {

        callService.endCall(

                getCurrentUser(authentication),

                request

        );

    }

}