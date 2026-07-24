import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let stompClient = null;

// Resolves once the current connection attempt finishes. Lets us avoid
// tearing down a client that's mid-handshake, and lets callers `await`
// a guaranteed-connected socket before publishing anything.
let connectingPromise = null;

// Anything published while we're not yet connected gets queued here and
// flushed the moment onConnect fires, instead of being silently dropped.
let pendingMessages = [];

let subscriptions = [];

/**
 * Connect Call Socket. Returns a Promise that resolves once the socket is
 * connected (resolves immediately if already connected).
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

  // already connected
  if (stompClient?.connected) {
    return Promise.resolve();
  }

  // a connection attempt is already in flight - don't tear it down,
  // just piggyback on it.
  if (connectingPromise) {
    return connectingPromise;
  }

  // destroy previous (dead) client, if any
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }

  connectingPromise = new Promise((resolve) => {

    stompClient = new Client({

      webSocketFactory: () =>
        new SockJS(
          `${import.meta.env.VITE_TECH_API_URL}/ws`
        ),

      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },

      reconnectDelay: 5000,

      heartbeatIncoming: 10000,

      heartbeatOutgoing: 10000,

      debug: (msg) => {
        console.log("[CALL SOCKET]", msg);
      },

      onConnect: () => {

        console.log("✅ Call Socket Connected");

        subscribeCallEvents({
          onIncomingCall,
          onAnswerReceived,
          onIceCandidate,
          onRejected,
          onCallEnded,
        });

        flushPendingMessages();

        connectingPromise = null;
        resolve();

      },

      onDisconnect: () => {

        console.log("Call socket disconnected");

      },

      onWebSocketClose: () => {

        console.log("WebSocket closed");

      },

      onWebSocketError: (event) => {

        console.error("WebSocket Error", event);

      },

      onStompError: (frame) => {

        console.error("STOMP ERROR");

        console.error(frame.headers);

        console.error(frame.body);

      }

    });

    stompClient.activate();

  });

  return connectingPromise;

};

/**
 * Resolves once the socket is connected. Safe to call even if a
 * connection isn't in progress yet (e.g. resolves immediately if
 * already connected, or hangs until connectCallSocket is called
 * elsewhere and completes).
 */
export const waitForCallSocketConnection = () => {
  if (stompClient?.connected) return Promise.resolve();
  if (connectingPromise) return connectingPromise;
  return Promise.resolve(); // nothing to wait for - caller will see publish() queue it
};

function subscribeCallEvents({

  onIncomingCall,

  onAnswerReceived,

  onIceCandidate,

  onRejected,

  onCallEnded,

}) {

  if (!stompClient?.connected) {
    return;
  }

  // clear any stale subscription handles from a previous connection
  subscriptions = [];

  subscriptions.push(stompClient.subscribe(

    "/user/queue/call/incoming",

    ({ body }) => {

      console.log("Incoming Call");

      onIncomingCall?.(JSON.parse(body));

    }

  ));

  subscriptions.push(stompClient.subscribe(

    "/user/queue/call/answer",

    ({ body }) => {

      console.log("Answer Received");

      onAnswerReceived?.(JSON.parse(body));

    }

  ));

  subscriptions.push(stompClient.subscribe(

    "/user/queue/call/ice",

    ({ body }) => {

      onIceCandidate?.(JSON.parse(body));

    }

  ));

  subscriptions.push(stompClient.subscribe(

    "/user/queue/call/rejected",

    ({ body }) => {

      onRejected?.(JSON.parse(body));

    }

  ));

  subscriptions.push(stompClient.subscribe(

    "/user/queue/call/end",

    ({ body }) => {

      onCallEnded?.(JSON.parse(body));

    }

  ));

}

/**
 * Disconnect
 */
export const disconnectCallSocket = async () => {

  if (!stompClient) {
    return;
  }

  try {

    await stompClient.deactivate();

  } catch (e) {

    console.error(e);

  }

  stompClient = null;
  connectingPromise = null;
  pendingMessages = [];
  subscriptions = [];

};

function flushPendingMessages() {

  if (!stompClient?.connected || pendingMessages.length === 0) return;

  const queue = pendingMessages;
  pendingMessages = [];

  queue.forEach(({ destination, payload }) => {
    console.log("Flushing queued message ->", destination);
    stompClient.publish({
      destination,
      body: JSON.stringify(payload),
    });
  });

}

function publish(destination, payload) {

  if (!stompClient) {

    console.warn("Call socket not initialized");

    return false;

  }

  if (!stompClient.connected) {

    // Instead of silently dropping this (the old bug), queue it so it
    // goes out the instant the connection completes.
    console.warn(`Call socket not connected yet, queueing message to ${destination}`);

    pendingMessages.push({ destination, payload });

    return false;

  }

  stompClient.publish({

    destination,

    body: JSON.stringify(payload),

  });

  return true;

}

/**
 * Start Call
 */
export const sendOffer = (payload) => {

  console.log("Sending Offer");

  console.log(payload);

  return publish(

    "/app/call.offer",

    payload

  );

};

/**
 * Accept Call
 */
export const sendAnswer = (payload) => {

  console.log("Sending Answer");

  console.log(payload);

  return publish(

    "/app/call.answer",

    payload

  );

};

/**
 * ICE Candidate
 */
export const sendIceCandidate = (payload) => {

  return publish(

    "/app/call.ice",

    payload

  );

};

/**
 * Reject Call
 */
export const rejectCall = (payload) => {

  console.log("Reject Call");

  return publish(

    "/app/call.reject",

    payload

  );

};

/**
 * End Call
 */
export const endCall = (payload) => {

  console.log("End Call");

  return publish(

    "/app/call.end",

    payload

  );

};