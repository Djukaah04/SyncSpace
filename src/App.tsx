import React from "react";
import "./styles/App.scss";

import Login from "./pages/Login";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoutes from "./utils/ProtectedRoutes";
import Home from "./pages/Home";
import { auth, db } from "./config/firebase";

function App() {
  console.log("%c db", "color: orange; font-size: 30px", db);
  console.log(
    "%c auth",
    "color: orange; font-size: 30px",
    auth.currentUser?.email
  );
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
