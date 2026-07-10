import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let stompClient = null;

/**
 * Connect Call Socket
 */
export const connectCallSocket = (
  token,
  {
    onIncomingCall,
    onAnswerReceived,
    onIceCandidate,
    onRejected,
    onCallEnded,
  }
) => {

  stompClient = new Client({

    webSocketFactory: () =>
      new SockJS(
        "http://localhost:8080/api/v1/ws"
      ),

    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },

    reconnectDelay: 5000,

    debug: () => {},

    onConnect: () => {

      console.log("Call Socket Connected");

      /**
       * Incoming Call
       */
      stompClient.subscribe(
        "/user/queue/call/incoming",
        (message) => {

          if (onIncomingCall) {

            onIncomingCall(
              JSON.parse(message.body)
            );

          }

        }
      );

      /**
       * Call Answer
       */
      stompClient.subscribe(
        "/user/queue/call/answer",
        (message) => {

          if (onAnswerReceived) {

            onAnswerReceived(
              JSON.parse(message.body)
            );

          }

        }
      );

      /**
       * ICE Candidate
       */
      stompClient.subscribe(
        "/user/queue/call/ice",
        (message) => {

          if (onIceCandidate) {

            onIceCandidate(
              JSON.parse(message.body)
            );

          }

        }
      );

      /**
       * Call Rejected
       */
      stompClient.subscribe(
        "/user/queue/call/rejected",
        (message) => {

          if (onRejected) {

            onRejected(
              JSON.parse(message.body)
            );

          }

        }
      );

      /**
       * Call Ended
       */
      stompClient.subscribe(
        "/user/queue/call/end",
        (message) => {

          if (onCallEnded) {

            onCallEnded(
              JSON.parse(message.body)
            );

          }

        }
      );

    },

    onStompError: (frame) => {

      console.error(frame);

    },

  });

  stompClient.activate();

};

/**
 * Disconnect
 */
export const disconnectCallSocket = () => {

  if (stompClient) {

    stompClient.deactivate();

  }

};

/**
 * Start Call
 */
export const sendOffer = (payload) => {

  if (!stompClient?.connected) return;

  stompClient.publish({

    destination: "/app/call.offer",

    body: JSON.stringify(payload),

  });

};

/**
 * Accept Call
 */
export const sendAnswer = (payload) => {

  if (!stompClient?.connected) return;

  stompClient.publish({

    destination: "/app/call.answer",

    body: JSON.stringify(payload),

  });

};

/**
 * ICE Candidate
 */
export const sendIceCandidate = (payload) => {

  if (!stompClient?.connected) return;

  stompClient.publish({

    destination: "/app/call.ice",

    body: JSON.stringify(payload),

  });

};

/**
 * Reject Call
 */
export const rejectCall = (payload) => {

  if (!stompClient?.connected) return;

  stompClient.publish({

    destination: "/app/call.reject",

    body: JSON.stringify(payload),

  });

};

/**
 * End Call
 */
export const endCall = (payload) => {

  if (!stompClient?.connected) return;

  stompClient.publish({

    destination: "/app/call.end",

    body: JSON.stringify(payload),

  });

};