import React, { ChangeEvent, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import ParkingSlotInfo from "../../../models/ParkingSlotInfo";
import ParkingStatus from "../../../enums/ParkingStatus";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { db } from "../../../config/firebase.ts";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store/index.ts";
import {
  deleteParking,
  deleteReservations,
  fetchParking,
} from "../../../store/features/parkingSlice.ts";

interface CreateParkingFormInputs {
  rowNumber: number;
  columnNumber: number;
}

interface CreateParkingModalProps {
  onClose: () => void;
}

const CreateParkingModal = ({ onClose }: CreateParkingModalProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { register, handleSubmit } = useForm<CreateParkingFormInputs>();
  const MAX_INPUT_LENGTH = 15;
  const [rowValue, setRowValue] = useState<string>("0");
  const [columnValue, setColumnValue] = useState<string>("0");
  const [openConfirm, setOpenConfirm] = useState<boolean>(false);

  const createParking: SubmitHandler<CreateParkingFormInputs> = async (
    formData: CreateParkingFormInputs
  ) => {
    let grid: Omit<ParkingSlotInfo, "id">[][] = [];
    const parkingRef = collection(db, "parking");

    const snapshot = await getDocs(parkingRef);
    if (!snapshot.empty) {
      dispatch(deleteReservations());
      dispatch(deleteParking(snapshot.docs));

      for (let i = 0; i < formData.rowNumber; i++) {
        grid[i] = [];
        for (let j = 0; j < formData.columnNumber; j++) {
          grid[i][j] = {
            number: (i * formData.columnNumber + j + 1).toString(),
            row: i,
            column: j,
            status: ParkingStatus.FREE,
          };
          setDoc(doc(parkingRef, `${i}.${j}`), grid[i][j]);
        }
      }

      dispatch(fetchParking());
      onClose();
    }
  };

  const validateInput = (e: ChangeEvent<HTMLInputElement>, input: string) => {
    if (+e.target.value > MAX_INPUT_LENGTH) {
      if (input === "row") setRowValue(Number(rowValue).toString());
      else setColumnValue(Number(columnValue).toString());
    } else {
      if (input === "row") setRowValue(Number(e.target.value).toString());
      else setColumnValue(Number(e.target.value).toString());
    }
  };

  return (
    <form className="create-parking" onSubmit={handleSubmit(createParking)}>
      <label className="create-parking__field">
        Rows:
        <input
          className="field__input"
          {...register("rowNumber", { min: 0, valueAsNumber: true })}
          onChange={(e) => validateInput(e, "row")}
          type="number"
          value={rowValue}
          max={MAX_INPUT_LENGTH}
        />
      </label>
      <label className="create-parking__field">
        Columns:
        <input
          className="field__input"
          {...register("columnNumber", {
            min: 0,
            valueAsNumber: true,
          })}
          onChange={(e) => validateInput(e, "col")}
          type="number"
          value={columnValue}
          max={MAX_INPUT_LENGTH}
        />
      </label>
      <p className="note">
        Note: Creating a parking will delete all reservations
      </p>
      <div className="create-parking__footer">
        {openConfirm ? (
          <>
            <div className="confirm-options">
              <button type="submit" className="confirm-option">
                <img
                  className="option--yes"
                  src="assets/svg/check.svg"
                  alt="check"
                />
              </button>
              <p>Are you sure?</p>
              <button
                className="confirm-option"
                onClick={() => setOpenConfirm(false)}
              >
                <span className="option--no">X</span>
              </button>
            </div>
          </>
        ) : (
          <button
            className="footer__create-parking"
            onClick={() => setOpenConfirm(true)}
          >
            Create parking
          </button>
        )}
      </div>
    </form>
  );
};

export default CreateParkingModal;
