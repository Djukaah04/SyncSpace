import UserStatus from "../enums/UserStatus.ts";

interface UserInfo {
  id: string;
  email: string | null;
  displayName: string | null;
  color: string;
  age?: number;
  status: UserStatus;
  carUrl?: string;
  photoUrl?: string;
  role?: string;
}

export default UserInfo;
