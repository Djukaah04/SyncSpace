import { RootState } from "../../store";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { useNavigate } from "react-router-dom";
import ReservationInfo from "../../models/ReservationInfo";
import EventInfo from "../../models/EventInfo";
import { formatDatePretty } from "../../services/formattingService";
import UserInfo from "../../models/UserInfo";

const Welcome = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const users = useSelector((state: RootState) => state.users.list);
  const navigate = useNavigate();

  const [closestReservation, setClosestReservation] =
    useState<ReservationInfo>();
  const [myEvents, setMyEvents] = useState<EventInfo[]>([]);

  const daySuffix = (n: number) => {
    if (n >= 11 && n <= 13) return "th";
    switch (n % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  const getCurrentDate = () => {
    const date = new Date();
    const month = date.toLocaleString("default", { month: "long" });
    const day = date.getDate();
    const suffix = daySuffix(day);
    return `${month} ${day}${suffix}`;
  };

  useEffect(() => {
    if (!user) return;

    // listen for reservations for this user
    const reservationsRef = collection(db, "reservations");
    const q = query(reservationsRef, where("userId", "==", user.id));
    // use getDocs once to populate
    getDocs(q).then((snap) => {
      const res: ReservationInfo[] = snap.docs.map(
        (d) => ({ id: d.id, ...(d.data() as any) } as ReservationInfo)
      );
      if (!res.length) return;

      const closest = res.reduce((min, reservation) =>
        reservation.startTime < min.startTime ? reservation : min
      );
      setClosestReservation(closest);
    });
  }, [user]);

  useEffect(() => {
    // listen for events where user is invited
    const eventsCol = collection(db, "events");
    // const q = query(collection(db, "events"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(eventsCol, (snap) => {
      console.log("%c snap.docs", "color: orange; font-size: 25px", snap.docs);
      const ev: EventInfo[] = snap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as EventInfo))
        .filter((currentEvent) => {
          console.log(
            "%c currentEvent",
            "color: lightgreen; font-size: 25px",
            currentEvent
          );
          return (
            user?.id &&
            currentEvent.invited.some(
              (currentUser: UserInfo) => currentUser.id === user?.id
            )
          );
        });
      console.log("%c ev", "color: orange; font-size: 25px", ev);
      setMyEvents(ev);
    });

    return () => unsub();
  }, [user]);

  const goToParking = () => navigate("/parking");

  return (
    <div className="welcome">
      <span className="welcome__card-side" />
      <div className="welcome__user-info">
        <h1 className="user-info__welcome-title">
          Welcome back, {user?.displayName}
        </h1>
        <p className="user-info__info-item">
          <span className="u-color-blue">●</span> Today is {getCurrentDate()}
        </p>

        {/* Parking reservation summary */}
        {closestReservation ? (
          <p
            onClick={() => {
              console.log(
                "%c closestReservation",
                "color: orange; font-size: 25px",
                closestReservation
              );
            }}
            key={closestReservation.id}
            className="user-info__info-item"
          >
            <span className="u-color-blue">●</span> You reserved parking
            starting
            <span className="info-item__reservation-time">
              {formatDatePretty(new Date(closestReservation.startTime))}
            </span>
          </p>
        ) : (
          <p className="user-info__info-item">
            <span className="u-color-blue">●</span> You didn't reserve any
            parking slots.
            <button className="info-item__click-here" onClick={goToParking}>
              To reserve click here
            </button>
          </p>
        )}

        {/* Meeting / Event summary */}
        {myEvents && myEvents.length > 0 ? (
          myEvents.slice(0, 1).map((ev) => (
            <p key={ev.id} className="user-info__info-item">
              Meeting: {ev.title || "Untitled"} on
              {ev.eventDate
                ? new Date(ev.eventDate).toLocaleDateString()
                : "No date"}
            </p>
          ))
        ) : (
          <p className="user-info__info-item">
            {" "}
            <span className="u-color-blue">●</span> No meetings scheduled.
          </p>
        )}
      </div>
      <div className={`welcome__user-card is-${user?.role?.toLowerCase()}`}>
        <img
          className="user-card__picture"
          src={user?.photoUrl ? user.photoUrl : "assets/svg/businessman.svg"}
          alt={user?.photoUrl ? "user-photo" : "placeholder"}
        />

        <h3 className="user-card__user-name">{user?.displayName}</h3>
        <span>{user?.role}</span>
      </div>
    </div>
  );
};

export default Welcome;
