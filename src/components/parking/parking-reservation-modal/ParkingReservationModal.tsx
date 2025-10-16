import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { DateRange, RangeKeyDict } from "react-date-range";
import enUS from "date-fns/locale/en-US";
import { RootState } from "../../../store";
import { useSelector, useDispatch } from "react-redux";
import ParkingSlotInfo from "../../../models/ParkingSlotInfo";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../config/firebase";
import { setDateForShow } from "../../../store/features/parkingSlice";
import ReservationFirestore from "../../../store/types/ReservationFirestore";
import { Timestamp } from "firebase/firestore";
import { sendNotification } from "../../../services/notificationsService";
import NotificationType from "../../../enums/NotificationType";
import { formatDateRange } from "../../../services/formattingService";

export interface Range {
  startDate?: Date;
  endDate?: Date;
  key?: string;
}

interface ParkingSlotProps {
  parking: ParkingSlotInfo;
  onClose: any;
}

interface ParkingReservationFormInputs {
  reservationTime: Range;
}

const ParkingReservationModal = ({ parking, onClose }: ParkingSlotProps) => {
  const { register, handleSubmit, setValue } =
    useForm<ParkingReservationFormInputs>({
      defaultValues: {
        reservationTime: {
          startDate: new Date(),
          endDate: new Date(),
        },
      },
    });

  const [date, setDate] = useState<Range>({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });

  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const [error, setError] = useState<string | null>(null);

  const reserveSlot: SubmitHandler<ParkingReservationFormInputs> = async (
    formData: ParkingReservationFormInputs
  ) => {
    setError(null);
    if (
      !user ||
      !formData.reservationTime.startDate ||
      !formData.reservationTime.endDate
    )
      return;

    const startTime = new Date(
      formData.reservationTime.startDate.setHours(0, 0, 0, 0)
    );
    const endTime = new Date(
      formData.reservationTime.endDate.setHours(23, 59, 59, 999)
    );

    // Provera duzine rezervacije — maksimum 7 dana
    const diffMs = endTime.getTime() - startTime.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    if (diffDays > 7) {
      setError("Ne možete rezervisati duže od 7 dana!");
      return;
    }

    // Provera da li user vec ima rezervaciju za neki od izabranih dana
    const reservationsRef = collection(db, "reservations");
    const userReservationsQuery = query(
      reservationsRef,
      where("userId", "==", user.id)
    );
    const userReservationsSnap = await getDocs(userReservationsQuery);
    let conflict = false;
    userReservationsSnap.forEach((docSnap) => {
      const data = docSnap.data() as ReservationFirestore;
      const s = data.startTime.toDate();
      const e = data.endTime.toDate();
      for (
        let d = new Date(startTime);
        d <= endTime;
        d.setDate(d.getDate() + 1)
      ) {
        if (d >= s && d <= e) {
          conflict = true;
        }
      }
    });
    if (conflict) {
      setError("Već imate rezervaciju za neki od izabranih dana!");
      return;
    }

    // Provera da li slot nije zauzet
    const overlapReservationsQuery = query(
      reservationsRef,
      where("startTime", "<=", Timestamp.fromDate(endTime)),
      where("endTime", ">=", Timestamp.fromDate(startTime)),
      where("parkingSlotId", "==", parking.id)
    );
    const snapshot = await getDocs(overlapReservationsQuery);

    if (!snapshot.empty) {
      setError("Ovaj slot je vec rezervisan u tom periodu.");
      return;
    }

    // await addDoc(reservationsRef, {
    //   userId: user.id,
    //   parkingSlotId: parking.id,
    //   startTime: Timestamp.fromDate(startTime),
    //   endTime: Timestamp.fromDate(endTime),
    // });

    const reservationTimeFormatted = formatDateRange(startTime, endTime);
    const message = `Parking slot ${parking.number} reserved on ${reservationTimeFormatted}!`;
    await sendNotification(NotificationType.CAR, message, user);

    onClose();
  };

  const onRangeChange = (ranges: RangeKeyDict) => {
    const { startDate, endDate } = ranges.selection;

    if (startDate && endDate) {
      const diffMs = endDate.getTime() - startDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      if (diffDays > 7) {
        setError("Maksimalna duzina rezervacije je 7 dana!");
      } else {
        setError(null);
      }
    }

    setDate(ranges.selection);
    setValue("reservationTime", ranges.selection);

    // Pomeri DateSlider na izabrani datum
    if (startDate) {
      dispatch(setDateForShow(startDate.getTime()));
      window.dispatchEvent(
        new CustomEvent("dateSlider-set-date", { detail: { date: startDate } })
      );
    }
  };

  return (
    <form className="parking-reservation" onSubmit={handleSubmit(reserveSlot)}>
      <h2 className="parking-reservation__title">Slot {parking.number}</h2>

      <DateRange
        {...register("reservationTime")}
        locale={enUS}
        ranges={[date]}
        onChange={onRangeChange}
        moveRangeOnFirstSelection={false}
      />

      {error && (
        <div style={{ color: "crimson", margin: "8px 0", fontWeight: 500 }}>
          {error}
        </div>
      )}

      <button
        className="parking-reservation__reserve"
        type="submit"
        disabled={!!error}
        style={{
          opacity: error ? 0.6 : 1,
          cursor: error ? "not-allowed" : "pointer",
          transition: "0.3s ease",
        }}
      >
        Reserve
      </button>
    </form>
  );
};

export default ParkingReservationModal;
