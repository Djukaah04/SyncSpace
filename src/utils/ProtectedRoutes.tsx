import { Outlet, Navigate } from "react-router-dom";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";

const ProtectedRoutes = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  console.log("%c user je:", "color: lightgreen; font-size: 25px", user);
  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoutes;
