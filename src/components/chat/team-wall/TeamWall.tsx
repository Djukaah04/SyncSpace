import React, { useEffect, useState } from "react";
import ChatBox from "../chat-box/ChatBox";
import { collection, onSnapshot } from "firebase/firestore";
import UserInfo from "../../../models/UserInfo";
import { setUsers } from "../../../store/features/usersSlice";
import { AppDispatch, RootState } from "../../../store";
import { useDispatch, useSelector } from "react-redux";
import { db } from "../../../config/firebase";
import WallType from "../../../enums/WallType";

const TeamWall = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch<AppDispatch>();

  const [teamToShow, setTeamToShow] = useState(WallType.TEAM);

  const chooseWall = (wallType: WallType) => {
    setTeamToShow(wallType);
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
    <div className="team-wall">
      <div className="team-wall__options">
        <div
          className="team-wall__option"
          onClick={() => chooseWall(WallType.TEAM)}
        >
          Team {user?.team}
        </div>
        <div
          className="team-wall__option"
          onClick={() => chooseWall(WallType.COMPANY)}
        >
          Company
        </div>
      </div>

      {teamToShow === WallType.TEAM ? (
        <ChatBox roomId={`team-${user?.team}`} friendName={undefined} />
      ) : (
        <ChatBox roomId="company" friendName={undefined} />
      )}
    </div>
  );
};

export default TeamWall;
