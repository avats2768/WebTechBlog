import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    unreadCount: 0,
    chatsByRoom: {},
  },
  reducers: {
    setUnreadCount(state, action) {
      state.unreadCount = Math.max(0, action.payload);
    },
    incrementUnread(state, action) {
      state.unreadCount += action.payload ?? 1;
    },
    clearUnread(state) {
      state.unreadCount = 0;
    },
    setChatsMeta(state, action) {
      const chats = action.payload ?? [];
      chats.forEach((chat) => {
        state.chatsByRoom[chat.roomUuid] = {
          userUuid: chat.userUuid,
          username: chat.username,
          profileImage: chat.profileImage,
        };
      });
    },
  },
});

export const { setUnreadCount, incrementUnread, clearUnread, setChatsMeta } =
  chatSlice.actions;
export default chatSlice.reducer;