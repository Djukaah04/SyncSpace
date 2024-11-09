import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./features/authSlice";
import usersReducer from "./features/usersSlice";
// import authReducer from '../features/auth/authSlice';
// import bookingsReducer from '../features/bookings/bookingsSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  users: usersReducer,
});

export default rootReducer;
