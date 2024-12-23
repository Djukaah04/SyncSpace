import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import ParkingSlotInfo from "../../models/ParkingSlotInfo";
import { AppDispatch } from "..";
import { db } from "../../config/firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  Timestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import ReservationInfo from "../../models/ReservationInfo";
import ParkingStatus from "../../enums/ParkingStatus";

export interface ParkingSize {
  rowNumber: number;
  columnNumber: number;
}

interface ParkingState {
  parkingSlots: ParkingSlotInfo[];
  parkingSize: ParkingSize;
  reservations: ReservationInfo[];
  loading: boolean;
  error: string | null;
}

const initialState: ParkingState = {
  parkingSlots: [],
  parkingSize: { rowNumber: 0, columnNumber: 0 },
  reservations: [],
  loading: false,
  error: null,
};

export const fetchParking = () => async (dispatch: AppDispatch) => {
  console.log("%c fetch", "color: lightgreen; font-size: 25px");
  dispatch(setLoading(true));
  try {
    const parkingRef = collection(db, "parking");
    const reservationsRef = collection(db, "reservations");

    const currentTime = Timestamp.now();
    const takenReservationsQuery = query(
      reservationsRef,
      where("startTime", "<=", currentTime),
      where("endTime", ">=", currentTime)
    );

    const parkingSnapshot = await getDocs(parkingRef);
    const reservationsSnapshot = await getDocs(reservationsRef);
    const takenReservationsSnapshot = await getDocs(takenReservationsQuery);

    const takenIds = [
      ...new Set(
        takenReservationsSnapshot.docs.map((doc) => doc.data().parkingSlotId)
      ),
    ];
    console.log("%c takenIds", "color: orange; font-size: 25px", takenIds);

    const parking: ParkingSlotInfo[] = parkingSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<ParkingSlotInfo, "id">),
      status: takenIds.includes(doc.id)
        ? ParkingStatus.RESERVED
        : ParkingStatus.FREE,
    }));
    const batch = writeBatch(db);
    parking.forEach((slot) => {
      const slotRef = doc(parkingRef, slot.id);
      batch.set(slotRef, slot);
    });
    try {
      await batch.commit();
    } catch (error) {
      console.error("Error with BATCH!", error);
    }
    const reservations: ReservationInfo[] = reservationsSnapshot.docs.map(
      (doc) => ({
        ...(doc.data() as ReservationInfo),
        id: doc.id,
        startTime: doc.data().startTime.toDate().getTime(),
        endTime: doc.data().endTime.toDate().getTime(),
      })
    );
    dispatch(setParkingSlots(parking));
    dispatch(setReservations(reservations));

    dispatch(
      setParkingSize({
        rowNumber: parking.length ? parking[parking.length - 1].row + 1 : 0,
        columnNumber: parking.length
          ? parking[parking.length - 1].column + 1
          : 0,
      })
    );
  } catch (error: any) {
    // dispatch(setError(error.message || "Failed to fetch parking!"));
    console.error(error);
  }
};

const parkingSlice = createSlice({
  name: "parking",
  initialState,
  reducers: {
    setParkingSlots: (state, action: PayloadAction<ParkingSlotInfo[]>) => {
      state.parkingSlots = action.payload;
      state.loading = false;
      state.error = null;
    },
    updateSlotStatus: (
      state,
      action: PayloadAction<{ id: string; status: ParkingStatus }>
    ) => {
      const { id, status } = action.payload;

      const slot = state.parkingSlots.find((slot) => slot.id === id);
      if (slot) {
        slot.status = status;
      }
    },
    clearParkingSlots: (state) => {
      state.parkingSlots = [];
    },
    setParkingSize: (state, action: PayloadAction<ParkingSize>) => {
      state.parkingSize = action.payload;
    },
    setReservations: (state, action: PayloadAction<ReservationInfo[]>) => {
      state.reservations = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setParkingSlots,
  clearParkingSlots,
  setParkingSize,
  setReservations,
  setLoading,
  setError,
} = parkingSlice.actions;
export default parkingSlice.reducer;
