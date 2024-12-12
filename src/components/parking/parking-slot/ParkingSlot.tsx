import React, { useState } from "react";
import "./ParkingSlot.scss";
import ParkingReservationModal from "../parking-reservation-modal/ParkingReservationModal";
import Modal from "../../../utils/modal/Modal";

interface ParkingSlotProps {
  parkingNo: number;
}
const ParkingSlot = (props: ParkingSlotProps) => {
  const [reservationModalIsOpen, setReservationModalIsOpen] = useState(false);
  const [isReserved, setIsReserved] = useState<boolean>(false);

  const openModal = () => {
    setReservationModalIsOpen(true);
  };

  const log = () => {
    console.log("%c isReserved", "color: orange; font-size: 25px", isReserved);
  };

  return (
    <div className="parking-slot-container">
      <div onClick={openModal} className="parking-slot">
        {props.parkingNo} - {isReserved ? "Reserved" : "Open"}
      </div>
      <Modal
        isOpen={reservationModalIsOpen}
        onClose={() => setReservationModalIsOpen(false)}
      >
        <ParkingReservationModal />
      </Modal>
    </div>
  );
};

export default ParkingSlot;
