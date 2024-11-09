import React, { useEffect, useState } from "react";
import "./styles/App.scss";

import Login from "./pages/Login";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoutes from "./utils/ProtectedRoutes";
import Home from "./pages/Home";
import { auth } from "./config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import User from "./models/User";
import { useDispatch } from "react-redux";
import { AppDispatch } from "./store";
import { clearUser, setUser } from "./store/features/authSlice";

function App() {
  const dispatch = useDispatch<AppDispatch>();

  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        const user: User = {
          uid: authUser.uid,
          email: authUser.email,
          displayName: authUser.displayName,
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
    <div className="App">
      <header className="App-header">
        <BrowserRouter>
          <Routes>
            <Route element={<Login />} path="/login"></Route>
            <Route element={<ProtectedRoutes />}>
              <Route element={<Home />} path="/"></Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </header>
    </div>
  );
}

export default App;
