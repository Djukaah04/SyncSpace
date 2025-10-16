import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store";
import ChatBox from "../../chat-box/ChatBox";

interface RoomProps {
  roomId: string | null;
  friendName: string | undefined;
  friendPhoto: string | undefined;
}

const Room = ({ roomId, friendName, friendPhoto }: RoomProps) => {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <div className="room">
      {/* <h3 className="room__header">
         Room with {friendName}
      </h3> */}
      {/* <div className="room__header">
        <h3 className="room__title"> Room with {friendName}</h3>
      </div> */}
      <ChatBox roomId={roomId} friendName={friendName} />
    </div>
  );
};

export default Room;
