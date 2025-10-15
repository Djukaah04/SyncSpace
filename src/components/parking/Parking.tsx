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
import DeleteReservationsModal from "./delete-reservations-modal/DeleteReservationsModal";

const Parking = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

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

  const [createParkingModalIsOpen, setCreateParkingModalIsOpen] =
    useState(false);
  const [deleteReservationsModalIsOpen, setDeleteReservationsModalIsOpen] =
    useState(false);

  const openCreateParkingModal = () => {
    setCreateParkingModalIsOpen(true);
  };

  const openDeleteReservationsModal = () => {
    setDeleteReservationsModalIsOpen(true);
  };

  const closeCreateParkingModal = () => {
    setCreateParkingModalIsOpen(false);
  };

  const closeDeleteReservationsModal = () => {
    setDeleteReservationsModalIsOpen(false);
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
      const state = (window as any).store?.getState?.();
      const currentParkingSlots: ParkingSlotInfo[] =
        state?.parking?.parkingSlots || parkingSlots;
      const parking: ParkingSlotInfo[] = currentParkingSlots.map(
        (slot: ParkingSlotInfo) => {
          if (slot.status === ParkingStatus.DISABLED) {
            return slot;
          }

          if (takenSlots.some((takenSlot) => takenSlot.slotId === slot.id)) {
            return {
              ...slot,
              status: ParkingStatus.RESERVED,
              userId: takenSlots.find(
                (takenSlot) => takenSlot.slotId === slot.id
              )?.userId,
            };
          }

          return { ...slot, status: ParkingStatus.FREE, userId: undefined };
        }
      );

      if (
        currentParkingSlots.length !== 0 &&
        hasParkingChanged(currentParkingSlots, parking)
      ) {
        dispatch(setParkingSlots(parking));
      }
    });

    return () => {
      unsubscribe();
    };
  }, [dispatch, dateForShow]);

  useEffect(() => {
    const parkingRef = collection(db, "parking");
    const unsubscribe = onSnapshot(parkingRef, (snapshot) => {
      const updatedSlots: ParkingSlotInfo[] = snapshot.docs.map((doc) => ({
        ...(doc.data() as ParkingSlotInfo),
        id: doc.id,
      }));

      const state = (window as any).store?.getState?.();
      const currentParkingSlots: ParkingSlotInfo[] =
        state?.parking?.parkingSlots || parkingSlots;
      if (
        currentParkingSlots.length !== 0 &&
        hasParkingChanged(currentParkingSlots, updatedSlots)
      ) {
        dispatch(setParkingSlots(updatedSlots));
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return (
    <>
      <DateSlider />
      {imageUrl && (
        <div>
          <p>Image uploaded successfully:</p>
          <img src={imageUrl} alt="Uploaded" style={{ width: "300px" }} />
        </div>
      )}

      <Modal
        isOpen={createParkingModalIsOpen}
        onClose={closeCreateParkingModal}
      >
        <CreateParkingModal onClose={closeCreateParkingModal} />
      </Modal>
      <Modal
        isOpen={deleteReservationsModalIsOpen}
        onClose={closeDeleteReservationsModal}
      >
        <DeleteReservationsModal onClose={closeDeleteReservationsModal} />
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
        <div className="parking__admin-buttons">
          <button
            className="parking__create-parking-button"
            onClick={openCreateParkingModal}
          >
            create new parking
          </button>
          <button
            className="parking__delete-reservations-button"
            onClick={openDeleteReservationsModal}
          >
            delete all reservations
          </button>
        </div>
      </div>
    </>
  );
};

export default Parking;
