package com.webtechblog.backend.service.call;

import com.webtechblog.backend.dto.call.*;
import com.webtechblog.backend.entity.UserEntity;
import com.webtechblog.backend.entity.call.CallHistoryEntity;
import com.webtechblog.backend.entity.chat.ChatRoomEntity;
import com.webtechblog.backend.enums.call.CallStatus;
import com.webtechblog.backend.repository.UserRepository;
import com.webtechblog.backend.repository.call.CallHistoryRepository;
import com.webtechblog.backend.service.CurrentUserService;
import com.webtechblog.backend.service.chat.ChatRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CallService {

    private final ChatRoomService chatRoomService;

    private final CurrentUserService currentUserService;

    private final CallHistoryRepository callHistoryRepository;

    private final UserRepository userRepository;

    private final SimpMessagingTemplate messagingTemplate;

    private CallHistoryEntity getActiveCall(Long roomId) {

        return callHistoryRepository

                .findTopByRoomIdOrderByCreatedAtDesc(roomId)

                .orElseThrow(() ->
                        new RuntimeException("Call not found"));

    }

    /**
     * Caller starts a call
     */
    public void sendOffer(
            UserEntity caller,
            CallOfferRequest request
    ) {

        UserEntity receiver =
                chatRoomService.getUserByUuid(
                        request.getReceiverUuid()
                );

        ChatRoomEntity room =
                chatRoomService.findOrCreatePrivateRoom(
                        caller,
                        receiver
                );

        CallHistoryEntity call = new CallHistoryEntity();

        call.setRoomId(room.getId());
        call.setCallerId(caller.getId());
        call.setReceiverId(receiver.getId());
        call.setCallType(request.getCallType());

        call.setStatus(CallStatus.RINGING);

        call.setStartedAt(LocalDateTime.now());

        call.setCreatedBy(caller.getId());
        call.setUpdatedBy(caller.getId());

        call = callHistoryRepository.save(call);

        IncomingCallResponse response =
                IncomingCallResponse.builder()
                        .callUuid(call.getUuid())
                        .roomUuid(room.getUuid())
                        .callerUuid(caller.getUuid())
                        .callerName(caller.getUsername())
                        .callerProfileImage(caller.getProfileImage())
                        .callType(call.getCallType())
                        .offer(request.getOffer())
                        .build();

        System.out.println("========== OFFER ==========");
        System.out.println("Caller : " + caller.getUsername());
        System.out.println("Receiver : " + receiver.getUsername());

        messagingTemplate.convertAndSendToUser(
                receiver.getEmail(),
                "/queue/call/incoming",
                response
        );

    }

    /**
     * Receiver accepts call
     */
    public void sendAnswer(
            UserEntity receiver,
            CallAnswerRequest request
    ) {

        UserEntity caller =
                chatRoomService.getUserByUuid(
                        request.getCallerUuid()
                );

        ChatRoomEntity room =
                chatRoomService.getRoomByUuid(
                        request.getRoomUuid()
                );

        CallHistoryEntity call =
                callHistoryRepository
                        .findTopByRoomIdOrderByCreatedAtDesc(
                                room.getId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException("Call not found"));

        call.setStatus(CallStatus.ANSWERED);

        call.setAnsweredAt(LocalDateTime.now());

        call.setUpdatedBy(receiver.getId());

        callHistoryRepository.save(call);

        System.out.println("========== ANSWER ==========");
        System.out.println("Receiver : " + receiver.getUsername());
        System.out.println("Caller : " + caller.getUsername());

        messagingTemplate.convertAndSendToUser(
                caller.getEmail(),
                "/queue/call/answer",
                request
        );

    }

    /**
     * ICE Candidate
     */
    public void sendIceCandidate(
            UserEntity sender,
            IceCandidateRequest request
    ) {

        UserEntity receiver =
                chatRoomService.getUserByUuid(
                        request.getReceiverUuid()
                );

        System.out.println("ICE Candidate");

        messagingTemplate.convertAndSendToUser(
                receiver.getEmail(),
                "/queue/call/ice",
                request
        );

    }

    /**
     * Reject Call
     */
    public void rejectCall(
            UserEntity receiver,
            CallRejectRequest request
    ) {

        UserEntity caller =
                chatRoomService.getUserByUuid(
                        request.getCallerUuid()
                );

        ChatRoomEntity room =
                chatRoomService.getRoomByUuid(
                        request.getRoomUuid()
                );

        CallHistoryEntity call =
                callHistoryRepository
                        .findTopByRoomIdOrderByCreatedAtDesc(
                                room.getId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException("Call not found"));

        call.setStatus(CallStatus.REJECTED);

        call.setEndedAt(LocalDateTime.now());

        call.setEndedBy(receiver.getId());

        call.setUpdatedBy(receiver.getId());

        callHistoryRepository.save(call);

        System.out.println("Call Rejected");

        messagingTemplate.convertAndSendToUser(
                caller.getEmail(),
                "/queue/call/rejected",
                request
        );

    }

    /**
     * End Call
     */
    public void endCall(
            UserEntity user,
            CallEndRequest request
    ) {

        ChatRoomEntity room =
                chatRoomService.getRoomByUuid(
                        request.getRoomUuid()
                );

        CallHistoryEntity call =
                callHistoryRepository
                        .findTopByRoomIdOrderByCreatedAtDesc(
                                room.getId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException("Call not found"));

        call.setStatus(CallStatus.ENDED);

        call.setEndedAt(LocalDateTime.now());

        call.setEndedBy(user.getId());

        if (call.getAnsweredAt() != null) {

            call.setDurationSeconds(

                    java.time.Duration
                            .between(
                                    call.getAnsweredAt(),
                                    LocalDateTime.now()
                            )
                            .getSeconds()

            );

        }

        call.setUpdatedBy(user.getId());

        callHistoryRepository.save(call);

        Long otherUserId =
                call.getCallerId().equals(user.getId())
                        ? call.getReceiverId()
                        : call.getCallerId();

        UserEntity otherUser =
                userRepository.findById(otherUserId)
                        .orElseThrow(() ->
                                new RuntimeException("User not found"));

        System.out.println("Call Ended");

        messagingTemplate.convertAndSendToUser(
                otherUser.getEmail(),
                "/queue/call/end",
                request
        );

    }

    public List<CallHistoryResponse> getMyCallHistory() {

        UserEntity currentUser =
                currentUserService.getCurrentUser();

        List<CallHistoryEntity> calls =
                callHistoryRepository.findMyCalls(
                        currentUser.getId()
                );

        List<CallHistoryResponse> response =
                new ArrayList<>();

        for (CallHistoryEntity call : calls) {

            boolean incoming =
                    call.getReceiverId()
                            .equals(currentUser.getId());

            Long otherUserId =
                    incoming
                            ? call.getCallerId()
                            : call.getReceiverId();

            UserEntity otherUser =
                    userRepository
                            .findById(otherUserId)
                            .orElseThrow(() ->
                                    new RuntimeException("User not found"));

            ChatRoomEntity room =
                    chatRoomService.getRoomById(
                            call.getRoomId()
                    );

            response.add(

                    CallHistoryResponse.builder()

                            .callUuid(call.getUuid())

                            .roomUuid(room.getUuid())

                            .userUuid(otherUser.getUuid())

                            .username(otherUser.getUsername())

                            .profileImage(otherUser.getProfileImage())

                            .callType(call.getCallType())

                            .status(call.getStatus())

                            .incoming(incoming)

                            .durationSeconds(call.getDurationSeconds())

                            .endedAt(call.getEndedAt())

                            .build()

            );

        }

        return response;

    }

    public List<CallHistoryResponse> getRoomCallHistory(
            String roomUuid
    ) {

        UserEntity currentUser =
                currentUserService.getCurrentUser();

        ChatRoomEntity room =
                chatRoomService.getRoomByUuid(
                        roomUuid
                );

        List<CallHistoryEntity> calls =
                callHistoryRepository
                        .findByRoomIdOrderByCreatedAtDesc(
                                room.getId()
                        );

        List<CallHistoryResponse> response =
                new ArrayList<>();

        for (CallHistoryEntity call : calls) {

            boolean incoming =
                    call.getReceiverId()
                            .equals(currentUser.getId());

            Long otherUserId =
                    incoming
                            ? call.getCallerId()
                            : call.getReceiverId();

            UserEntity otherUser =
                    userRepository
                            .findById(otherUserId)
                            .orElseThrow(() ->
                                    new RuntimeException("User not found"));

            response.add(

                    CallHistoryResponse.builder()

                            .callUuid(call.getUuid())

                            .roomUuid(room.getUuid())

                            .userUuid(otherUser.getUuid())

                            .username(otherUser.getUsername())

                            .profileImage(otherUser.getProfileImage())

                            .callType(call.getCallType())

                            .status(call.getStatus())

                            .incoming(incoming)

                            .durationSeconds(call.getDurationSeconds())

                            .endedAt(call.getEndedAt())

                            .build()

            );

        }

        return response;

    }

}