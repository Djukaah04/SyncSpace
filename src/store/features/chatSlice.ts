import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import MessageInfo from "../../models/MessageInfo";
import UserInfo from "../../models/UserInfo";

interface ChatState {
  messages: MessageInfo[];
  selectedFriend: UserInfo | undefined;
}

const initialState: ChatState = {
  messages: [],
  selectedFriend: undefined,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setMessages: (state, action: PayloadAction<MessageInfo[]>) => {
      state.messages = action.payload;
    },
    setSelectedFriend: (state, action: PayloadAction<UserInfo>) => {
      state.selectedFriend = action.payload;
    },
  },
});

export const { setMessages, setSelectedFriend } = chatSlice.actions;
export default chatSlice.reducer;
