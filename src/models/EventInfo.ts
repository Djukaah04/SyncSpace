import { FieldValue } from "firebase/firestore";
import MarkerType from "../enums/MarkerType";

interface EventInfo {
  id: string;
  lat: number;
  lon: number;
  title: string;
  comment: string;
  type: MarkerType;
  createdAt: FieldValue | number;
  likes: [];
  authorId: string;
  // new:
  invited?: string[]; // list of user IDs
  eventDate?: number | null; // milliseconds since epoch
}

export default EventInfo;
