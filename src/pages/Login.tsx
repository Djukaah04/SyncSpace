import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import "../styles/Login.scss";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "../config/firebase";
import { collection, getDocs } from "firebase/firestore";
import User from "../models/User";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { setUsersRedux } from "../store/features/usersSlice";

import { useNavigate } from "react-router-dom";

interface LoginFormInputs {
  email: string;
  password: string;
}

const Login = () => {
  const navigate = useNavigate();

  const user = useSelector((state: RootState) => state.auth.user);

  const { register, handleSubmit } = useForm<LoginFormInputs>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onLogIn: SubmitHandler<LoginFormInputs> = async (
    formData: LoginFormInputs
  ) => {
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      navigate("/");
    } catch (err) {
      console.log("%c ne valja", "color: red; font-size: 30px", err);
    }
  };
  const onLogOut = () => {
    signOut(auth);
  };

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
        <p>Auth email: {auth.currentUser?.email}</p>
        <input type="submit" />
      </form>
      <button onClick={onLogOut}>Log out</button>

      <div>
        User:
        {user && user.email}
      </div>
    </>
  );
};

export default Login;
