import { createSlice } from "@reduxjs/toolkit";

const initialState = {};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // increment(state) {
    //   state.value += 1;
    // },
    // Additional reducers can be added here
  },
});

// export const { increment } = authSlice.actions;
export default authSlice.reducer;
