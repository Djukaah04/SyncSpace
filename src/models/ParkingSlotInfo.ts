import ParkingStatus from "../enums/ParkingStatus";

interface ParkingSlotInfo {
  id: string;
  row: number;
  column: number;
  status: ParkingStatus;
}

export default ParkingSlotInfo;
