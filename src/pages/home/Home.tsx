import ProfileMenu from "../../components/profile/ProfileMenu/ProfileMenu";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import ChatRoom from "../../components/chat/chat-room/ChatRoom";
import TeamWall from "../../components/chat/team-wall/TeamWall";
import Parking from "../../components/parking/Parking";
import Office from "../../components/Office";
import React, { useState } from "react";

enum NavOption {
  PARKING = "PARKING",
  CHATROOM = "CHATROOM",
  OFFICE = "OFFICE",
  TEAM_WALL = "TEAMWALL",
}
const Home = () => {
  const navigate = useNavigate();

  const location = useLocation();
  const [profileMenuOpen, setProfileMenuOpen] = useState<boolean>(false);

  const onOptionChoose = (option: NavOption) => {
    navigate(`/${option.toLowerCase()}`);
  };

  const getLocation = () => {
    return location.pathname.replace("/", "").toUpperCase();
  };

  const toggleProfileMenu = () => {
    setProfileMenuOpen(!profileMenuOpen);
  };

  return (
    <div className="home">
      <header className="home__header">
        <span className="header__title">Sync Space</span>
        <span className="header__profile-logo">
          <img
            onClick={toggleProfileMenu}
            src="assets/svg/businessman.svg"
            alt="profile-menu"
          />
          <ProfileMenu isOpen={profileMenuOpen} />
        </span>
      </header>

      <nav className="home__nav">
        <div
          onClick={() => onOptionChoose(NavOption.PARKING)}
          className={`home__nav-item ${
            getLocation() === NavOption.PARKING && "home__nav-item--active"
          }`}
        >
          PARKING
        </div>
        <div
          onClick={() => onOptionChoose(NavOption.CHATROOM)}
          className={`home__nav-item ${
            getLocation() === NavOption.CHATROOM && "home__nav-item--active"
          }`}
        >
          CHAT ROOM
        </div>
        <div
          onClick={() => onOptionChoose(NavOption.TEAM_WALL)}
          className={`home__nav-item ${
            getLocation() === NavOption.TEAM_WALL && "home__nav-item--active"
          }`}
        >
          TEAM WALL
        </div>
        <div
          onClick={() => onOptionChoose(NavOption.OFFICE)}
          className={`home__nav-item ${
            getLocation() === NavOption.OFFICE && "home__nav-item--active"
          }`}
        >
          OFFICE
        </div>
      </nav>

      <main className="home__content">
        <Routes>
          <Route element={<Parking />} path="/parking"></Route>
          <Route element={<ChatRoom />} path="/chatroom"></Route>
          <Route element={<TeamWall />} path="/teamwall"></Route>
          <Route element={<Office />} path="/office"></Route>
        </Routes>
      </main>
    </div>
  );
};

export default Home;
