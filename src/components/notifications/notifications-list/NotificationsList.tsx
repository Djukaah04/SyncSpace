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
  getDocs,
  writeBatch,
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
  const notificationsCount = useSelector(
    (state: RootState) => state.notifications.notifications.length
  );

  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

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
  }, [user?.id]);

  const markAsRead = async (notif: NotificationInfo) => {
    if (notif.read) return;
    await updateDoc(doc(db, "notifications", notif.id), { read: true });
  };

  if (!user) return null;

  const visibleNotifications = showAll
    ? notifications
    : notifications.slice(0, 3);

  const handleClearNotifications = async () => {
    try {
      const notifQuery = query(
        collection(db, "notifications"),
        where("userId", "==", user.id)
      );
      const snap = await getDocs(notifQuery);
      const batch = writeBatch(db);
      snap.forEach((docu) => {
        batch.delete(docu.ref);
      });
      await batch.commit();
    } catch (err) {
      // Optionally handle error
      console.error("Failed to clear notifications:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const notifQuery = query(
        collection(db, "notifications"),
        where("userId", "==", user.id),
        where("read", "==", false)
      );
      const snap = await getDocs(notifQuery);
      const batch = writeBatch(db);
      snap.forEach((docu) => {
        batch.update(docu.ref, { read: true });
      });
      await batch.commit();
    } catch (err) {
      // Optionally handle error
      console.error("Failed to mark all as read:", err);
    }
  };

  return (
    <div className="notifications-list">
      {/* {notifications.length && ( */}
      <div
        className={`notifications-list__notifications-header ${
          notificationsCount === 0 ? "no-notifications" : ""
        }`}
      >
        <button
          className={notificationsCount === 0 ? "no-notifications" : ""}
          onClick={handleClearNotifications}
          disabled={notificationsCount === 0}
        >
          Clear notifications
        </button>
        <button
          className={notificationsCount === 0 ? "no-notifications" : ""}
          onClick={handleMarkAllAsRead}
          disabled={notificationsCount === 0}
        >
          Mark all as read
        </button>
      </div>
      {/* )} */}
      {loading ? (
        <div className="notifications-list__loading">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="notifications-list__empty">No notifications yet.</div>
      ) : (
        <>
          <ul className="notifications-list__items">
            {visibleNotifications.map((notif) => (
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
                      typeIcons[notif.type] ||
                      typeIcons[NotificationType.GENERAL]
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
          {notifications.length > 3 && (
            <button
              className="notifications-list__toggle"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? "See less" : "See more"}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default NotificationsList;
