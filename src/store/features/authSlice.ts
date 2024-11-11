import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import UserInfo from "../../models/UserInfo";

interface AuthState {
  user: UserInfo | null;
}
const initialState: AuthState = {
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserInfo>) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
