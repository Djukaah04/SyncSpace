import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import UserInfo from "../../models/UserInfo";
import UserStatus from "../../enums/UserStatus";

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
      state.user.status = UserStatus.ONLINE;
    },
    clearUser: (state) => {
      state.user = null;
    },
    updateCar: (state, action: PayloadAction<string>) => {
      if (!state.user) return;
      state.user.carUrl = action.payload;
    },
    clearCar: (state) => {
      if (!state.user) return;
      state.user.carUrl = undefined;
    },
    setPhotoUrl: (state, action: PayloadAction<string>) => {
      if (!state.user) return;
      state.user.photoUrl = action.payload;
    },
  },
});

export const { setUser, clearUser, updateCar, clearCar, setPhotoUrl } =
  authSlice.actions;
export default authSlice.reducer;
