import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import "../styles/Login.scss";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth, db } from "../config/firebase";
import { collection, getDocs } from "firebase/firestore";
import User from "../models/User";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { setUsersRedux } from "../store/features/usersSlice";

const Login = () => {
  const { register, handleSubmit } = useForm();
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [users, setUsers] = useState<User[]>([]);

  const dispatch = useDispatch<AppDispatch>();
  const usersListFromStore = useSelector(
    (state: RootState) => state.users.list
  );

  onAuthStateChanged(auth, (user) => {
    console.log("%c changed!", "color: lightgreen; font-size: 30px");
  });
  //ovo ce iz servisa kasnije
  const loginUser = async (email: string, password) => {
    try {
      const userCredentials = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log(
        "%c userCredentials",
        "color: orange; font-size: 30px",
        userCredentials
      );
    } catch (err) {
      console.log("%c ne valja", "color: red; font-size: 30px", err);
    }
  };
  const onLogIn = (e) => {
    console.log("%c e", "color: orange; font-size: 30px", e);
    // e.preventDefault();
    loginUser(email, password);
  };
  const onLogOut = () => {
    signOut(auth);
  };
  const log = () => {
    console.log("%c curr", "color: orange; font-size: 30px", auth.currentUser);
  };

  useEffect(() => {
    dispatch(fetchUsers());
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (user) {
        setUser(u);
      } else {
        setUser(null);
      }
    });

    return () => {
      console.log("%c unsubscribe!", "color: lightgreen; font-size: 30px");
      unsubscribe();
    };
  }, []);

  useEffect(() => {});
  const fetchUsers = () => async (dispatch) => {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);
    const usersList: User[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<User, "id">),
    }));

    dispatch(setUsersRedux(usersList));
  };
  return (
    <>
      <form className="form" onSubmit={handleSubmit(onLogIn)}>
        <input
          {...register("email")}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          {...register("password")}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />

        <p>Email is:{email}</p>
        <p>Password is:{password}</p>
        <p onClick={log}>Auth email: {auth.currentUser?.email}</p>
        <input type="submit" />
      </form>
      <button onClick={onLogOut}>Log out</button>

      <div>
        Users:
        {usersListFromStore.map((user) => (
          <div key={user.id}>
            {user.firstName} {user.lastName}
          </div>
        ))}
      </div>
    </>
  );
};

export default Login;
