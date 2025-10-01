import ProtectedRoutes from "./utils/protected-routes/ProtectedRoutes";
import { clearUser, setUser } from "./store/features/authSlice";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import Register from "./pages/register/Register";
import { auth, db } from "./config/firebase";
import UserStatus from "./enums/UserStatus";
import { useDispatch } from "react-redux";
import UserInfo from "./models/UserInfo";
import Login from "./pages/login/Login";
import { AppDispatch } from "./store";
import Home from "./pages/home/Home";

import "./styles/base/App.scss";
import Profile from "./components/profile/Profile";
function App() {
  const dispatch = useDispatch<AppDispatch>();

  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        const userDocRef = doc(db, "users", authUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const user: UserInfo = {
            id: authUser.uid,
            ...(userDoc.data() as Omit<UserInfo, "id">),
          };

          try {
            await updateDoc(userDocRef, { status: UserStatus.ONLINE });
          } catch (err) {
            throw new Error("Greska pri pamcenju statusa korisnika!", err);
          }

          dispatch(setUser(user));
        } else {
          console.log("%c userDoc ne postoji!", "color: pink; font-size: 25px");
        }
      } else {
        dispatch(clearUser());
      }
      setIsAuthChecked(true);
    });

    return () => {
      console.log("%c unsubscribe!", "color: lightgreen; font-size: 20px");
      unsubscribe();
    };
  }, [dispatch]);

  if (!isAuthChecked) {
    return (
      <div className="loading">
        <span>loading...</span>
        <img
          src="assets/svg/gear-spinner.svg"
          className="loading__gears"
          alt="gear-spinner"
        />
      </div>
    );
  }

  return (
    <div className="app">
      <BrowserRouter
        future={{
          v7_relativeSplatPath: true,
          v7_startTransition: true,
        }}
      >
        <Routes>
          <Route element={<Login />} path="/login"></Route>
          <Route element={<Register />} path="/register"></Route>
          <Route element={<ProtectedRoutes />}>
            <Route element={<Home />} path="/*"></Route>
            <Route element={<Profile />} path="/profile"></Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
