import React, { useState } from "react";
import "./ParkingSlot.scss";
import ParkingReservationModal from "../parking-reservation-modal/ParkingReservationModal";
import Modal from "../../../utils/modal/Modal";
import ParkingSlotInfo from "../../../models/ParkingSlotInfo";
import ParkingStatus from "../../../enums/ParkingStatus";

interface ParkingSlotProps {
  parking: ParkingSlotInfo;
}
const ParkingSlot = (props: ParkingSlotProps) => {
  const [reservationModalIsOpen, setReservationModalIsOpen] = useState(false);
  const openModal = () => {
    setReservationModalIsOpen(true);
  };

  const log = () => {
    console.log("%c parking", "color: orange; font-size: 25px", props.parking);
  };

  return (
    <div className="parking-slot-container">
      <div
        onClick={openModal}
        className={`parking-slot ${
          props.parking.status === ParkingStatus.FREE
            ? "slot-free"
            : "slot-taken"
        }`}
      >
        {props.parking.row}.{props.parking.column} - {props.parking.status}
      </div>
      <Modal
        isOpen={reservationModalIsOpen}
        onClose={() => setReservationModalIsOpen(false)}
      >
        <ParkingReservationModal parking={props.parking} />
      </Modal>
    </div>
  );
};

export default ParkingSlot;
