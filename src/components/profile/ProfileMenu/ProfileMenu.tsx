import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../../config/firebase";
import UserStatus from "../../../enums/UserStatus";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../../store";
import { useSelector } from "react-redux";
import { signOut } from "firebase/auth";

interface ProfileMenuProps {
  isOpen: boolean;
}

const ProfileMenu = ({ isOpen }: ProfileMenuProps) => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const goToProfile = () => {
    navigate("/profile");
  };

  const logout = async () => {
    try {
      if (!user) return;

      const userDocRef = doc(db, "users", user.id);
      await updateDoc(userDocRef, { status: UserStatus.OFFLINE });
      signOut(auth);
    } catch (err) {
      throw new Error("Greska pri pamcenju statusa korisnika!", err);
    }
  };
  if (!isOpen) return;
  return (
    <ul className="profile-menu">
      <li onClick={goToProfile} className="profile-menu__item">
        Profile
      </li>
      <li onClick={logout} className="profile-menu__item">
        Logout
      </li>
    </ul>
  );
};
export default ProfileMenu;
