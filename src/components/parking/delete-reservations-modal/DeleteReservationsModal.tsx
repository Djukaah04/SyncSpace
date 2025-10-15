import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store/index.ts";
import { deleteReservations } from "../../../store/features/parkingSlice.ts";

interface CreateParkingFormInputs {
  rowNumber: number;
  columnNumber: number;
}

interface CreateParkingModalProps {
  onClose: () => void;
}

const DeleteReservationsModal = ({ onClose }: CreateParkingModalProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { handleSubmit } = useForm<CreateParkingFormInputs>();
  const [openConfirm, setOpenConfirm] = useState<boolean>(false);

  const deleteAllReservations = () => {
    dispatch(deleteReservations());
    onClose();
  };

  return (
    <form
      className="create-parking"
      onSubmit={handleSubmit(deleteAllReservations)}
    >
      <label className="create-parking__field">
        You are about to delete all reservations for all users.
      </label>
      <p className="note">Note: This action is not reversible</p>
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
            Delete All Reservations
          </button>
        )}
      </div>
    </form>
  );
};

export default DeleteReservationsModal;
