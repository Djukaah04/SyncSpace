import React from "react";
import "./App.css";

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";

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
  return (
    <div className="App">
      <header className="App-header"></header>
    </div>
  );
}

export default App;
