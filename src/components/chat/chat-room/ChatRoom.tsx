import { collection, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../../../config/firebase";
import { setUsers } from "../../../store/features/usersSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import UserInfo from "../../../models/UserInfo";
import UserStatus from "../../../enums/UserStatus";
import Room from "./room/Room";

const ChatRoom = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);

  const users = useSelector((state: RootState) => state.users.list);
  const [friend, setFriend] = useState<UserInfo>();

  const getRoomId = () => {
    if (!friend || !user) return null;
    return [user.id, friend.id].sort().join("_");
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
      <ul className="chatroom__friends">
        {users.map(
          (currentUser) =>
            user?.id !== currentUser.id && (
              <li
                onClick={() => setFriend(currentUser)}
                key={currentUser.id}
                className="friends__friend"
              >
                <p className="friend__name">{currentUser.displayName} </p>
                <div
                  className={`friend__status ${
                    currentUser.status === UserStatus.ONLINE
                      ? "friend__status--online"
                      : "friend__status--offline"
                  }`}
                ></div>
              </li>
            )
        )}
      </ul>
      {friend && <Room roomId={getRoomId()} friendName={friend.displayName} />}
    </div>
  );
};

export default ChatRoom;
