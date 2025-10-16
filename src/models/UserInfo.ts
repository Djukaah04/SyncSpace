import UserStatus from "../enums/UserStatus.ts";
import UserRole from "../enums/UserRole.ts";

interface UserInfo {
  id: string;
  email: string | null;
  displayName?: string;
  age?: number;
  role?: UserRole;
  photoUrl?: string;
  status: UserStatus;
  carUrl?: string;
  carPlate?: string;
  color: string;
  team?: number;
}

export default UserInfo;
