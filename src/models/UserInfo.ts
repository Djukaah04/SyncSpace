interface UserInfo {
  uid: string;
  email: string | null;
  displayName: string | null;
  age?: number;
}

export default UserInfo;
