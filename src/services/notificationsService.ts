import { doc, setDoc } from "firebase/firestore";
import NotificationType from "../enums/NotificationType";
import NotificationInfo from "../models/NotificationInfo";
import { db } from "../config/firebase";
import UserInfo from "../models/UserInfo";

const generateNotificationId = (
  type: NotificationType,
  displayName: string | undefined
): string => {
  const firstName = displayName?.split(" ")[0];
  const randomId = crypto.randomUUID().split("-")[0];
  return `${firstName}-${type}-${randomId}`;
};

export const sendNotification = async (
  type: NotificationType,
  message: string,
  user: UserInfo | undefined
): Promise<void> => {
  const id = generateNotificationId(type, user?.displayName);

  const notification: NotificationInfo = {
    id,
    read: false,
    text: message,
    userId: user?.id,
    timestamp: new Date().getTime(),
    type,
  };

  try {
    await setDoc(doc(db, "notifications", id), notification);
    console.log("Notification sent:", notification);
  } catch (err) {
    console.error("Error sending notification:", err);
    throw err;
  }
};
