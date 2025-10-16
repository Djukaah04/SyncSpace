import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../config/firebase";
import UserInfo from "../models/UserInfo";
import { AppDispatch } from "../store";
import { setUsers } from "../store/features/usersSlice";
import UserStatus from "../enums/UserStatus";
import { clearUser, setUser } from "../store/features/authSlice";
import { onAuthStateChanged } from "firebase/auth";

export const subscribeToAuthChanges = (
  dispatch: AppDispatch,
  setIsAuthChecked: (value: boolean) => void
) => {
  const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
    if (authUser) {
      const userDocRef = doc(db, "users", authUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const user: UserInfo = {
          id: authUser.uid,
          ...(userDoc.data() as Omit<UserInfo, "id">),
        };

        try {
          await updateDoc(userDocRef, { status: UserStatus.ONLINE });
        } catch (err) {
          console.error(
            "❌ Greška pri pamćenju statusa korisnika:",
            (err as Error).message
          );
        }

        dispatch(setUser(user));
      } else {
        console.warn("%c userDoc ne postoji!", "color: pink; font-size: 25px");
      }
    } else {
      dispatch(clearUser());
    }

    setIsAuthChecked(true);
  });

  return unsubscribe;
};

export const subscribeToUsers = (dispatch: AppDispatch) => {
  const usersRef = collection(db, "users");

  const unsubscribe = onSnapshot(usersRef, (snapshot) => {
    console.log("%c RADI SUBSCTIBE", "color: yellow; font-size: 35px");
    const usersList: UserInfo[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<UserInfo, "id">),
    }));
    dispatch(setUsers(usersList));
  });

  return unsubscribe;
};
