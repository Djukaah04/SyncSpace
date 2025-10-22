import { FieldValue } from "firebase/firestore";
import EventType from "../enums/EventType";
import UserInfo from "./UserInfo";

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
  invited: UserInfo[];
  eventDate?: number | null;
}

export default EventInfo;
