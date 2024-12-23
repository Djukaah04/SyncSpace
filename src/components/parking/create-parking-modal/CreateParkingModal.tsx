import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import ParkingSlotInfo from "../../../models/ParkingSlotInfo";
import ParkingStatus from "../../../enums/ParkingStatus";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "../../../config/firebase.ts";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store/index.ts";
import { setParkingSize } from "../../../store/features/parkingSlice.ts";

interface CreateParkingFormInputs {
  rowNumber: number;
  columnNumber: number;
}

const CreateParkingModal = ({ onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { register, handleSubmit } = useForm<CreateParkingFormInputs>();

  const createParking: SubmitHandler<CreateParkingFormInputs> = (
    formData: CreateParkingFormInputs
  ) => {
    let grid: Omit<ParkingSlotInfo, "id">[][] = [];
    const parkingRef = collection(db, "parking");

    for (let i = 0; i < formData.rowNumber; i++) {
      grid[i] = [];
      for (let j = 0; j < formData.columnNumber; j++) {
        grid[i][j] = { row: i, column: j, status: ParkingStatus.FREE };
        setDoc(doc(parkingRef, `${i}.${j}`), grid[i][j]);
      }
    }
    dispatch(
      setParkingSize({
        rowNumber: formData.rowNumber,
        columnNumber: formData.columnNumber,
      })
    );
    onClose();
  };
  return (
    <>
      <form onSubmit={handleSubmit(createParking)}>
        <h1>Create Parking</h1>
        <label htmlFor="row-number">Row number:</label>
        <input
          {...register("rowNumber", { min: 0, valueAsNumber: true })}
          id="row-number"
          type="number"
        />
        <label htmlFor="column-number">Column number:</label>
        <input
          {...register("columnNumber", { min: 0, valueAsNumber: true })}
          id="column-number"
          type="number"
        />
        <button type="submit">Create parking</button>
      </form>
    </>
  );
};

export default CreateParkingModal;
