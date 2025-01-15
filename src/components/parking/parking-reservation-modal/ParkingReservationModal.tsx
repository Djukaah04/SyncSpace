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

  const reserveSlot: SubmitHandler<ParkingReservationFormInputs> = async (
    formData: ParkingReservationFormInputs
  ) => {
    // const code = await QRCode.toDataURL(
    //   `Parking rezervisan od ${date.startDate} do ${date.endDate}`
    // );
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

    const newReservation: ReservationFirestore = {
      userId: user.id,
      parkingSlotId: parking.id,
      startTime: Timestamp.fromDate(startTime),
      endTime: Timestamp.fromDate(endTime),
    };

    const reservationsRef = collection(db, "reservations");
    const overlapReservationsQuery = query(
      reservationsRef,
      where("startTime", "<=", Timestamp.fromDate(endTime)),
      where("endTime", ">=", Timestamp.fromDate(startTime)),
      where("parkingSlotId", "==", parking.id)
    );
    const snapshot = await getDocs(overlapReservationsQuery);

    if (snapshot.empty) {
      await addDoc(reservationsRef, newReservation);
      onClose();
    } else {
      console.log(
        "%c Rezervacija vec postoji",
        "color: red; font-size: 25px",
        snapshot.docs.forEach((res) => {
          console.log(
            "%c res.data()",
            "color: orange; font-size: 25px",
            res.data()
          );
        })
      );
    }
  };

  const onRangeChange = (ranges: RangeKeyDict) => {
    setDate(ranges.selection);
    setValue("reservationTime", ranges.selection);
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

      <button className="parking-reservation__reserve" type="submit">
        Reserve
      </button>
    </form>
  );
};

export default ParkingReservationModal;
