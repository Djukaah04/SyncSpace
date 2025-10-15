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
    updateCarPlate: (state, action: PayloadAction<string | undefined>) => {
      if (!state.user) return;
      state.user.carPlate = action.payload;
    },
    setPhotoUrl: (state, action: PayloadAction<string>) => {
      if (!state.user) return;
      state.user.photoUrl = action.payload;
    },
    updateDisplayName: (state, action: PayloadAction<string>) => {
      if (!state.user) return;
      state.user.displayName = action.payload;
    },
    updateStatus: (state, action: PayloadAction<string>) => {
      if (!state.user) return;
      state.user.status = action.payload as UserStatus;
    },
  },
});

export const {
  setUser,
  clearUser,
  updateCar,
  clearCar,
  updateCarPlate,
  setPhotoUrl,
  updateDisplayName,
  updateStatus,
} = authSlice.actions;
export default authSlice.reducer;
