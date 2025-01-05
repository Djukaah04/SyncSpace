import { FieldValue } from "firebase/firestore";

interface MessageInfo {
  // roomId: string;
  text: string;
  createdAt: FieldValue | number;
  sender: string;
  isSending: boolean;
}

export default MessageInfo;
