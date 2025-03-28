import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store";
import ChatBox from "../../chat-box/ChatBox";

interface RoomProps {
  roomId: string | null;
  friendName: string | null;
  friendPhoto: string | undefined;
}

const Room = ({ roomId, friendName, friendPhoto }: RoomProps) => {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <div className="room">
      <div className="room__header">
        <h3> Room with {friendName}</h3>
        <div className="header__participants">
          <div className="participant__info">
            {friendPhoto && (
              <img
                src={friendPhoto}
                className="info__picture"
                alt="friend-picture"
              />
            )}
            <h4>{friendName}</h4>
          </div>
          <div className="participant__info">
            <h4>{user?.displayName}</h4>
            {user?.photoUrl && (
              <img
                src={user?.photoUrl}
                className="info__picture"
                alt="my-picture"
              />
            )}
          </div>
        </div>
      </div>
      <ChatBox roomId={roomId} friendName={friendName} />
    </div>
  );
};

export default Room;
