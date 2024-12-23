import { Timestamp } from "firebase/firestore";

interface ReservationFirestore {
  userId: string;
  parkingSlotId: string;
  startTime: Timestamp;
  endTime: Timestamp;
}

export default ReservationFirestore;
