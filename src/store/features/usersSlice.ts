import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import UserInfo from "../../models/UserInfo";

interface UsersState {
  list: UserInfo[];
}

const initialState: UsersState = {
  list: [],
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<UserInfo[]>) => {
      state.list = action.payload;
    },
    addUser: (state, action: PayloadAction<UserInfo>) => {
      state.list.push(action.payload);
    },
    deleteUser: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((user) => user.id === action.payload);
    },
  },
});

export const { setUsers, addUser, deleteUser } = usersSlice.actions;
export default usersSlice.reducer;
