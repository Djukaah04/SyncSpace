import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./features/authSlice";
import usersReducer from "./features/usersSlice";
import parkingReducer from "./features/parkingSlice";
import chatReducer from "./features/chatSlice";
import notificationsReducer from "./features/notificationsSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  users: usersReducer,
  parking: parkingReducer,
  chat: chatReducer,
  notifications: notificationsReducer,
});

export default rootReducer;
