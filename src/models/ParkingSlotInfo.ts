import ParkingStatus from "../enums/ParkingStatus";

interface ParkingSlotInfo {
  id: string;
  number: string;
  row: number;
  column: number;
  status: ParkingStatus;
  userId?: string;
}

export default ParkingSlotInfo;
