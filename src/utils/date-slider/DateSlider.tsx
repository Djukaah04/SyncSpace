import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, addDays, subDays } from "date-fns";
import { AppDispatch } from "../../store";
import { useDispatch } from "react-redux";
import { setDateForShow } from "../../store/features/parkingSlice";

const DateSlider = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const goToPreviousDay = () => setSelectedDate((prev) => subDays(prev, 1));
  const goToNextDay = () => setSelectedDate((prev) => addDays(prev, 1));

  const changeDay = async (direction: number) => {
    if (direction === -1) goToPreviousDay();
    else goToNextDay();
  };

  useEffect(() => {
    dispatch(setDateForShow(selectedDate.getTime()));
  }, [selectedDate]);

  return (
    <div className="date-slider">
      <div className="date-slider__nav">
        <button
          onClick={() => {
            changeDay(-1);
          }}
          className="nav__day-change"
        >
          <img
            className="arrow"
            src="assets/svg/arrow-left.svg"
            alt="arrow-left"
          />
        </button>
        <h2 className="nav__current-date">{format(selectedDate, "MMMM d")}</h2>
        <button
          onClick={() => {
            changeDay(+1);
          }}
          className="nav__day-change"
        >
          <img
            className="arrow"
            src="assets/svg/arrow-right.svg"
            alt="arrow-right"
          />
        </button>
      </div>

      <DatePicker
        selected={selectedDate}
        onChange={(date) => date && setSelectedDate(date)}
        customInput={
          <button className="date-slider__calendar">📅 Open Calendar</button>
        }
      />
    </div>
  );
};

export default DateSlider;
