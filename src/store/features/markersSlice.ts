import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import MarkerInfo from "../../models/MarkerInfo";

interface MarkersState {
  markers: MarkerInfo[];
}

const initialState: MarkersState = {
  markers: [],
};

const markersSlice = createSlice({
  name: "markers",
  initialState,
  reducers: {
    setMarkers: (state, action: PayloadAction<MarkerInfo[]>) => {
      state.markers = action.payload;
    },
  },
});

export const { setMarkers } = markersSlice.actions;
export default markersSlice.reducer;
