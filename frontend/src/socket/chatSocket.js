import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let stompClient = null;

export const connectChatSocket = (
  token,
  onMessageReceived
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

    onConnect: (frame) => {
    console.log("WebSocket Connected");
    console.log(frame);


      stompClient.subscribe(
        "/user/queue/messages",
        (message) => {

          if (onMessageReceived) {

            onMessageReceived(
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

export const disconnectChatSocket = () => {

  if (stompClient) {
    stompClient.deactivate();
  }

};

export const sendMessage = (payload) => {

  console.log("Connected:", stompClient?.connected);

  if (!stompClient?.connected) {
    console.log("Not connected");
    return;
  }

  console.log("Publishing", payload);

  stompClient.publish({
    destination: "/app/chat.send",
    body: JSON.stringify(payload),
  });
};