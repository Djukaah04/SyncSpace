import React, { useEffect, useRef, useState } from "react";
import ParkingSlot from "./parking-slot/ParkingSlot";
import "./Parking.scss";
import ParkingSlotInfo from "../../models/ParkingSlotInfo";
import Modal from "../../utils/modal/Modal";
import CreateParkingModal from "./create-parking-modal/CreateParkingModal";
import {
  fetchParking,
  ParkingSize,
  setParkingSlots,
} from "../../store/features/parkingSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import {
  collection,
  onSnapshot,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import ReservationInfo from "../../models/ReservationInfo";

const Parking = () => {
  const dispatch = useDispatch<AppDispatch>();

  const parkingSlots: ParkingSlotInfo[] = useSelector(
    (state: RootState) => state.parking.parkingSlots
  );
  const reservations: ReservationInfo[] = useSelector(
    (state: RootState) => state.parking.reservations
  );
  const parkingSize: ParkingSize = useSelector(
    (state: RootState) => state.parking.parkingSize
  );

  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const arrayToMatrix = (
    array: ParkingSlotInfo[],
    columns: number
  ): ParkingSlotInfo[][] | undefined => {
    if (columns <= 0) return;

    const matrix: ParkingSlotInfo[][] = [];
    for (let i = 0; i < array.length; i += columns) {
      matrix.push(array.slice(i, i + columns));
    }

    return matrix;
  };
  const log = () => {
    console.log(
      "%c parkingSlots",
      "color: orange; font-size: 25px",
      parkingSlots
    );
    console.log(
      "%c reservations",
      "color: orange; font-size: 25px",
      reservations
    );
  };

  useEffect(() => {
    dispatch(fetchParking());

    const parkingRef = collection(db, "parking");
    onSnapshot(parkingRef, (snapshot) => {
      console.log("%c snapshot", "color: green; font-size: 25px");
      const parking: ParkingSlotInfo[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<ParkingSlotInfo, "id">),
      }));
      dispatch(setParkingSlots(parking));
    });

    // return () => {
    //   unsubscribe();
    //   console.log("%c unsubrscribe!", "color: orange; font-size: 25px");
    // };
  }, [dispatch]);

  return (
    <>
      <button onClick={log}>Log</button>
      <button onClick={openModal}>create new parking</button>
      <Modal isOpen={modalIsOpen} onClose={closeModal}>
        <CreateParkingModal onClose={closeModal} />
      </Modal>
      <div className="parking">
        {parkingSlots &&
          arrayToMatrix(parkingSlots, parkingSize.columnNumber)?.map(
            (row, index) => (
              <div key={index} className="parking-row">
                Row {index + 1}:
                {row.map((slot) => (
                  <ParkingSlot
                    key={`parking-${slot.row}.${slot.column}`}
                    parking={slot}
                  ></ParkingSlot>
                ))}
              </div>
            )
          )}
      </div>
    </>
  );
};

export default Parking;
