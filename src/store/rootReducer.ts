import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./features/authSlice";
import usersReducer from "./features/usersSlice";
import parkingReducer from "./features/parkingSlice";
import chatReducer from "./features/chatSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  users: usersReducer,
  parking: parkingReducer,
  chat: chatReducer,
});

export default rootReducer;
