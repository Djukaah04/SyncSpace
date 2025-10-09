import React, { useEffect, useRef, useState } from "react";
import { Map, MapMouseEvent, Marker, Popup } from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  serverTimestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import EventInfo from "../../models/EventInfo";
import MarkerType from "../../enums/MarkerType";
import { db } from "../../config/firebase";
import Modal from "../../utils/modal/Modal";

const Events = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  const [location, setLocation] = useState({
    lat: 43.3094656,
    lon: 21.921792,
    zoom: 6,
  });
  const [createEventVisible, setCreateEventVisible] = useState(false);
  const [events, setEvents] = useState<EventInfo[]>([]);
  const [hoveredEvent, setHoveredEvent] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [selectedType, setSelectedType] = useState<MarkerType>(
    MarkerType.EVENT
  );
  const [eventDate, setEventDate] = useState<string>("");
  const [invitedUsers, setInvitedUsers] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<
    {
      id: string;
      displayName?: string;
      email?: string;
      photoUrl?: string;
      teamId?: string;
    }[]
  >([]);

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
    const fetchUsers = async () => {
      try {
        const usersCol = collection(db, "users");
        const snap = await (
          await import("firebase/firestore")
        ).getDocs(usersCol);
        const users = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));
        setAllUsers(users);
      } catch (err) {
        console.error("Failed to load users", err);
      }
    };
    fetchUsers();
  }, []);

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
    setInvitedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const inviteTeam = () => {
    if (!user) return;
    if ((user as any).teamId) {
      const team = allUsers.filter((u) => u.teamId === (user as any).teamId);
      setInvitedUsers(team.map((t) => t.id));
    } else {
      setInvitedUsers(allUsers.map((u) => u.id));
    }
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
      setSelectedType(MarkerType.EVENT);
      setEventDate("");
      setInvitedUsers([]);
      setEventLocation(null);
    } catch (err) {
      console.error("Failed to save event", err);
      setError("Failed to save event");
    }
  };

  const removeMarker = async (markerId: number, docId?: string) => {
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
      <div className="events-list">
        <div className="events-list__header">
          <h3>📌 Events</h3>
          <img
            onClick={toggleCreateEvent}
            className="events-list__create-event"
            src="assets/svg/plus.svg"
            alt="create-event"
          />
        </div>
        {events.length === 0 && <p className="empty">No events yet.</p>}
        {events.map((event) => (
          <div className={`event-card marker-${event.type}`} key={event.id}>
            <h4>{event.title || "Untitled"}</h4>
            <p>{event.comment}</p>
            <small>
              Type: {event.type} •{" "}
              {event.eventDate
                ? new Date(event.eventDate).toLocaleDateString()
                : "No date"}
            </small>
            <div className="popup-actions-compact">
              <button
                className="btn-remove"
                onClick={() => removeMarker(event.id, event.docId)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="events-options">
        {createEventVisible && (
          <div className="create-event">
            <h3>📍 Create Event</h3>
            <label>
              Title
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Event title"
              />
            </label>

            <label>
              Comment
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Details"
              />
            </label>

            <label>
              Type
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as MarkerType)}
              >
                <option value={MarkerType.EVENT}>Event</option>
                <option value={MarkerType.MEETING}>Meeting</option>
                <option value={MarkerType.ANNOUNCEMENT}>Announcement</option>
                <option value={MarkerType.MAINTENANCE}>Maintenance</option>
                <option value={MarkerType.WARNING}>Warning</option>
                <option value={MarkerType.REMINDER}>Reminder</option>
              </select>
            </label>

            <label>
              Date (optional)
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </label>

            <label>
              Location
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

            <div className="invite-section">
              <strong>Invite people</strong>
              <div className="invite-people__invite-options">
                <button
                  className="invite-options__button invite-options__button--team"
                  type="button"
                  onClick={inviteTeam}
                >
                  Invite team
                </button>
                <button
                  className="invite-options__button"
                  type="button"
                  onClick={() => setInvitedUsers([])}
                >
                  Clear
                </button>
              </div>

              {allUsers.length === 0 && <div>Loading users...</div>}
              {allUsers.map((u) => {
                const checked = invitedUsers.includes(u.id);
                return (
                  <label key={u.id} className="invited-people__list-item">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleInvite(u.id)}
                    />
                    <img
                      src={u.photoUrl || "assets/svg/businessman.svg"}
                      alt="avatar"
                      className="invite-avatar"
                    />
                    <span className="invite-name">
                      {u.displayName || u.email}
                    </span>
                  </label>
                );
              })}
            </div>

            {error && <div className="error-text">{error}</div>}

            <div className="popup-actions">
              <button className="btn-confirm" onClick={addEvent}>
                Save event
              </button>
            </div>
          </div>
        )}

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
                  <div className="marker marker-temp" title="Event location" />
                </Marker>
              )}

              {events.map((event) => (
                <div
                  key={event.id}
                  onMouseEnter={() => setHoveredEvent(event.id)}
                >
                  <Marker longitude={event.lon} latitude={event.lat}>
                    <div
                      className={`marker marker-${event.type} ${
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
