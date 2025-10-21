import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import ChatRoom from "../../components/chat/chat-room/ChatRoom";
import TeamWall from "../../components/chat/team-wall/TeamWall";
import Parking from "../../components/parking/Parking";
import Events from "../../components/events/Events";
import Welcome from "../../components/welcome/Welcome";
import Layout from "../../components/layout/Layout";
import Office from "../../components/office/Office";
import UserRole from "../../enums/UserRole";
import { RootState } from "../../store";
import { useSelector } from "react-redux";
import UserStatus from "../../enums/UserStatus";

enum NavOption {
  PARKING = "PARKING",
  CHATROOM = "CHATROOM",
  OFFICE = "OFFICE",
  TEAM_WALL = "TEAMWALL",
  EVENTS = "EVENTS",
}
const Home = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  const location = useLocation();

  const navigateTo = (option?: NavOption) => {
    if (option) navigate(`/${option.toLowerCase()}`);
    else navigate("/");
  };

  const getLocation = () => {
    return location.pathname.replace("/", "").toUpperCase();
  };

  const goToProfile = () => {
    navigate("/profile");
  };

  return (
    <div className="home">
      <header className="home__header">
        <div className="header__upper-row">
          <span onClick={() => navigateTo()} className="header__title">
            Sync Space
          </span>

          <span className="header__profile-logo">
            <span
              className={`friend__status friend__status--${user?.status.toLowerCase()}`}
            ></span>
            <span className="header__user-name">{user?.displayName}</span>
            <img
              onClick={goToProfile}
              src="assets/svg/businessman.svg"
              alt="profile-menu"
            />
            {user && user.role === UserRole.ADMIN && (
              <span className="star">★</span>
            )}
          </span>
        </div>
        <nav className="home__nav">
          <div
            onClick={() => navigateTo(NavOption.PARKING)}
            className={`home__nav-item ${
              getLocation() === NavOption.PARKING
                ? "home__nav-item--active"
                : ""
            }`}
          >
            <img
              src="assets/images/parking.png"
              alt="parking-logo"
              className="nav-item__icon"
            />
            Parking
          </div>
          <div
            onClick={() => navigateTo(NavOption.CHATROOM)}
            className={`home__nav-item ${
              getLocation() === NavOption.CHATROOM
                ? "home__nav-item--active"
                : ""
            }`}
          >
            <img
              src="assets/svg/chat-bubble.svg"
              alt="chat-bubble-logo"
              className="nav-item__icon"
            />
            Chat Room
          </div>
          <div
            onClick={() => navigateTo(NavOption.TEAM_WALL)}
            className={`home__nav-item ${
              getLocation() === NavOption.TEAM_WALL
                ? "home__nav-item--active"
                : ""
            }`}
          >
            <img
              src="assets/svg/team-hair.svg"
              alt="team-logo"
              className="nav-item__icon"
            />
            Team Wall
          </div>
          <div
            onClick={() => navigateTo(NavOption.OFFICE)}
            className={`home__nav-item ${
              getLocation() === NavOption.OFFICE ? "home__nav-item--active" : ""
            }`}
          >
            <img
              src="assets/svg/chair.svg"
              alt="chair-logo"
              className="nav-item__icon"
            />
            Office
          </div>
          <div
            onClick={() => navigateTo(NavOption.EVENTS)}
            className={`home__nav-item ${
              getLocation() === NavOption.EVENTS ? "home__nav-item--active" : ""
            }`}
          >
            <img
              src="assets/svg/calendar.svg"
              alt="calendar-logo"
              className="nav-item__icon"
            />
            Events
          </div>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Welcome />} path="/"></Route>
          <Route element={<Parking />} path="/parking"></Route>
          <Route element={<ChatRoom />} path="/chatroom"></Route>
          <Route element={<TeamWall />} path="/teamwall"></Route>
          <Route element={<Office />} path="/office"></Route>
          <Route element={<Events />} path="/events"></Route>
        </Route>
      </Routes>
    </div>
  );
};

export default Home;
