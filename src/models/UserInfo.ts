import UserStatus from "../enums/UserStatus.ts";
import UserRole from "../enums/UserRole.ts";

interface UserInfo {
  id: string;
  email: string | null;
  displayName: string | null;
  color: string;
  age?: number;
  status: UserStatus;
  carUrl?: string;
  carPlate?: string;
  photoUrl?: string;
  role?: UserRole;
}

export default UserInfo;
