import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import MessageInfo from "../../models/MessageInfo";

interface ChatState {
  messages: MessageInfo[];
}

const initialState: ChatState = {
  messages: [],
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setMessages: (state, action: PayloadAction<MessageInfo[]>) => {
      state.messages = action.payload;
    },
  },
});

export const { setMessages } = chatSlice.actions;
export default chatSlice.reducer;
