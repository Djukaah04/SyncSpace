import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./features/authSlice";
import usersReducer from "./features/usersSlice";
import parkingReducer from "./features/parkingSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  users: usersReducer,
  parking: parkingReducer,
});

export default rootReducer;
