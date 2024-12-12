import React, { useState } from "react";
import { useForm } from "react-hook-form";

import { DateRange, RangeKeyDict } from "react-date-range";
import enUS from "date-fns/locale/en-US"; // Primer za engleski jezik
import QRCode from "qrcode";

export interface Range {
  startDate?: Date;
  endDate?: Date;
  key?: string;
}
const ParkingReservationModal = () => {
  const { register, handleSubmit, setValue } = useForm();
  const [date, setDate] = useState<Range>({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });

  const onReserveSlot = async (form) => {
    const code = await QRCode.toDataURL(
      `Parking rezervisan od ${date.startDate} do ${date.endDate}`
    );
    console.log("%c code", "color: orange; font-size: 25px", code);
    console.log("%c form", "color: orange; font-size: 25px", form);
  };

  const handleChange = (ranges: RangeKeyDict) => {
    console.log("%c ranges", "color: orange; font-size: 25px", ranges);

    setDate(ranges.selection);
    setValue("reservationTime", ranges.selection);
  };
  return (
    <form onSubmit={handleSubmit(onReserveSlot)}>
      <label htmlFor="parking-slot">Slot:</label>
      <input id="parking-slot" {...register("parkingSpot")} required />

      <div>
        Parking range:
        <DateRange
          {...register("reservationTime")}
          locale={enUS}
          ranges={[date]}
          onChange={handleChange}
        />
      </div>

      <button type="submit">Reserve</button>
    </form>
  );
};

export default ParkingReservationModal;
