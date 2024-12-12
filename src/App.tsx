import React, { useEffect, useState } from "react";
import "./styles/base/App.scss";

import Login from "./pages/login/Login";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoutes from "./utils/protected-routes/ProtectedRoutes";
import { auth } from "./config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import UserInfo from "./models/UserInfo";
import { useDispatch } from "react-redux";
import { AppDispatch } from "./store";
import { clearUser, setUser } from "./store/features/authSlice";
import Home from "./pages/home/Home";
import Register from "./pages/register/Register";

function App() {
  const dispatch = useDispatch<AppDispatch>();

  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        const user: UserInfo = {
          uid: authUser.uid,
          email: authUser.email,
          displayName: authUser.displayName,
          age: 26,
        };
        dispatch(setUser(user));
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
    return <div>Loading...</div>;
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
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
