import { useEffect, useRef, useState } from "react";
import {
  connectCallSocket,
  disconnectCallSocket,
  sendOffer,
  sendAnswer,
  sendIceCandidate,
  rejectCall,
  endCall,
} from "../socket/callSocket";

// Public STUN server for NAT traversal. For production, add a TURN server
// here too (most calls behind symmetric NATs/corporate firewalls need one),
// e.g. { urls: "turn:your.turn.server:3478", username: "...", credential: "..." }
const RTC_CONFIG = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

/**
 * Owns all WebRTC + call-socket state and logic for a single chat room.
 * Connected/disconnected per-page (unlike the chat socket which is shared
 * by HomeLayout). If your app already opens the call socket globally,
 * move the connect/disconnect effect up there and drop it from here.
 */
export default function useCall({ chat, chatInfo, authToken, currentUserId }) {
  // status: 'idle' | 'calling' (outgoing, ringing) | 'incoming' | 'connected'
  const [callState, setCallState] = useState({ status: "idle", isVideo: false, caller: null });
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);

const peerConnectionRef = useRef(null);

const localStreamRef = useRef(null);

const remoteStreamRef = useRef(new MediaStream());

const pendingCandidatesRef = useRef([]);

const incomingOfferRef = useRef(null);

const remoteUserUuidRef = useRef(null);

const localVideoRef = useRef(null);

const remoteVideoRef = useRef(null);

const durationIntervalRef = useRef(null);

// THIS MUST EXIST
const callStateRef = useRef(callState);

  useEffect(() => {
    callStateRef.current = callState;
  }, [callState]);

  useEffect(() => {
    if (!chat || !authToken) return;

    connectCallSocket(authToken, {
      onIncomingCall: handleIncomingCall,
      onAnswerReceived: handleAnswerReceived,
      onIceCandidate: handleRemoteIceCandidate,
      onRejected: handleCallRejected,
      onCallEnded: handleRemoteCallEnded,
    });

    return () => {
      cleanupCallResources();
      disconnectCallSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken]);

  useEffect(() => {
    if (callState.status === "connected") {
      setCallDuration(0);
      durationIntervalRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(durationIntervalRef.current);
    }
    return () => clearInterval(durationIntervalRef.current);
  }, [callState.status]);

  function createPeerConnection() {

    const pc = new RTCPeerConnection(RTC_CONFIG);

    peerConnectionRef.current = pc;

    remoteStreamRef.current = new MediaStream();

    if (remoteVideoRef.current) {

        remoteVideoRef.current.srcObject =
            remoteStreamRef.current;

    }

    pc.onicegatheringstatechange = () => {

    console.log(
        "ICE Gathering:",
        pc.iceGatheringState
    );

};

    pc.ontrack = (event) => {

    console.log(
        "Remote Track:",
        event.track.kind
    );

    event.streams[0].getTracks().forEach(track => {

        remoteStreamRef.current.addTrack(track);

    });

};

    pc.onicecandidate = (event) => {

        if (!event.candidate) return;

        if (!remoteUserUuidRef.current) {

    console.log("Receiver UUID missing");

    return;

}

        sendIceCandidate({

            receiverUuid:
                remoteUserUuidRef.current,

            roomUuid:
                chat.roomUuid,

            candidate:
                event.candidate.candidate,

            sdpMid:
                event.candidate.sdpMid,

            sdpMLineIndex:
                event.candidate.sdpMLineIndex

        });

    };

    pc.onconnectionstatechange = () => {

    console.log("Connection State:", pc.connectionState);

    switch (pc.connectionState) {

        case "connected":

            console.log("WebRTC Connected");

            break;

        case "failed":

        case "closed":

            cleanupCallResources();

            setCallState({
                status: "idle",
                isVideo: false,
                caller: null
            });

            break;

        case "disconnected":

            console.log("Temporarily disconnected");

            break;
    }

};

    pc.oniceconnectionstatechange = () => {

        console.log(

            "ICE:",

            pc.iceConnectionState

        );

    };

    return pc;

}

  function flushPendingIceCandidates() {
    const pc = peerConnectionRef.current;
    if (!pc) return;
    pendingCandidatesRef.current.forEach((candidate) => {
      pc.addIceCandidate(candidate).catch((err) => console.error("addIceCandidate failed", err));
    });
    pendingCandidatesRef.current = [];
  }

  function cleanupCallResources() {
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;

    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    remoteStreamRef.current
.getTracks()
.forEach(track => track.stop());

remoteStreamRef.current =
new MediaStream();

if (remoteVideoRef.current){

    remoteVideoRef.current.srcObject = null;

}

    pendingCandidatesRef.current = [];
    incomingOfferRef.current = null;
    setMicEnabled(true);
    setCamEnabled(true);
  }

  const startCall = async (type) => {
    const isVideo = type === "video-call";
    setCallState({ status: "calling", isVideo, caller: chatInfo });

    try {
      remoteUserUuidRef.current =
chat.userUuid;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: isVideo });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const pc = createPeerConnection();
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      sendOffer({

    receiverUuid: chat.userUuid,

    roomUuid: chat.roomUuid,

    callType: isVideo ? "VIDEO" : "AUDIO",

    offer: JSON.stringify(offer)

});
    } catch (err) {
      console.error("Could not start call", err);
      cleanupCallResources();
      setCallState({ status: "idle", isVideo: false, caller: null });
    }
  };

  function handleIncomingCall(payload) {
    // Expected payload shape (adjust to match your backend DTO if different):
    // { senderUuid, senderName, senderImage, roomUuid, callType: 'AUDIO' | 'VIDEO', type: 'offer', sdp }
    if (callStateRef.current.status !== "idle") {
      rejectCall({

    callerUuid: payload.callerUuid,

    roomUuid: payload.roomUuid

});
      return;
    }

    remoteUserUuidRef.current =
payload.callerUuid;

    incomingOfferRef.current = payload;

setCallState({

    status: "incoming",

    isVideo: payload.callType === "VIDEO",

    caller: {

        username: payload.callerName,

        profileImage: payload.callerProfileImage

    }

});
  }

  const acceptIncomingCall = async () => {
    const payload = incomingOfferRef.current;
    if (!payload) return;

    try {
      const isVideo = payload.callType === "VIDEO";
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: isVideo });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const pc = createPeerConnection();
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const offer = JSON.parse(payload.offer);

