import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import ParkingSlotInfo from "../../models/ParkingSlotInfo";
import { AppDispatch } from "..";
import { db } from "../../config/firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  QueryDocumentSnapshot,
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
  dateForShow: number;
}

const initialState: ParkingState = {
  parkingSlots: [],
  parkingSize: { rowNumber: 0, columnNumber: 0 },
  reservations: [],
  loading: false,
  error: null,
  dateForShow: new Date().getTime(),
};

export const fetchParking = () => async (dispatch: AppDispatch) => {
  dispatch(setLoading(true));
  try {
    const parkingRef = collection(db, "parking");

    const parkingSnapshot = await getDocs(parkingRef);

    const parking: ParkingSlotInfo[] = parkingSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<ParkingSlotInfo, "id">),
    }));
    dispatch(setParkingSlots(parking));

    dispatch(
      setParkingSize({
        rowNumber: parking.length ? parking[parking.length - 1].row + 1 : 0,
        columnNumber: parking.length
          ? parking[parking.length - 1].column + 1
          : 0,
      })
    );
    console.log("%c fetch done", "color: pink; font-size: 25px");
  } catch (error: any) {
    // dispatch(setError(error.message || "Failed to fetch parking!"));
    console.error(error);
  }
};

export const deleteParking =
  (docs: QueryDocumentSnapshot[]) => async (dispatch: AppDispatch) => {
    try {
      const batchPromises = docs.map((document) =>
        deleteDoc(doc(db, "parking", document.id))
      );
      await Promise.all(batchPromises);
    } catch (err) {
      throw new Error("Error deleting parking:" + err);
    }
  };

export const deleteReservations = () => async (dispatch: AppDispatch) => {
  try {
    const reservationsRef = collection(db, "reservations");
    const snapshot = await getDocs(reservationsRef);
    const batchPromises = snapshot.docs.map((document) =>
      deleteDoc(doc(reservationsRef, document.id))
    );
    await Promise.all(batchPromises);
  } catch (err) {
    throw new Error("Error deleting reservations:" + err);
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
    clearParkingSize: (state) => {
      state.parkingSize = {
        rowNumber: 0,
        columnNumber: 0,
      };
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
    setDateForShow: (state, action: PayloadAction<number>) => {
      state.dateForShow = action.payload;
    },
  },
});

export const {
  setParkingSlots,
  clearParkingSlots,
  setParkingSize,
  clearParkingSize,
  setReservations,
  setLoading,
  setError,
  setDateForShow,
} = parkingSlice.actions;
export default parkingSlice.reducer;
