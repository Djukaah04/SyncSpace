import React, { ChangeEvent, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import {
  addCar,
  getCars,
  deleteCar,
  modifyCarPlate,
} from "../../services/carService";
import CarInfo from "../../models/CarInfo";
import { useNavigate } from "react-router-dom";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, db, storage } from "../../config/firebase";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import {
  setPhotoUrl,
  updateDisplayName,
  updateStatus,
} from "../../store/features/authSlice";
import NotificationInfo from "../../models/NotificationInfo";
import NotificationType from "../../enums/NotificationType";
import NotificationsList from "../notifications/notifications-list/NotificationsList";
import { signOut } from "firebase/auth";
import UserStatus from "../../enums/UserStatus";
import { sendNotification } from "../../services/notificationsService";

const Profile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  const [carSelectIsOpen, setCarSelectIsOpen] = useState(false);
  const [car, setCar] = useState<CarInfo>();
  const [carPlate, setCarPlate] = useState<string>(user?.carPlate || "");
  const [carPlateError, setCarPlateError] = useState<string>("");
  const [editCarPlate, setEditCarPlate] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState(false);
  const [editStatus, setEditStatus] = useState(false);
  const [displayName, setDisplayName] = useState<string>(
    user?.displayName || ""
  );
  const [status, setStatus] = useState<string>(user?.status || "");
  const cars = getCars();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSelect = () => {
    const isOpening = !carSelectIsOpen;

    if (isOpening) {
      if (user?.carPlate === "") {
        setCarPlateError("Car plate is required.");
      }
    } else {
      setCarPlateError("");
    }

    setCarSelectIsOpen(!carSelectIsOpen);
  };

  const changeCar = (car: CarInfo) => {
    setCar(car);
  };

  React.useEffect(() => {
    setCarPlate(user?.carPlate || "");
    setDisplayName(user?.displayName || "");
    setStatus(user?.status || "");
  }, [user]);

  const saveCarPlate = async () => {
    setEditCarPlate(false);
    if (carPlate !== "") {
      setCarPlateError("");
    } else {
      if (!carSelectIsOpen) {
        setCarPlateError("");
      } else {
        setCarPlateError("Car plate is required.");
      }
    }

    await dispatch(modifyCarPlate(carPlate, user?.id));
  };

  const saveCar = async () => {
    await dispatch(addCar(car, user?.id));
    setCarPlateError("");
    setCarSelectIsOpen(false);

    const message = "You have successfully selected a car!";
    await sendNotification(NotificationType.GENERAL, message, user);
  };

  const saveDisplayName = async () => {
    setEditDisplayName(false);
    if (user?.id && displayName.trim() && displayName !== user.displayName) {
      await setDoc(doc(db, "users", user.id), { displayName }, { merge: true });
      dispatch(updateDisplayName(displayName));
    }
  };

  const saveStatus = async () => {
    setEditStatus(false);
    if (user?.id && status && status !== user.status) {
      await setDoc(doc(db, "users", user.id), { status }, { merge: true });
      dispatch(updateStatus(status));
    }
  };

  const openEditDisplayName = () => {
    setEditDisplayName(true);
    setEditStatus(false);
    setEditCarPlate(false);
  };
  const openEditStatus = () => {
    setEditStatus(true);
    setEditDisplayName(false);
    setEditCarPlate(false);
  };
  const openEditCarPlate = () => {
    setEditCarPlate(true);
    setEditDisplayName(false);
    setEditStatus(false);
  };

  const removeCar = async () => {
    dispatch(deleteCar(user?.id));

    const message = "You have successfully deleted your car!";
    await sendNotification(NotificationType.GENERAL, message, user);
  };

  const back = () => {
    navigate("/");
  };

  const selectPicture = () => {
    fileInputRef.current?.click();
  };

  const pictureSelectChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      const storageRef = ref(storage, `profilePictures/${user.id}`);
      await uploadBytes(storageRef, file);
      const photoUrl = await getDownloadURL(storageRef);

      const userRef = doc(db, "users", user.id);
      await setDoc(userRef, { photoUrl }, { merge: true });
      dispatch(setPhotoUrl(photoUrl));
    } catch (err) {
      throw new Error("Greska pri promeni profilne slike.");
    }
  };
  const logout = async () => {
    try {
      if (!user) return;

      const userDocRef = doc(db, "users", user.id);
      await updateDoc(userDocRef, { status: UserStatus.OFFLINE });
      signOut(auth);
    } catch (err) {
      throw new Error("Greska pri pamcenju statusa korisnika!");
    }
  };

  return (
    <main className="profile">
      <span className="nav__back">
        <img onClick={back} src="assets/svg/back.svg" alt="back" />
      </span>
      <button className="profile__logout" onClick={logout}>
        Log Out
      </button>

      <div className="profile__info-container">
        <div className="profile__info-and-notifications">
          <NotificationsList />
          <div className="profile__info">
            {user?.photoUrl && (
              <div
                className={`profile__picture-row is-${user?.role?.toLowerCase()}`}
              >
                <span className="profile__picture-container">
                  <img
                    className="picture-container__picture"
                    src={
                      user?.photoUrl
                        ? user.photoUrl
                        : "assets/svg/businessman.svg"
                    }
                    alt={user?.photoUrl ? "user-photo" : "placeholder"}
                  />

                  <button
                    onClick={selectPicture}
                    className="picture-container__upload"
                  >
                    <img
                      className="upload__img"
                      src="assets/svg/upload.svg"
                      alt="upload"
                    />
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={pictureSelectChange}
                    />
                  </button>
                </span>
              </div>
            )}
            <div className="info-items">
              <div className="info-item">
                <span className="info-item__label">Display name:</span>
                {editDisplayName ? (
                  <div className="info-item__edit-container">
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      autoFocus
                      style={{
                        padding: 4,
                        borderRadius: 6,
                        border: "1px solid #ccc",
                        fontSize: 14,
                      }}
                    />
                    <button onClick={saveDisplayName}>Save</button>
                  </div>
                ) : (
                  <>
                    <div className="info-item__value">
                      <p className="info-item__value-text">
                        {user?.displayName || (
                          <span style={{ color: "#aaa" }}>No name</span>
                        )}
                      </p>
                      <span
                        className="info-item__value-edit"
                        onClick={openEditDisplayName}
                        title="Edit"
                      >
                        <img
                          src="assets/svg/edit.svg"
                          alt="edit"
                          style={{ width: 16 }}
                        />
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="info-item">
                <span className="info-item__label">Status:</span>
                {editStatus ? (
                  <div className="info-item__edit-container">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      autoFocus
                      style={{
                        padding: 4,
                        borderRadius: 6,
                        border: "1px solid #ccc",
                        fontSize: 14,
                      }}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                      <option value="AWAY">AWAY</option>
                    </select>
                    <button onClick={saveStatus}>Save</button>
                  </div>
                ) : (
                  <>
                    <div className="info-item__value">
                      <p className="info-item__value-text">
                        {user?.status || (
                          <span style={{ color: "#aaa" }}>No status</span>
                        )}
                      </p>
                      <span
                        className="info-item__value-edit"
                        onClick={openEditStatus}
                        title="Edit"
                      >
                        <img
                          src="assets/svg/edit.svg"
                          alt="edit"
                          style={{ width: 16 }}
                        />
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="info-item">
                <span className="info-item__label">Team:</span>
                <div className="info-item__value">
                  <p className="info-item__value-text">
                    {user?.team || (
                      <span style={{ color: "#aaa" }}>No name</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="info-item">
                <span className="info-item__label">Role:</span>
                <div className="info-item__value">
                  <p className="info-item__value-text">{user?.role}</p>
                </div>
              </div>

              {user?.email && (
                <div
                  onClick={() => {
                    console.log(
                      "%c carPlateError",
                      "color: orange; font-size: 25px",
                      carPlateError
                    );
                    console.log(
                      "%c user?.carPlate",
                      "color: orange; font-size: 25px",
                      user?.carPlate
                    );
                  }}
                  className="info-item"
                >
                  <span className="info-item__label">Email:</span>
                  <div className="info-item__value">{user.email}</div>
                </div>
              )}
              <div className="info-item">
                <span
                  className={`info-item__label ${
                    carPlateError ? "info-item__label--error" : ""
                  }`}
                >
                  License plate:
                </span>
                {editCarPlate ? (
                  <>
                    <div className="info-item__edit-container">
                      <input
                        type="text"
                        value={carPlate}
                        onChange={(e) => setCarPlate(e.target.value)}
                        placeholder="Enter car plate"
                        className="license-plate-input"
                        autoFocus
                      />
                      <button onClick={saveCarPlate}>Save</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="info-item__value">
                      <p className="info-item__value-text">
                        {user?.carPlate ? (
                          user.carPlate
                        ) : (
                          <span className="no-plate-added">no plate added</span>
                        )}
                      </p>

                      <span
                        className="info-item__value-edit"
                        onClick={openEditCarPlate}
                        title="Edit"
                      >
                        <img
                          src="assets/svg/edit.svg"
                          alt="edit"
                          className="info-item__value-edit-img"
                        />
                      </span>
                    </div>
                  </>
                )}

                {(carPlateError ||
                  (carSelectIsOpen && user?.carPlate === "")) && (
                  <span className="car-plate-error">{carPlateError}</span>
                )}
              </div>
              <div className="info-item info-item--car">
                <span className="info-item__label info-item__label--car">
                  Car:
                </span>
                {user?.carUrl ? (
                  <>
                    <img
                      src={user.carUrl}
                      className="profile__car"
                      alt="selected-car"
                      draggable="false"
                    />
                    <img
                      className="profile__trash"
                      src="assets/svg/trash.svg"
                      alt="trash"
                      onClick={removeCar}
                    />
                  </>
                ) : (
                  <button
                    className={`btn-primary ${
                      carSelectIsOpen ? "btn-primary--open" : ""
                    } profile__car-selection-btn`}
                    onClick={toggleSelect}
                  >
                    {carSelectIsOpen
                      ? "Close car selection"
                      : "Open car selection"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        {!user?.carUrl && carSelectIsOpen && cars && (
          <div className="car-selection-popup" id="car-select">
            <>
              <ul className="car-select-list">
                {cars.map((currentCar) => (
                  <span
                    key={currentCar.name}
                    onClick={() => changeCar(currentCar)}
                    className={`car-select-item ${
                      car?.name === currentCar.name &&
                      "car-select-item--selected"
                    }`}
                  >
                    <img
                      src={currentCar.path}
                      alt={currentCar.name}
                      style={{ width: "50px" }}
                      draggable="false"
                    />
                  </span>
                ))}
              </ul>
              <button disabled={!user?.carPlate} onClick={saveCar}>
                Save
              </button>
            </>
          </div>
        )}
      </div>
    </main>
  );
};

export default Profile;
