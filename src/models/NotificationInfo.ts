import NotificationType from "../enums/NotificationType";

interface NotificationInfo {
  id: string;
  read: boolean;
  text: string;
  userId: string | undefined;
  timestamp: number;
  type: NotificationType;
}

export default NotificationInfo;
