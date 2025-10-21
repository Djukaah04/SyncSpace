import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import UserInfo from "../../../models/UserInfo";
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

  const isNotMe = (userToCompare: UserInfo) => {
    return user?.id !== userToCompare.id;
  };

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
                  className={`friend__status friend__status--${u.status.toLowerCase()}`}
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
