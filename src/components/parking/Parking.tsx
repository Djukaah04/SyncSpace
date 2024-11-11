import React, { useEffect, useState } from "react";
import ParkingSlot from "./ParkingSlot";
import "../../styles/Parking/Parking.scss";
import ParkingSlotInfo from "../../models/ParkingSlotInfo";

type ParkingGrid = ParkingSlotInfo[][];
const Parking = () => {
  const numOfRows = 5;
  const numOfCols = 5;
  // const [parkingGrid, setParkingGrid] = useState<ParkingGrid[][]>();
  const [parkingGrid, setParkingGrid] = useState<number[][]>();

  const [parkingSlots, setParkingSlots] = useState([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  ]);

  useEffect(() => {
    console.log("%c init grid", "color: lightgreen; font-size: 25px");
    let grid: number[][] = [];
    for (let i = 0; i < numOfRows; i++) {
      grid[i] = [];
      for (let j = 0; j < numOfCols; j++) {
        grid[i][j] = i * numOfCols + j;
      }
    }
    setParkingGrid(grid);
  }, []);
  return (
    <div className="parking">
      {parkingGrid &&
        parkingGrid.map((row) =>
          row.map((slot) => (
            <ParkingSlot key={slot} parkingNo={slot}></ParkingSlot>
          ))
        )}
    </div>
  );
};

export default Parking;
