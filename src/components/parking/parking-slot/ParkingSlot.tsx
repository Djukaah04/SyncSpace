import React, { useEffect, useState } from "react";
import ParkingReservationModal from "../parking-reservation-modal/ParkingReservationModal";
import ReservationDetailsModal from "../reservation-details-modal/ReservationDetailsModal";
import Modal from "../../../utils/modal/Modal";
import ParkingSlotInfo from "../../../models/ParkingSlotInfo";
import ParkingStatus from "../../../enums/ParkingStatus";
import UserInfo from "../../../models/UserInfo";
import { db } from "../../../config/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";

interface ParkingSlotProps {
  parking: ParkingSlotInfo;
}

const ParkingSlot = ({ parking }: ParkingSlotProps) => {
  const [reservationModalIsOpen, setReservationModalIsOpen] = useState(false);
  const [detailsModalIsOpen, setDetailsModalIsOpen] = useState(false);
  const [reservationEnd, setReservationEnd] = useState<Date | undefined>(
    undefined
  );
  const [adminModalIsOpen, setAdminModalIsOpen] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const [occupyingUser, setOccupyingUser] = useState<UserInfo | undefined>(
    undefined
  );

  const handleSlotClick = async () => {
    if (parking.status === ParkingStatus.FREE) {
      setReservationModalIsOpen(true);
    } else if (parking.status === ParkingStatus.RESERVED && parking.userId) {
      const reservationsRef = collection(db, "reservations");
      const q = query(
        reservationsRef,
        where("parkingSlotId", "==", parking.id),
        where("userId", "==", parking.userId)
      );
      const snapshot = await getDocs(q);
      let maxEnd: Date | undefined = undefined;
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.endTime && data.endTime.toDate) {
          const end = data.endTime.toDate();
          if (!maxEnd || end > maxEnd) maxEnd = end;
        }
      });
      setReservationEnd(maxEnd);
      setDetailsModalIsOpen(true);
    }
  };

  const openAdminModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAdminModalIsOpen(true);
  };

  const getUserById = async () => {
    if (!parking.userId) return;

    const userRef = doc(db, "users", parking.userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) setOccupyingUser(userDoc.data() as UserInfo);
  };

  useEffect(() => {
    getUserById();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parking.userId]);

  const disableSlot = async () => {
    setAdminLoading(true);
    try {
      await updateDoc(doc(db, "parking", parking.id), {
        status: ParkingStatus.DISABLED,
        userId: null,
      });
      setAdminModalIsOpen(false);
    } catch (e) {
    } finally {
      setAdminLoading(false);
    }
  };

  const enableSlot = async () => {
    setAdminLoading(true);
    try {
      await updateDoc(doc(db, "parking", parking.id), {
        status: ParkingStatus.FREE,
        userId: null,
      });
      setAdminModalIsOpen(false);
    } catch (e) {
    } finally {
      setAdminLoading(false);
    }
  };

  const freeReservation = async () => {
    setAdminLoading(true);
    try {
      if (parking.userId) {
        const reservationsRef = collection(db, "reservations");
        const q = query(
          reservationsRef,
          where("parkingSlotId", "==", parking.id)
        );
        const snapshot = await getDocs(q);
        for (const docSnap of snapshot.docs) {
          await deleteDoc(docSnap.ref);
        }
      }
      await updateDoc(doc(db, "parking", parking.id), {
        status: ParkingStatus.FREE,
        userId: null,
      });
      setAdminModalIsOpen(false);
    } catch (e) {
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div className="parking-slot-container">
      <div
        onClick={handleSlotClick}
        className={`parking-slot ${
          parking.status === ParkingStatus.FREE
            ? "slot-free"
            : parking.status === ParkingStatus.RESERVED
            ? "slot-taken"
            : "slot-disabled"
        }`}
      >
        {parking.status === ParkingStatus.FREE ? (
          parking.number
        ) : parking.status === ParkingStatus.RESERVED ? (
          occupyingUser && occupyingUser.carUrl ? (
            <img
              src={occupyingUser.carUrl}
              alt="car-image"
              className="parking-slot__car"
            />
          ) : (
            occupyingUser?.displayName
          )
        ) : (
          <span className="disabled-label">X</span>
        )}

        {user && (
          <img
            onClick={openAdminModal}
            className="parking-slot__admin-icon"
            src="assets/svg/edit.svg"
            alt="edit-icon"
          />
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

      {occupyingUser && (
        <ReservationDetailsModal
          isOpen={detailsModalIsOpen}
          onClose={() => setDetailsModalIsOpen(false)}
          user={occupyingUser}
          carPlate={occupyingUser.carPlate}
          carUrl={occupyingUser.carUrl}
          photoUrl={occupyingUser.photoUrl}
          displayName={occupyingUser.displayName || undefined}
          reservationEnd={reservationEnd}
        />
      )}

      <Modal
        isOpen={adminModalIsOpen}
        onClose={() => setAdminModalIsOpen(false)}
      >
        <div className="admin-modal">
          {adminLoading ? (
            <img
              src="assets/svg/gear-spinner.svg"
              className="loading__gears"
              alt="gear-spinner"
            />
          ) : parking.status === ParkingStatus.DISABLED ? (
            <>
              <h3>Enable this slot?</h3>
              <button className="btn-enable" onClick={enableSlot}>
                Enable
              </button>
            </>
          ) : parking.status === ParkingStatus.RESERVED ? (
            <>
              <h3>Free this reserved slot?</h3>
              <button className="btn-free" onClick={freeReservation}>
                Free
              </button>
            </>
          ) : (
            <>
              <h3>Disable this free slot?</h3>
              <button className="btn-disable" onClick={disableSlot}>
                Disable
              </button>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ParkingSlot;
