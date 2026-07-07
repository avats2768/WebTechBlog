import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "notificationSettings";

const defaultSettings = {
  pushAllEnabled: true,
  pushChatEnabled: true,
  pushMentionsEnabled: true,
  pushProductEnabled: false,
};

function loadInitialState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return { ...defaultSettings, ...JSON.parse(saved) };
  } catch (error) {
    console.error("Failed to read notification settings from storage:", error);
  }
  return defaultSettings;
}

const settingsSlice = createSlice({
  name: "settings",
  initialState: loadInitialState(),
  reducers: {
    setNotificationSetting(state, action) {
      const { key, value } = action.payload;
      state[key] = value;
    },
  },
});

export const { setNotificationSetting } = settingsSlice.actions;
export default settingsSlice.reducer;