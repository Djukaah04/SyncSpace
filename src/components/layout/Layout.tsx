import React from "react";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <main className="home__content">
      <Outlet></Outlet>
    </main>
  );
};

export default Layout;
