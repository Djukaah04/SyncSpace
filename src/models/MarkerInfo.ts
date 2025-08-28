import { FieldValue } from "firebase/firestore";
import MarkerType from "../enums/MarkerType";

interface MarkerInfo {
  id: number;
  lat: number;
  lon: number;
  title: string;
  comment: string;
  type: MarkerType;
  createdAt: FieldValue | number;
  likes: [];
  authorId: string;
}

export default MarkerInfo;
