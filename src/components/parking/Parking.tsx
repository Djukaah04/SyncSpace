import React, { useEffect, useState } from "react";
import ParkingSlot from "./parking-slot/ParkingSlot";

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
  getDocs,
  onSnapshot,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import ReservationInfo from "../../models/ReservationInfo";
import DateSlider from "../../utils/date-slider/DateSlider";
import ReservationFirestore from "../../store/types/ReservationFirestore";
import ParkingStatus from "../../enums/ParkingStatus";

const Parking = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  // const [takenSlots, setTakenSlots]=useState<>

  const loading: boolean = useSelector(
    (state: RootState) => state.parking.loading
  );
  const parkingSlots: ParkingSlotInfo[] = useSelector(
    (state: RootState) => state.parking.parkingSlots
  );
  const reservations: ReservationInfo[] = useSelector(
    (state: RootState) => state.parking.reservations
  );
  const parkingSize: ParkingSize = useSelector(
    (state: RootState) => state.parking.parkingSize
  );
  const dateForShow: number = useSelector(
    (state: RootState) => state.parking.dateForShow
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

  const hasParkingChanged = (
    parking1: ParkingSlotInfo[],
    parking2: ParkingSlotInfo[]
  ): boolean => {
    if (parking1.length !== parking2.length) return true;

    for (let i = 0; i < parking1.length; i++) {
      if (
        parking2.some(
          (slot2) =>
            parking1[i].id === slot2.id && parking1[i].status !== slot2.status
        )
      ) {
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    dispatch(fetchParking());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    //prebaci u fju
    const reservationsRef = collection(db, "reservations");
    const currentDayReservationsQuery = query(
      reservationsRef,
      where("startTime", "<=", Timestamp.fromMillis(dateForShow)),
      where("endTime", ">=", Timestamp.fromMillis(dateForShow))
    );
    const unsubscribe = onSnapshot(currentDayReservationsQuery, (snapshot) => {
      const currentReservations: ReservationInfo[] = snapshot.docs.map(
        (doc) => ({
          ...(doc.data() as ReservationFirestore),
          id: doc.id,
          startTime: (doc.data() as ReservationFirestore).startTime.toMillis(),
          endTime: (doc.data() as ReservationFirestore).endTime.toMillis(),
        })
      );

      const takenSlots: { slotId: string; userId: string }[] = Array.from(
        new Map(
          currentReservations.map((reservation) => [
            reservation.parkingSlotId,
            { slotId: reservation.parkingSlotId, userId: reservation.userId },
          ])
        ).values()
      );
      const parking: ParkingSlotInfo[] = parkingSlots.map(
        (slot: ParkingSlotInfo) =>
          takenSlots.some((takenSlot) => takenSlot.slotId === slot.id)
            ? {
                ...slot,
                status: ParkingStatus.RESERVED,
                userId: takenSlots.find(
                  (takenSlot) => takenSlot.slotId === slot.id
                )?.userId,
              }
            : { ...slot, status: ParkingStatus.FREE, userId: undefined }
      );

      if (
        parkingSlots.length !== 0 &&
        hasParkingChanged(parkingSlots, parking)
      ) {
        dispatch(setParkingSlots(parking));
      }
    });

    return () => {
      unsubscribe();
    };
  }, [dispatch, parkingSlots, dateForShow]);

  return (
    <>
      <DateSlider />
      {imageUrl && (
        <div>
          <p>Image uploaded successfully:</p>
          <img src={imageUrl} alt="Uploaded" style={{ width: "300px" }} />
        </div>
      )}

      <Modal isOpen={modalIsOpen} onClose={closeModal}>
        <CreateParkingModal onClose={closeModal} />
      </Modal>
      <div className="parking">
        {parkingSlots &&
          arrayToMatrix(parkingSlots, parkingSize.columnNumber)?.map(
            (row, index) => (
              <div key={index} className="parking-row">
                {row.map((slot) => (
                  <ParkingSlot
                    key={`parking-${slot.row}.${slot.column}`}
                    parking={slot}
                  ></ParkingSlot>
                ))}
              </div>
            )
          )}
        <button className="parking__create-parking-button" onClick={openModal}>
          create new parking
        </button>
      </div>
    </>
  );
};

export default Parking;
