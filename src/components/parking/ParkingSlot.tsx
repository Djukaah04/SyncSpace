import React, { useState } from "react";
import "../../styles/Parking/ParkingSlot.scss";
import Modal from "../../utils/Modal";

interface ParkingSlotProps {
  parkingNo: number;
}
const ParkingSlot = (props: ParkingSlotProps) => {
  const [reservationModalIsOpen, setReservationModalIsOpen] = useState(false);

  const openModal = () => {
    setReservationModalIsOpen(true);
  };
  return (
    <div className="parking-slot-container">
      <div onClick={openModal} className="parking-slot">
        No. {props.parkingNo}
      </div>
      <Modal
        isOpen={reservationModalIsOpen}
        onClose={() => setReservationModalIsOpen(false)}
      >
        Some modal
      </Modal>
    </div>
  );
};

export default ParkingSlot;
