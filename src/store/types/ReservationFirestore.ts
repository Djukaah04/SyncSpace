interface ReservationFirestore {
  userId: string;
  parkingSlotId: string;
  startTime: number;
  endTime: number;
}

export default ReservationFirestore;
