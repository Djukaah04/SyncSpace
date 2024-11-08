import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import User from "../../models/User";

interface UsersState {
  list: User[];
}

const initialState: UsersState = {
  list: [],
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUsersRedux: (state, action: PayloadAction<User[]>) => {
      state.list = action.payload;
    },
    addUser: (state, action: PayloadAction<User>) => {
      state.list.push(action.payload);
    },
    deleteUser: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((user) => user.id === action.payload);
    },
  },
});

export const { setUsersRedux, addUser, deleteUser } = usersSlice.actions;
export default usersSlice.reducer;
