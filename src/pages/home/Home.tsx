import React from "react";
import "./Home.scss";
import { Route, Routes, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { auth } from "../../config/firebase";
import Parking from "../../components/parking/Parking";
import Office from "../../components/Office";
import ChatRoom from "../../components/chat/chat-room/ChatRoom";

enum NavOptions {
  PARKING = "PARKING",
  CHATROOM = "CHATROOM",
  OFFICE = "OFFICE",
}
const Home = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  const onOptionChoose = (option: NavOptions) => {
    navigate(`/${option.toLowerCase()}`);
  };
  const onLogout = () => {
    signOut(auth);
  };
  return (
    <div className="home">
      <header className="home__header">
        <span className="header__placeholder"></span>
        <span className="header__title">Sync Space</span>
        <span className="header__logout">
          <button onClick={onLogout}>Logout</button>
        </span>
      </header>
      <div className="home__nav">
        <div
          onClick={() => onOptionChoose(NavOptions.PARKING)}
          className="home__nav-item"
        >
          PARKING
        </div>
        <div
          onClick={() => onOptionChoose(NavOptions.CHATROOM)}
          className="home__nav-item"
        >
          CHAT ROOM
        </div>
        <div
          onClick={() => onOptionChoose(NavOptions.OFFICE)}
          className="home__nav-item"
        >
          OFFICE
        </div>
      </div>

      <div className="home__content">
        <Routes>
          <Route element={<Parking />} path="/parking"></Route>
          <Route element={<ChatRoom />} path="/chatroom"></Route>
          <Route element={<Office />} path="/office"></Route>
        </Routes>
      </div>
    </div>
  );
};

export default Home;
