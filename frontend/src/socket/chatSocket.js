import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let stompClient = null;
let isConnecting = false;

// Multiple components can care about incoming messages/status without
// each owning the connection. connectChatSocket() is safe to call from
// several places — it only actually connects once.
const messageListeners = new Set();
const statusListeners = new Set();

function handleIncomingMessage(frame) {
  const parsed = JSON.parse(frame.body);
  messageListeners.forEach((listener) => listener(parsed));
}

function handleIncomingStatus(frame) {
  const parsed = JSON.parse(frame.body);
  statusListeners.forEach((listener) => listener(parsed));
  // Keep the existing window event too, in case anything else relies on it.
  window.dispatchEvent(new CustomEvent("chat-status", { detail: parsed }));
}

export const connectChatSocket = (token) => {
  if (stompClient?.active || isConnecting) return;

  isConnecting = true;

  stompClient = new Client({
    webSocketFactory: () => new SockJS("http://localhost:8080/api/v1/ws"),
    connectHeaders: { Authorization: `Bearer ${token}` },
    reconnectDelay: 5000,
    debug: () => {},

    onConnect: () => {
      isConnecting = false;
      stompClient.subscribe("/user/queue/messages", handleIncomingMessage);
      stompClient.subscribe("/topic/status", handleIncomingStatus);
    },

    onStompError: (frame) => {
      isConnecting = false;
      console.error(frame);
    },

    onWebSocketClose: () => {
      isConnecting = false;
    },
  });

  stompClient.activate();
};

// Only call this on logout / full app teardown — never from individual
// pages like ChatPage or ChatList. The connection is shared app-wide.
export const disconnectChatSocket = () => {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }
};

// Register/unregister a listener for incoming chat messages.
// Returns an unsubscribe function — call it in your useEffect cleanup.
export const onChatMessage = (listener) => {
  messageListeners.add(listener);
  return () => messageListeners.delete(listener);
};

// Same pattern for online/offline status updates.
export const onChatStatus = (listener) => {
  statusListeners.add(listener);
  return () => statusListeners.delete(listener);
};

export const sendMessage = (payload) => {
  if (!stompClient?.connected) {
    console.log("Not connected");
    return;
  }
  stompClient.publish({
    destination: "/app/chat.send",
    body: JSON.stringify(payload),
  });
};