await pc.setRemoteDescription(

new RTCSessionDescription(

offer

));

      flushPendingIceCandidates();

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      sendAnswer({

    callerUuid: payload.callerUuid,

    roomUuid: payload.roomUuid,

    answer: JSON.stringify(answer)

});

      setCallState((prev) => ({ ...prev, status: "connected" }));
    } catch (err) {
      console.error("Could not accept call", err);
      declineIncomingCall();
    }
  };

  const declineIncomingCall = () => {
    const payload = incomingOfferRef.current;
    if (payload) {
      rejectCall({

    callerUuid: payload.callerUuid,

    roomUuid: payload.roomUuid

});
    }
    cleanupCallResources();
    setCallState({ status: "idle", isVideo: false, caller: null });
  };

  async function handleAnswerReceived(payload) {
    const pc = peerConnectionRef.current;
    if (!pc) return;
    try {
      const answer = JSON.parse(payload.answer);

await pc.setRemoteDescription(

new RTCSessionDescription(

answer

));

      flushPendingIceCandidates();
      setCallState((prev) => ({ ...prev, status: "connected" }));
    } catch (err) {
      console.error("Could not apply remote answer", err);
    }
  }

  function handleRemoteIceCandidate(payload) {
    const pc = peerConnectionRef.current;
    if (!payload?.candidate) return;
    const candidate =
    new RTCIceCandidate({

        candidate: payload.candidate,

        sdpMid: payload.sdpMid,

        sdpMLineIndex: payload.sdpMLineIndex

    });

    if (pc && pc.remoteDescription) {
      pc.addIceCandidate(candidate).catch((err) => console.error("addIceCandidate failed", err));
    } else {
      pendingCandidatesRef.current.push(candidate);
    }
  }

  function handleCallRejected() {
    cleanupCallResources();
    setCallState({ status: "idle", isVideo: false, caller: null });
  }

  function handleRemoteCallEnded() {
    cleanupCallResources();
    setCallState({ status: "idle", isVideo: false, caller: null });
  }

  const hangUp = () => {
    endCall({ receiverUuid: chat.userUuid, roomUuid: chat.roomUuid });
    cleanupCallResources();
    setCallState({ status: "idle", isVideo: false, caller: null });
  };

  const toggleMic = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setMicEnabled(track.enabled);
  };

  const toggleCam = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setCamEnabled(track.enabled);
  };

  return {
    callState,
    micEnabled,
    camEnabled,
    callDuration,
    localVideoRef,
    remoteVideoRef,
    startCall,
    acceptIncomingCall,
    declineIncomingCall,
    hangUp,
    toggleMic,
    toggleCam,
  };
}