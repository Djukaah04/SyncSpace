import React, { useEffect, useRef, useState } from "react";
import { Map, MapMouseEvent, Marker, Popup } from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { serverTimestamp } from "firebase/firestore";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import MarkerInfo from "../../models/MarkerInfo";
import MarkerType from "../../enums/MarkerType";

const Events = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [location, setLocation] = useState<{
    lat: number;
    lon: number;
    zoom: number;
  }>({
    lat: 43.3094656,
    lon: 21.921792,
    zoom: 6,
  });
  const [markers, setMarkers] = useState<MarkerInfo[]>([]);
  const [popup, setPopup] = useState<{ lat: number; lon: number } | null>(null);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [hoveredMarker, setHoveredMarker] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<any>(null); // Store the map instance here

  const getLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            zoom: 5,
          });
          setError(null);
        },
        (err) => {
          setError(err.message);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  };

  useEffect(() => {
    getLocation();
  }, []);
  const handleMapClick = (e: MapMouseEvent) => {
    const { lng, lat } = e.lngLat;
    setPopup({ lat, lon: lng }); // Show popup at clicked location
    setTitle(""); // Reset comment input
    setComment(""); // Reset comment input
  };

  const addMarker = () => {
    if (popup && user) {
      setMarkers((prev) => [
        ...prev,
        {
          id: Date.now(),
          lat: popup.lat,
          lon: popup.lon,
          title: title,
          comment: comment,
          authorId: user.id,
          type: MarkerType.EVENT,
          createdAt: serverTimestamp(),
          likes: [],
        },
      ]);
      setPopup(null); // Zatvori popup nakon dodavanja
    }
  };

  const removeMarker = (id: number) => {
    setMarkers((prev) => prev.filter((marker) => marker.id !== id));
  };
  const fly = () => {
    if (mapRef.current) {
      console.log(
        "%c Flying to location!",
        "color: lightgreen; font-size: 20px"
      );

      mapRef.current.flyTo({
        center: [location.lon, location.lat], // Longitude first!
        zoom: 10,
        // essential: true,
      });
    } else {
      console.warn("Map is not initialized yet.");
    }
  };

  return (
    <>
      <h2 onClick={fly}>
        Location: {location.lat} : {location.lon}
      </h2>
      <div className="map-container">
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
        >
          {markers.map((marker, index) => (
            <div key={index} onMouseEnter={() => setHoveredMarker(marker.id)}>
              <Marker longitude={marker.lon} latitude={marker.lat}>
                <div
                  className={`marker marker-${marker.type} ${
                    hoveredMarker === marker.id ? "active" : ""
                  }`}
                  title={marker.comment}
                ></div>
                {hoveredMarker === marker.id && (
                  <Popup
                    longitude={marker.lon}
                    latitude={marker.lat}
                    closeButton={false}
                    offset={10}
                  >
                    <div
                      className="popup-content"
                      onMouseLeave={() => setHoveredMarker(null)}
                    >
                      <h4>{marker.title}</h4>
                      <p>{marker.comment}</p>
                      <button
                        className="btn-remove"
                        onClick={() => removeMarker(marker.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </Popup>
                )}
              </Marker>
            </div>
          ))}
          {popup && (
            <Popup
              longitude={popup.lon}
              latitude={popup.lat}
              closeOnClick={false}
              onClose={() => setPopup(null)}
            >
              <div className="popup-form">
                <h3>📍 Mark Event</h3>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter title"
                />
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Enter comment"
                />

                <select name="event-type" id="event-type">
                  <option value={MarkerType.EVENT}>Event</option>
                  <option value={MarkerType.WARNING}>Warning</option>
                  <option value={MarkerType.REMINDER}>Reminder</option>
                </select>

                <button className="btn-confirm" onClick={addMarker}>
                  Confirm
                </button>
              </div>
            </Popup>
          )}
        </Map>
      </div>

      <div className="events-list">
        <h3>📌 Events</h3>
        {markers.length === 0 && <p className="empty">No events yet.</p>}
        {markers.map((marker) => (
          <div className={`event-card marker-${marker.type}`} key={marker.id}>
            <h4>{marker.title || "Untitled"}</h4>
            <p>{marker.comment}</p>
            <small>Type: {marker.type}</small>
          </div>
        ))}
      </div>
    </>
  );
};

export default Events;
