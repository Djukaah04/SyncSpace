import React, { useEffect, useState } from "react";
import ParkingReservationModal from "../parking-reservation-modal/ParkingReservationModal";
import Modal from "../../../utils/modal/Modal";
import ParkingSlotInfo from "../../../models/ParkingSlotInfo";
import ParkingStatus from "../../../enums/ParkingStatus";
import UserInfo from "../../../models/UserInfo";
import { db } from "../../../config/firebase";
import { doc, getDoc } from "firebase/firestore";

interface ParkingSlotProps {
  parking: ParkingSlotInfo;
}
const ParkingSlot = ({ parking }: ParkingSlotProps) => {
  const [reservationModalIsOpen, setReservationModalIsOpen] = useState(false);
  const openModal = () => {
    setReservationModalIsOpen(true);
    // log();
  };
  const [occupyingUser, setOccupyingUser] = useState<UserInfo | undefined>(
    undefined
  );

  const log = () => {
    console.log("%c parking", "color: orange; font-size: 25px", parking);
    console.log(
      "%c occupyingUser",
      "color: orange; font-size: 25px",
      occupyingUser
    );
  };

  const getUserById = async () => {
    if (!parking.userId) return;

    const userRef = doc(db, "users", parking.userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) setOccupyingUser(userDoc.data() as UserInfo);
  };

  useEffect(() => {
    getUserById();
  }, [parking.userId]);

  return (
    <div className="parking-slot-container">
      <div
        onClick={openModal}
        className={`parking-slot ${
          parking.status === ParkingStatus.FREE ? "slot-free" : "slot-taken"
        }`}
      >
        {parking.status === ParkingStatus.FREE ? (
          parking.number
        ) : occupyingUser && occupyingUser.carUrl ? (
          <img
            src={occupyingUser.carUrl}
            alt="car-image"
            className="parking-slot__car"
          />
        ) : (
          "aj di"
        )}
      </div>
      <Modal
        isOpen={reservationModalIsOpen}
        onClose={() => setReservationModalIsOpen(false)}
      >
        <ParkingReservationModal
          parking={parking}
          onClose={() => setReservationModalIsOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default ParkingSlot;
