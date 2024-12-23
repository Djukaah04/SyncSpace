import React, { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import { DateRange, RangeKeyDict } from "react-date-range";
import enUS from "date-fns/locale/en-US"; // Primer za engleski jezik
import QRCode from "qrcode";
import { RootState } from "../../../store";
import { useSelector } from "react-redux";
import ParkingSlotInfo from "../../../models/ParkingSlotInfo";
import ReservationInfo from "../../../models/ReservationInfo";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../config/firebase";
import ReservationFirestore from "../../../store/types/ReservationFirestore";
import { Timestamp } from "firebase/firestore";
import ParkingStatus from "../../../enums/ParkingStatus";

export interface Range {
  startDate?: Date;
  endDate?: Date;
  key?: string;
}

interface ParkingSlotProps {
  parking: ParkingSlotInfo;
}

interface ParkingReservationFormInputs {
  reservationTime: Range;
}

const ParkingReservationModal = (props: ParkingSlotProps) => {
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

    const newReservation: ReservationFirestore = {
      userId: user.uid,
      parkingSlotId: props.parking.id,
      startTime: Timestamp.fromDate(formData.reservationTime.startDate),
      endTime: Timestamp.fromDate(formData.reservationTime.endDate),
    };
    const reservationsRef = collection(db, "reservations");
    const parkingRef = collection(db, "parking");

    const currentTime = Timestamp.now();
    const reservationDoc = await addDoc(reservationsRef, newReservation);
    if (
      newReservation.startTime <= currentTime &&
      newReservation.endTime >= currentTime
    ) {
      await updateDoc(
        doc(parkingRef, props.parking.id),
        "status",
        ParkingStatus.RESERVED
      );
    }
    console.log("%c gotov update", "color: lightgreen; font-size: 25px");
  };

  const onRangeChange = (ranges: RangeKeyDict) => {
    setDate(ranges.selection);
    setValue("reservationTime", ranges.selection);
  };

  return (
    <form onSubmit={handleSubmit(reserveSlot)}>
      <label>
        Slot {props.parking.row}.{props.parking.column}
      </label>

      <div>
        <DateRange
          {...register("reservationTime")}
          locale={enUS}
          ranges={[date]}
          onChange={onRangeChange}
        />
      </div>

      <button type="submit">Reserve</button>
    </form>
  );
};

export default ParkingReservationModal;
