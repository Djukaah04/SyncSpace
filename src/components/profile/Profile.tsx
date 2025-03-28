import React, { ChangeEvent, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { addCar, getCars, deleteCar } from "../../services/carImageService";
import CarInfo from "../../models/CarInfo";
import { useNavigate } from "react-router-dom";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "../../config/firebase";
import { doc, setDoc } from "firebase/firestore";
import { setPhotoUrl } from "../../store/features/authSlice";

const Profile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  const [carSelectIsOpen, setCarSelectIsOpen] = useState(false);
  const [car, setCar] = useState<CarInfo>();
  const cars = getCars();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSelect = () => {
    setCarSelectIsOpen(!carSelectIsOpen);
  };

  const changeCar = (car) => {
    setCar(car);
  };

  const saveCar = () => {
    dispatch(addCar(car, user?.id));
  };

  const removeCar = () => {
    dispatch(deleteCar(user?.id));
  };

  const back = () => {
    navigate("/");
  };

  const selectPicture = () => {
    console.log("%c selectPicture", "color: lightgreen; font-size: 25px");
    fileInputRef.current?.click();
  };

  const pictureSelectChange = async (event: ChangeEvent<HTMLInputElement>) => {
    console.log(
      "%c FILES",
      "color: lightgreen; font-size: 25px",
      event.target.files
    );
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      const storageRef = ref(storage, `profilePictures/${user.id}`);
      await uploadBytes(storageRef, file);
      const photoUrl = await getDownloadURL(storageRef);

      const userRef = doc(db, "users", user.id);
      await setDoc(userRef, { photoUrl }, { merge: true });
      console.log("%c photoUrl", "color: orange; font-size: 25px", photoUrl);
      dispatch(setPhotoUrl(photoUrl));
    } catch (err) {
      throw new Error("Greska pri promeni profilne slike.", err);
    }
  };

  return (
    <main className="profile">
      <nav className="profile__nav">
        <span className="nav__back">
          <img onClick={back} src="assets/svg/back.svg" alt="back" />
        </span>
        <p className="nav__my-profile">My Profile(DUALITY)</p>
      </nav>

      <span className="profile__picture-container">
        <img
          className="picture-container__picture"
          src={user?.photoUrl ? user.photoUrl : "assets/svg/businessman.svg"}
          alt={user?.photoUrl ? "user-photo" : "placeholder"}
        />

        <button onClick={selectPicture} className="picture-container__upload">
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

      <div className="profile__info-container">
        <h1>Profile</h1>
        {user?.displayName && <h3>Display name: {user.displayName}</h3>}
        {user?.email && <h3>Email: {user.email}</h3>}
        {user?.id && <h3>Id: {user.id}</h3>}
        {user?.carUrl ? (
          <div>
            <p>Selected car:</p>
            <img
              src={user.carUrl}
              className="profile__car"
              alt="selected-car"
              draggable="false"
            />

            <button onClick={removeCar}>delete car</button>
          </div>
        ) : (
          <>
            <p>Please select a car:</p>
            <div id="car-select">
              <button onClick={toggleSelect}>Choose a car</button>
              {carSelectIsOpen && cars && (
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
                  <button onClick={saveCar}>Save</button>
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default Profile;
