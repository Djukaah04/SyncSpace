import React, { useEffect, useState } from "react";
import { AppDispatch, RootState } from "../../../store";
import { useDispatch, useSelector } from "react-redux";
import { db } from "../../../config/firebase";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  updateDoc,
  doc,
} from "firebase/firestore";
import NotificationType from "../../../enums/NotificationType";
import "./NotificationsList.scss";
import NotificationInfo from "../../../models/NotificationInfo";
import { setNotifications } from "../../../store/features/notificationsSlice";

const typeIcons: Record<NotificationType, string> = {
  [NotificationType.EVENT]: "assets/svg/calendar.svg",
  [NotificationType.GENERAL]: "assets/svg/assistant.svg",
  [NotificationType.MESSAGE]: "assets/svg/chat.svg",
  [NotificationType.REMINDER]: "assets/svg/reminder.svg",
};

const NotificationsList = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch<AppDispatch>();
  const notifications = useSelector(
    (state: RootState) => state.notifications.notifications
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.id),
      orderBy("timestamp", "desc")
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      const notifs = snap.docs.map(
        (document) =>
          ({ id: document.id, ...document.data() } as NotificationInfo)
      );
      dispatch(setNotifications(notifs));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [dispatch, user]);

  const markAsRead = async (notif: NotificationInfo) => {
    if (notif.read) return;
    console.log("%c notif.id", "color: lightgreen; font-size: 25px", notif.id);
    await updateDoc(doc(db, "notifications", notif.id), { read: true });
  };

  if (!user) return null;

  return (
    <div className="notifications-list">
      <h3 className="notifications-list__title">Notifications</h3>
      {loading ? (
        <div className="notifications-list__loading">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="notifications-list__empty">No notifications yet.</div>
      ) : (
        <ul className="notifications-list__items">
          {notifications.map((notif, index) => (
            <li
              key={notif.id}
              className={`notification-item${
                notif.read
                  ? " notification-item--read"
                  : " notification-item--unread"
              }`}
              onClick={() => markAsRead(notif)}
            >
              <span className="notification-item__icon">
                <img
                  src={
                    typeIcons[notif.type] || typeIcons[NotificationType.GENERAL]
                  }
                  alt={notif.type}
                />
              </span>
              <span className="notification-item__content">
                <span className="notification-item__text">{notif.text}</span>
                <span className="notification-item__timestamp">
                  {new Date(notif.timestamp).toLocaleString()}
                </span>
              </span>
              {!notif.read && <span className="notification-item__dot" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationsList;
