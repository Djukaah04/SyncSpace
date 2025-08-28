import React from "react";
import { RootState } from "../../store";
import { useSelector } from "react-redux";

const Welcome = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  const daySuffix = (n: number) => {
    if (n >= 11 && n <= 13) return "th";
    switch (n % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  const getCurrentDate = () => {
    const date = new Date();
    const month = date.toLocaleString("default", { month: "long" });
    const day = date.getDate();
    const suffix = daySuffix(day);
    return `${month} ${day}${suffix}`;
  };

  return (
    <div className="welcome">
      <span className="blue-side" />
      <div className="welcome__user-info">
        <h1 className="user-info__welcome-title">
          Welcome back, {user?.displayName}
        </h1>
        <p className="user-info__info-item">Today is {getCurrentDate()}</p>
        <p className="user-info__info-item">
          You reserved Parkign #broj for DATUM
        </p>
        <p className="user-info__info-item">Meeting: IME MITINGA at TIME</p>
      </div>
      <div className="welcome__user-card">
        <img
          className="user-card__picture"
          src={user?.photoUrl ? user.photoUrl : "assets/svg/businessman.svg"}
          alt={user?.photoUrl ? "user-photo" : "placeholder"}
        />

        <h3 className="user-card__user-name">{user?.displayName}</h3>
        <span>Role: {user?.role}</span>
      </div>
    </div>
  );
};

export default Welcome;
