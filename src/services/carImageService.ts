import { db } from "../config/firebase";
import CarInfo from "../models/CarInfo";
import { collection, deleteField, doc, updateDoc } from "firebase/firestore";
import { AppDispatch } from "../store";
import { clearCar, updateCar } from "../store/features/authSlice";

const cars: CarInfo[] = [
  {
    path: "assets/images/cars/azure-car.png",
    name: "azure-car",
  },
  {
    path: "assets/images/cars/black-car.png",
    name: "black-car",
  },
  {
    path: "assets/images/cars/blue-car.png",
    name: "blue-car",
  },
  {
    path: "assets/images/cars/cyan-car.png",
    name: "cyan-car",
  },
  {
    path: "assets/images/cars/darkgreen-car.png",
    name: "darkgreen-car",
  },
  {
    path: "assets/images/cars/green-car.png",
    name: "green-car",
  },
  {
    path: "assets/images/cars/grey-car.png",
    name: "grey-car",
  },
  {
    path: "assets/images/cars/lightblue-car.png",
    name: "lightblue-car",
  },
  {
    path: "assets/images/cars/lightgrey-car.png",
    name: "lightgrey-car",
  },
  {
    path: "assets/images/cars/lightorange-car.png",
    name: "lightorange-car",
  },
  {
    path: "assets/images/cars/lightred-car.png",
    name: "lightred-car",
  },
  {
    path: "assets/images/cars/navy-car.png",
    name: "navy-car",
  },
  {
    path: "assets/images/cars/orange-car.png",
    name: "orange-car",
  },
  {
    path: "assets/images/cars/police-car.png",
    name: "police-car",
  },
  {
    path: "assets/images/cars/porche-car.png",
    name: "porche-car",
  },
  {
    path: "assets/images/cars/red-car.png",
    name: "red-car",
  },
  {
    path: "assets/images/cars/taxi-car.png",
    name: "taxi-car",
  },
  {
    path: "assets/images/cars/beige-car.png",
    name: "beige-car",
  },
  {
    path: "assets/images/cars/white-car.png",
    name: "white-car",
  },
  {
    path: "assets/images/cars/yellow-car.png",
    name: "yellow-car",
  },
];

export const getCars = (): CarInfo[] => {
  return cars;
};

export const addCar =
  (car: CarInfo | undefined, userId: string | undefined) =>
  async (dispatch: AppDispatch) => {
    if (!car) return;

    const usersRef = collection(db, "users");
    try {
      await updateDoc(doc(usersRef, userId), { carUrl: car.path });
    } catch (err) {
      console.error("Error adding a car in carImageService:", err);
    }

    dispatch(updateCar(car.path));
  };

export const deleteCar =
  (userId: string | undefined) => async (dispatch: AppDispatch) => {
    const usersRef = collection(db, "users");
    try {
      await updateDoc(doc(usersRef, userId), { carUrl: deleteField() });
    } catch (err) {
      console.error("Error deleting a car in carImageService:", err);
    }

    dispatch(clearCar());
  };
