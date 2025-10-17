import { FieldValue } from "firebase/firestore";
import EventType from "../enums/EventType";

interface EventInfo {
  id: string;
  lat: number;
  lon: number;
  title: string;
  comment: string;
  type: EventType;
  createdAt: FieldValue | number;
  likes: [];
  authorId: string;
  // new:
  invited?: string[];
  eventDate?: number | null;
}

export default EventInfo;
