import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { connectChatSocket, onChatMessage } from "../socket/chatSocket";
import { getTotalUnreadMessage } from "../api/chatApi";
import { incrementUnread, setUnreadCount } from "../features/chat/chatSlice";
import { useToast } from "../context/ToastContext";

/**
 * Connects the shared chat socket ONCE and listens for incoming messages
 * from anywhere in the app. Mounted once at the layout root (HomeLayout).
 *
 * Does NOT call disconnectChatSocket() — the socket connection is shared
 * app-wide and should only be torn down on logout.
 */
export default function useUnreadMessagesSocket() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const currentUserId = useSelector((state) => state.auth.user?.userId);
  const activeRoomRef = useRef(null);

  const chatPushEnabled = useSelector(
    (state) => state.settings?.pushAllEnabled && state.settings?.pushChatEnabled
  );
  const chatPushEnabledRef = useRef(chatPushEnabled);
  useEffect(() => {
    chatPushEnabledRef.current = chatPushEnabled;
  }, [chatPushEnabled]);

  const chatsByRoom = useSelector((state) => state.chat?.chatsByRoom ?? {});
  const chatsByRoomRef = useRef(chatsByRoom);
  useEffect(() => {
    chatsByRoomRef.current = chatsByRoom;
  }, [chatsByRoom]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await getTotalUnreadMessage();
        if (!cancelled) dispatch(setUnreadCount(res.data.data));
      } catch (error) {
        console.error("Failed to load unread messages count:", error);
      }
    })();

    function handleActiveRoomChange(event) {
      activeRoomRef.current = event.detail?.roomUuid ?? null;
    }
    window.addEventListener("chat-active-room", handleActiveRoomChange);

    const token = localStorage.getItem("token");
    connectChatSocket(token);

    const unsubscribe = onChatMessage((message) => {
      const senderId = message.senderId ?? message.senderUuid;
      const isMine =
        currentUserId != null && Number(senderId) === Number(currentUserId);
      const isOpenRoom = message.roomUuid === activeRoomRef.current;

      if (isMine || isOpenRoom || !chatPushEnabledRef.current) return;

      dispatch(incrementUnread(1));

      const meta = chatsByRoomRef.current[message.roomUuid];
      toast.notify({
        title: meta?.username ?? "New message",
        body: message.message,
        avatar: meta?.profileImage,
        onClick: () =>
          navigate("/chat", {
            state: {
              roomUuid: message.roomUuid,
              userUuid: meta?.userUuid ?? message.senderUuid,
              username: meta?.username ?? "Chat",
              profileImage: meta?.profileImage,
            },
          }),
      });
    });

    return () => {
      cancelled = true;
      window.removeEventListener("chat-active-room", handleActiveRoomChange);
      unsubscribe();
      // Intentionally NOT calling disconnectChatSocket() here — see logout step below.
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, currentUserId]);
}