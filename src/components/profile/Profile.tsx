import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { addCar, getCars } from "../../services/carImageService";
import CarInfo from "../../models/CarInfo";

const Profile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);

  const [carSelectIsOpen, setCarSelectIsOpen] = useState(false);
  const [car, setCar] = useState<CarInfo>();
  const cars = getCars();

  const toggleSelect = () => {
    setCarSelectIsOpen(!carSelectIsOpen);
  };

  const changeCar = (car) => {
    console.log("%c car", "color: orange; font-size: 25px", car);
    setCar(car);
    console.log("%c car", "color: orange; font-size: 25px", car);
  };

  const saveCar = () => {
    dispatch(addCar(car, user?.id));
  };

  return (
    <div className="profile">
      <h1>Profile</h1>
      {user?.displayName && <h3>Display name: {user.displayName}</h3>}
      {user?.email && <h3>Email: {user.email}</h3>}
      {user?.id && <h3>Id: {user.id}</h3>}
      {user?.carUrl ? (
        <div>
          <p>Selected car:</p>
          <img
            src={user.carUrl}
            alt="selected-car"
            style={{ width: "200px" }}
            draggable="false"
          />
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
  );
};

export default Profile;
