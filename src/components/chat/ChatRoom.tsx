import { collection, getDocs } from "firebase/firestore";
import React from "react";
import { db } from "../../config/firebase";
import User from "../../models/User";
import { setUsers } from "../../store/features/usersSlice";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

const CharRoom = () => {
  const users = useSelector((state: RootState) => state.users.list);

  const fetchUsers = () => async (dispatch) => {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);
    const usersList: User[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<User, "id">),
    }));

    dispatch(setUsers(usersList));
  };
  return (
    <div className="chatroom">
      CharRoom
      {}
    </div>
  );
};

export default CharRoom;
