import React, { useEffect, useRef, useState } from "react";
import MessageInfo from "../../../models/MessageInfo";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../../../config/firebase";
import { setMessages } from "../../../store/features/chatSlice";

interface RoomProps {
  roomId: string | null;
  friendName: string | null;
}

const ChatBox = ({ roomId, friendName }: RoomProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const users = useSelector((state: RootState) => state.users.list);

  const messages: MessageInfo[] = useSelector(
    (state: RootState) => state.chat.messages
  );
  const [newMessage, setNewMessage] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const getReadableTime = (
    timestampNumber: number,
    onlyTime?: boolean
  ): string => {
    const date = new Date(timestampNumber);

    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();

    const daySuffix = (n: number) => {
      if (n >= 11 && n <= 13) return "th";
      switch (n % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };

    const hours = date.getHours();
    const minutes = date.getMinutes();
    const isPM = hours >= 12;
    const formattedHours = hours % 12 || 12; // Convert to 12-hour format
    const formattedMinutes = minutes.toString().padStart(2, "0");
    const period = isPM ? "pm" : "am";

    if (onlyTime) return `${formattedHours}:${formattedMinutes} ${period}`;

    return `${month} ${day}${daySuffix(
      day
    )}, ${year}, ${formattedHours}:${formattedMinutes} ${period}`;
  };
  const sendMessage = async () => {
    if (!roomId || !newMessage.trim() || !user?.displayName) return;

    const messageInfo: MessageInfo = {
      sender: user.displayName,
      text: newMessage,
      createdAt: serverTimestamp(),
      isSending: true,
    };

    dispatch(
      setMessages([
        ...messages,
        { ...messageInfo, createdAt: new Date().getTime() },
      ])
    );
    setNewMessage("");

    try {
      const roomRef = doc(db, `chat/${roomId}`);
      const messagesRef = collection(db, `chat/${roomId}/messages`);

      await runTransaction(db, async (transaction) => {
        await addDoc(messagesRef, messageInfo);
        transaction.set(
          roomRef,
          {
            lastMessage: messageInfo,
          },
          { merge: true }
        );
      });
    } catch (err) {
      console.error("Greska sa transakcijom", err);
    }
  };
  const onEnterPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };
  const checkRoom = async () => {
    const roomRef = doc(db, `chat/${roomId}`);
    const snapshot = await getDoc(roomRef);
    if (snapshot.exists()) {
      console.log("%c postoji soba!", "color: lightgreen; font-size: 25px");
    } else {
      console.log(
        "%c ne postoji soba, kreiram!",
        "color: orange; font-size: 25px"
      );
      if (friendName) {
        await setDoc(roomRef, {
          users: [user?.displayName, friendName],
          lastMessage: null,
          createdAt: serverTimestamp(),
        });
      } else {
        await setDoc(roomRef, {
          // users: [...users.map((currentUser) => currentUser.displayName)],
          lastMessage: null,
          createdAt: serverTimestamp(),
        });
      }
    }
  };

  useEffect(() => {
    checkRoom();
    console.log("%c roomId", "color: orange; font-size: 25px", roomId);
    const messagesRef = collection(db, `chat/${roomId}/messages`);
    const messagesQuery = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      if (snapshot.metadata.hasPendingWrites) return;

      console.log(
        "%c snapshot",
        "color: orange; font-size: 25px",
        snapshot.docs
      );
      const messageList: MessageInfo[] = snapshot.docs.map((doc) => {
        return {
          ...(doc.data() as MessageInfo),
          createdAt: doc.data().createdAt.toDate().getTime(),
          isSending: false,
        };
      });

      dispatch(setMessages(messageList));
      if (messagesEndRef.current) {
        // messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        const container = messagesEndRef.current;
        container.scrollTo({
          top: container.scrollHeight,
          behavior: "smooth",
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [dispatch, roomId]);

  return (
    <div className="chat">
      <div ref={messagesEndRef} className="messages">
        {messages.map((message, index) => (
          <div
            onClick={() => {
              console.log(
                "%c message",
                "color: orange; font-size: 25px",
                message
              );
            }}
            key={index}
            className={`message-row ${
              user && user.displayName && message.sender === user.displayName
                ? "message-row--me"
                : "message-row--friend"
            }`}
          >
            <span className="message-row__time-info">
              {getReadableTime(message.createdAt as number, true)}
            </span>
            <div
              className={`message ${
                message.isSending ? "message--is-sending" : ""
              }`}
              style={{
                backgroundColor: users.find(
                  (u) => u.displayName === message.sender
                )?.color,
              }}
            >
              {message.text}
            </div>
          </div>
        ))}
      </div>

      <div className="chat__footer">
        <input
          type="text"
          className="footer__message-input"
          placeholder="Type your message"
          onChange={(e) => setNewMessage(e.target.value)}
          value={newMessage}
          onBlur={(e) => {
            if (e.relatedTarget === null) {
              e.target.focus();
            }
          }}
          onKeyDown={onEnterPress}
        />
        <button onClick={sendMessage} className="footer__send-button">
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
