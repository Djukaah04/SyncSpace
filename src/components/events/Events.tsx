import { useEffect, useRef, useState } from "react";
import { Map, MapMouseEvent, Marker, Popup } from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import EventInfo from "../../models/EventInfo";
import { db } from "../../config/firebase";
import Modal from "../../utils/modal/Modal";
import UserRole from "../../enums/UserRole";
import UserInfo from "../../models/UserInfo";
import EventType from "../../enums/EventType";
import NotificationType from "../../enums/NotificationType";
import { sendNotification } from "../../services/notificationsService";
import { formatDatePretty } from "../../services/formattingService";

const Events = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const isAdmin = user?.role === UserRole.ADMIN;

  const [location, setLocation] = useState({
    lat: 43.3094656,
    lon: 21.921792,
    zoom: 6,
  });
  const [createEventVisible, setCreateEventVisible] = useState(false);
  const [events, setEvents] = useState<EventInfo[]>([]);
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);
  const [mapVisible, setMapVisible] = useState(false);

  const [isCompanyEvent, setIsCompanyEvent] = useState(false);

  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [selectedType, setSelectedType] = useState<EventType>(
    EventType.GATHERING
  );
  const [eventDate, setEventDate] = useState<string>("");
  const [invitedUsers, setInvitedUsers] = useState<UserInfo[]>([]);
  const enableSubmit = invitedUsers.length === 0;

  const [pendingLocation, setPendingLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [eventLocation, setEventLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const users = useSelector((state: RootState) => state.users.list);

  const mapRef = useRef<any>(null);
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) =>
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            zoom: 5,
          }),
        (err) => setError(err.message)
      );
    } else setError("Geolocation is not supported by this browser.");
  }, []);

  useEffect(() => {
    const eventsCol = collection(db, "events");
    const q = query(eventsCol);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsData: EventInfo[] = snapshot.docs.map((doc) => {
        const data = doc.data() as Omit<EventInfo, "id" | "docId">;
        return {
          ...data,
          id: doc.id,
        } as EventInfo;
      });
      setEvents(eventsData);
    });
    return () => unsubscribe();
  }, []);

  const toggleMap = () => {
    setMapVisible((prev) => !prev);
  };

  const handleMapClick = (e: MapMouseEvent) => {
    const { lng, lat } = e.lngLat;
    setPendingLocation({ lat, lon: lng });
    setShowConfirmModal(true);
    console.log("%c markers", "color: orange; font-size: 25px", events);
  };

  const confirmLocation = () => {
    if (pendingLocation) {
      setEventLocation(pendingLocation);
      setPendingLocation(null);
      setShowConfirmModal(false);
    }
  };

  const cancelLocationSelect = () => {
    setShowConfirmModal(false);
    setPendingLocation(null);
  };

  const toggleInvite = (userId: string) => {
    setInvitedUsers((invitees: UserInfo[]) => {
      const exists = invitees.some((invitee) => invitee.id === userId);

      if (exists) {
        return invitees.filter((inv) => inv.id !== userId);
      } else {
        const newUser = users.find((u) => u.id === userId);
        if (!newUser) return invitees;

        return [...invitees, newUser];
      }
    });
  };

  const inviteTeam = () => {
    setIsCompanyEvent(false);
    const team = users.filter(
      (u) => u.team === user?.team && u.id !== user?.id
    );
    setInvitedUsers([...team]);
  };

  const toggleIsCompanyEvent = () => {
    // setInvitedUsers(users.filter((u) => u.id !== user?.id).map((u) => u.id));
    if (isCompanyEvent) {
      setInvitedUsers([]);
    } else {
      setInvitedUsers(users.filter((u) => u.id !== user?.id));
    }
    setIsCompanyEvent((prev) => !prev);
  };

  const clear = () => {
    setIsCompanyEvent(false);
    setInvitedUsers([]);
  };

  const delegateNotifications = async () => {
    invitedUsers.forEach((invitee: UserInfo) => {
      const message = `${user?.displayName} has made a${
        selectedType === EventType.ANNOUNCEMENT ? "n" : ""
      } ${selectedType.toLowerCase()}. ${
        eventDate ? `Scheduled for ${eventDate}.` : ""
      }`;
      console.log("%c message", "color: orange; font-size: 25px", message);
      console.log("%c invitee", "color: orange; font-size: 25px", invitee);
      sendNotification(NotificationType.EVENT, message, invitee);
    });
  };
  const addEvent = async () => {
    if (!user) {
      setError("Please fill in required fields.");
      return;
    }
    let eventDateMs: number | null = null;
    if (eventDate) {
      const d = new Date(eventDate);
      if (isNaN(d.getTime())) return setError("Invalid date");
      eventDateMs = d.getTime();
    }
    const newMarkerPartial = {
      lat: eventLocation && eventLocation.lat,
      lon: eventLocation && eventLocation.lon,
      title,
      comment,
      authorId: user.id,
      type: selectedType,
      createdAt: serverTimestamp(),
      likes: [],
      invited: invitedUsers,
      eventDate: eventDateMs,
    };
    try {
      const eventsCol = collection(db, "events");
      const docRef = await addDoc(eventsCol, newMarkerPartial);
      // setMarkers((prev) => [...prev, localMarker]);
      setError(null);
      setTitle("");
      setComment("");
      setSelectedType(EventType.GATHERING);
      setEventDate("");
      setInvitedUsers([]);
      setEventLocation(null);

      delegateNotifications();
    } catch (err) {
      console.error("Failed to save event", err);
      setError("Failed to save event");
    }
  };

  const removeMarker = async (markerId: string, docId?: string) => {
    try {
      if (docId) await deleteDoc(doc(db, "events", docId));
      setEvents((prev) => prev.filter((m) => m.id !== markerId));
    } catch (err) {
      console.error("Failed to delete marker", err);
    }
  };

  const flyToEvent = (coords: { lat: number; lon: number }) => {
    if (mapRef.current) {
      mapRef.current.flyTo({ center: [coords.lon, coords.lat], zoom: 12 });
    }
  };

  const toggleCreateEvent = () => {
    setCreateEventVisible(!createEventVisible);
  };

  return (
    <>
      <div className="events">
        <div className="events__header">
          <h3 className="events__title">📌 Events</h3>
          <img
            onClick={toggleCreateEvent}
            className="events-list__create-event"
            src="assets/svg/plus.svg"
            alt="create-event"
          />
        </div>
        {events.length === 0 && <p className="empty">No events yet.</p>}

        <div className="events__content">
          <div className="event-cards-and-map">
            {mapVisible ? (
              <div className="map-container">
                <div className="map">
                  <Map
                    ref={mapRef}
                    initialViewState={{
                      longitude: location.lon,
                      latitude: location.lat,
                      zoom: location.zoom,
                    }}
                    mapStyle="https://api.maptiler.com/maps/streets/style.json?key=2oADDqd5xOSYXzILFpwA"
                    onLoad={(e) => (mapRef.current = e.target)}
                    onClick={handleMapClick}
                    style={{ width: "100%", height: "100%" }}
                  >
                    {pendingLocation && (
                      <Marker
                        longitude={pendingLocation.lon}
                        latitude={pendingLocation.lat}
                      >
                        <div
                          className="marker marker-pending"
                          title="Pending location"
                        />
                      </Marker>
                    )}

                    {eventLocation && (
                      <Marker
                        longitude={eventLocation.lon}
                        latitude={eventLocation.lat}
                      >
                        <div
                          className="marker marker-temp"
                          title="Event location"
                        />
                      </Marker>
                    )}

                    {events.map((event) => (
                      <div
                        key={event.id}
                        onMouseEnter={() => setHoveredEvent(event.id)}
                      >
                        <Marker longitude={event.lon} latitude={event.lat}>
                          <div
                            className={`marker marker--${event.type.toLowerCase()} ${
                              hoveredEvent === event.id ? "active" : ""
                            }`}
                            title={event.comment}
                          />
                          {hoveredEvent === event.id && (
                            <Popup
                              longitude={event.lon}
                              latitude={event.lat}
                              closeButton={false}
                              offset={10}
                            >
                              <div
                                className="popup-content"
                                onMouseLeave={() => setHoveredEvent(null)}
                              >
                                <h4>{event.title}</h4>
                                <p>{event.comment}</p>
                                <small>
                                  {event.eventDate
                                    ? `When: ${new Date(
                                        event.eventDate
                                      ).toLocaleDateString()}`
                                    : "No date"}
                                </small>
                              </div>
                            </Popup>
                          )}
                        </Marker>
                      </div>
                    ))}
                  </Map>
                </div>
              </div>
            ) : (
              <div className="event-cards">
                {events.map((event) => (
                  <div
                    className={`event-card event--${event.type.toLowerCase()}`}
                    key={event.id}
                  >
                    <div className="event-card__info">
                      <h4>{event.title || "Untitled"}</h4>
                      <p>{event.comment}</p>
                      <small>
                        <span>{event.type}</span> •{" "}
                        {event.eventDate &&
                          formatDatePretty(new Date(event.eventDate), true)}
                      </small>
                      {user && user.role === UserRole.ADMIN && (
                        <button
                          className="btn-remove"
                          onClick={() => removeMarker(event.id, event.id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <div className="event-card__invitees">
                      {event.invited &&
                        event.invited.length > 0 &&
                        event.invited.map((currentUser) => {
                          const invitedUser = users.find(
                            (u) => u.id === currentUser.id
                          );
                          if (!invitedUser) return null;
                          return (
                            <div
                              key={currentUser.id}
                              className="event-card__invitee"
                            >
                              <img
                                src={
                                  invitedUser.photoUrl ||
                                  "assets/svg/businessman.svg"
                                }
                                alt="avatar"
                                className="invite-avatar"
                              />
                              <span className="invite-name">
                                {invitedUser.id === user?.id
                                  ? "Me"
                                  : invitedUser.displayName ||
                                    invitedUser.email}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {createEventVisible && (
            <div className="create-event">
              <h3
                onClick={() => {
                  console.log(
                    "%c invitedUsers",
                    "color: orange; font-size: 25px",
                    invitedUsers
                  );
                }}
                className="create-event__title"
              >
                📍 CREATE EVENT
              </h3>
              <label className="create-event__field-container">
                <div className="field-container__label-row">Title:</div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Event title"
                />
              </label>

              <label className="create-event__field-container">
                <div className="field-container__label-row">Type:</div>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as EventType)}
                >
                  <option value={EventType.GATHERING}>Gathering</option>
                  <option value={EventType.MEETING}>Meeting</option>
                  <option value={EventType.ANNOUNCEMENT}>Announcement</option>
                  <option value={EventType.MAINTENANCE}>Maintenance</option>
                  <option value={EventType.WARNING}>Warning</option>
                  <option value={EventType.REMINDER}>Reminder</option>
                </select>
              </label>

              <label className="create-event__field-container">
                <div className="field-container__label-row">
                  Date:{" "}
                  <span className="create-event__optional">(optional)</span>
                </div>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                />
              </label>

              <label className="create-event__field-container create-event__field-container--comment">
                <div className="field-container__label-row">
                  Comment:{" "}
                  <span className="create-event__optional">(optional)</span>
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={5}
                  placeholder="Details"
                />
              </label>

              <div className="invite-section">
                <h3 className="invite-section__title">Invite people</h3>
                <div className="invite-people__invite-options">
                  <button
                    className="invite-options__button invite-options__button--team"
                    type="button"
                    onClick={inviteTeam}
                  >
                    TEAM {user?.team}
                  </button>
                  {isAdmin && (
                    <button
                      className={`invite-options__button invite-options__button--company ${
                        isCompanyEvent ? "is-selected" : ""
                      }`}
                      type="button"
                      onClick={toggleIsCompanyEvent}
                    >
                      COMPANY
                    </button>
                  )}
                  <button
                    className="invite-options__button invite-options__button--clear"
                    type="button"
                    onClick={clear}
                  >
                    CLEAR
                  </button>
                </div>

                {users.length === 0 && <div>Loading users...</div>}
                <div className="invited-people__list">
                  {!isCompanyEvent &&
                    users.map((u) => {
                      const checked = invitedUsers.some(
                        (invitee) => invitee.id === u.id
                      );
                      return (
                        <label
                          key={u.id}
                          className={`invited-people__list-item ${
                            u.id === user?.id
                              ? "invited-people__list-item--me"
                              : ""
                          }`}
                        >
                          <input
                            className="checkmark"
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleInvite(u.id)}
                            disabled={u.id === user?.id || isCompanyEvent}
                          />
                          <img
                            src={u.photoUrl || "assets/svg/businessman.svg"}
                            alt="avatar"
                            className="invite-avatar"
                          />

                          <span className="invite-name">
                            {u.id === user?.id
                              ? "Me"
                              : u.displayName || u.email}
                          </span>
                        </label>
                      );
                    })}
                </div>
              </div>

              <label style={{ width: "100%" }}>
                <div className="location-field-row">
                  Location
                  <button onClick={toggleMap}>Toggle map</button>
                </div>
                {eventLocation ? (
                  <div className="location-controls">
                    <button onClick={() => flyToEvent(eventLocation)}>
                      📍 See location
                    </button>
                    <button onClick={() => setEventLocation(null)}>
                      ❌ Clear location
                    </button>
                  </div>
                ) : (
                  <p>No location chosen.</p>
                )}
              </label>

              {error && <div className="error-text">{error}</div>}

              <div className="popup-actions">
                <button disabled={enableSubmit} onClick={addEvent}>
                  SAVE EVENT
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showConfirmModal} onClose={() => cancelLocationSelect()}>
        <div className="reservation-form">
          <p>Do you want to set this location?</p>
          <div className="modal-actions">
            <button onClick={confirmLocation}>Yes</button>
            <button onClick={cancelLocationSelect}>No</button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Events;
