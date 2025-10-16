import React, { useEffect } from "react";
import ChatBox from "../chat-box/ChatBox";
import { collection, onSnapshot } from "firebase/firestore";
import UserInfo from "../../../models/UserInfo";
import { setUsers } from "../../../store/features/usersSlice";
import { AppDispatch } from "../../../store";
import { useDispatch } from "react-redux";
import { db } from "../../../config/firebase";

const TeamWall = () => {
  const dispatch = useDispatch<AppDispatch>();

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
      <h1>Team Wall</h1>
      <ChatBox roomId="team-wall" friendName={undefined} />
    </div>
  );
};

export default TeamWall;
