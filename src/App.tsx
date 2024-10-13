import React from "react";
import "./styles/App.scss";

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";

import Login from "./pages/Login";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoutes from "./utils/ProtectedRoutes";
import Home from "./pages/Home";

const firebaseConfig = {
  apiKey: "AIzaSyBDFcaGUXuMnsjitfcjzpuGo5DvkOW0fkA",
  authDomain: "sync-space-8d124.firebaseapp.com",
  projectId: "sync-space-8d124",
  storageBucket: "sync-space-8d124.appspot.com",
  messagingSenderId: "909931317212",
  appId: "1:909931317212:web:2810da4c70dc9bce6ab119",
  measurementId: "G-5RHEN90JD8",
};
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

function App() {
  onAuthStateChanged(auth, (user) => {});

  console.log("%c idemo", "color: lightgreen; font-size: 30px");
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
