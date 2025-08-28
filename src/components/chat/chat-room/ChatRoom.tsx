import { collection, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../../../config/firebase";
import { setUsers } from "../../../store/features/usersSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import UserInfo from "../../../models/UserInfo";
import UserStatus from "../../../enums/UserStatus";
import Room from "./room/Room";
import { setSelectedFriend } from "../../../store/features/chatSlice";

const ChatRoom = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const selectedFriend = useSelector(
    (state: RootState) => state.chat.selectedFriend
  );

  const users = useSelector((state: RootState) => state.users.list);
  const [friend, setFriend] = useState<UserInfo>();

  const getRoomId = () => {
    if (!friend || !user) return null;
    return [user.id, friend.id].sort().join("_");
  };

  const onChooseFriend = (friend: UserInfo) => {
    dispatch(setSelectedFriend(friend));
    setFriend(friend);
  };

  const isNotMe = (userToCompare) => {
    return user?.id !== userToCompare.id;
  };

  useEffect(() => {
    const usersRef = collection(db, "users");

    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const usersList: UserInfo[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<UserInfo, "id">),
      }));
      dispatch(setUsers(usersList));
    });

    return () => {
      console.log("%c ChatRoom UNSUBSCRIBE", "color: red; font-size: 20px");
      unsubscribe();
    };
  }, [dispatch]);

  return (
    <div className="chatroom">
      <h2 className="chatroom__friends-title">Friends</h2>
      <ul className="chatroom__friends">
        {users.map(
          (u) =>
            isNotMe(u) && (
              <li
                onClick={() => onChooseFriend(u)}
                key={u.id}
                className={`friends__friend ${
                  selectedFriend?.id === u.id ? "friends__friend--active" : ""
                }`}
              >
                <p className="friend__name">{u.displayName}</p>
                <div
                  className={`friend__status ${
                    u.status === UserStatus.ONLINE
                      ? "friend__status--online"
                      : "friend__status--offline"
                  }`}
                ></div>
              </li>
            )
        )}
      </ul>
      {friend ? (
        <Room
          roomId={getRoomId()}
          friendName={friend.displayName}
          friendPhoto={friend.photoUrl}
        />
      ) : (
        <div className="chatroom__no-friend">
          <p>Select a friend to start chatting!</p>
        </div>
      )}
    </div>
  );
};

export default ChatRoom;
