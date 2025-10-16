import ProtectedRoutes from "./utils/protected-routes/ProtectedRoutes";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import Register from "./pages/register/Register";
import { useDispatch } from "react-redux";
import Login from "./pages/login/Login";
import { AppDispatch } from "./store";
import Home from "./pages/home/Home";

import "./styles/base/App.scss";
import Profile from "./components/profile/Profile";
import {
  subscribeToAuthChanges,
  subscribeToUsers,
} from "./services/userService";
function App() {
  const dispatch = useDispatch<AppDispatch>();

  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(dispatch, setIsAuthChecked);

    return () => {
      console.log("%c Auth UNSUBSCRIBE", "color: orange; font-size: 20px");
      unsubscribe();
    };
  }, [dispatch]);

  useEffect(() => {
    const unsubscribe = subscribeToUsers(dispatch);

    return () => {
      console.log("%c ChatRoom UNSUBSCRIBE", "color: red; font-size: 20px");
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
