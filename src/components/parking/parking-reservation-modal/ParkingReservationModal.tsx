import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import { DateRange, RangeKeyDict } from "react-date-range";
import enUS from "date-fns/locale/en-US"; // Primer za engleski jezik
import QRCode from "qrcode";
import { RootState } from "../../../store";
import { useSelector } from "react-redux";
import ParkingSlotInfo from "../../../models/ParkingSlotInfo";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../config/firebase";
import { useDispatch } from "react-redux";
import { setDateForShow } from "../../../store/features/parkingSlice";
import ReservationFirestore from "../../../store/types/ReservationFirestore";
import { Timestamp } from "firebase/firestore";

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

    // Provera da li user već ima rezervaciju za bilo koji dan u izabranom periodu
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

    // Provera da li slot nije već zauzet (kao i do sada)
    const overlapReservationsQuery = query(
      reservationsRef,
      where("startTime", "<=", Timestamp.fromDate(endTime)),
      where("endTime", ">=", Timestamp.fromDate(startTime)),
      where("parkingSlotId", "==", parking.id)
    );
    const snapshot = await getDocs(overlapReservationsQuery);

    if (snapshot.empty) {
      await addDoc(reservationsRef, {
        userId: user.id,
        parkingSlotId: parking.id,
        startTime: Timestamp.fromDate(startTime),
        endTime: Timestamp.fromDate(endTime),
      });
      onClose();
    } else {
      setError("Ovaj slot je već rezervisan u tom periodu.");
    }
  };

  const onRangeChange = (ranges: RangeKeyDict) => {
    setDate(ranges.selection);
    setValue("reservationTime", ranges.selection);
    // Kada korisnik klikne na datum, pomeri DateSlider na taj dan
    if (ranges.selection && ranges.selection.startDate) {
      dispatch(setDateForShow(ranges.selection.startDate.getTime()));
      window.dispatchEvent(
        new CustomEvent("dateSlider-set-date", {
          detail: { date: ranges.selection.startDate },
        })
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
      />

      {error && (
        <div style={{ color: "crimson", margin: "8px 0" }}>{error}</div>
      )}

      <button className="parking-reservation__reserve" type="submit">
        Reserve
      </button>
    </form>
  );
};

export default ParkingReservationModal;
