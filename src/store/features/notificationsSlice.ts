import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import NotificationInfo from "../../models/NotificationInfo";

interface NofificationsState {
  notifications: NotificationInfo[];
}

const initialState: NofificationsState = {
  notifications: [],
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<NotificationInfo[]>) => {
      state.notifications = action.payload;
    },
    // addNotification: (state, action: PayloadAction<NotificationInfo>) => {
    //   state.notifications.push(action.payload);
    // },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id === action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const {
  setNotifications,
  // addNotification,
  removeNotification,
  clearNotifications,
} = notificationsSlice.actions;
export default notificationsSlice.reducer;
