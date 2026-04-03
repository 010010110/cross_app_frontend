export interface Checkin {
  _id: string;
  userId: string;
  boxId: string;
  classId: string;
  latitude: number;
  longitude: number;
  distanceFromBoxInMeters: number;
  createdAt: string;
}

export interface FeedUploadResponse {
  url: string;
  filename: string;
  message: string;
}

export interface CreateFeedPostDto {
  checkinId: string;
  text: string;
  photoUrl?: string;
}

export interface CreateFeedPostResponse {
  postId: string;
  checkinId: string;
  message: string;
}

export type FeedPostSource = "MANUAL" | "PR_AUTO";

export interface FeedListItem {
  _id: string;
  userId: string;
  boxId: string;
  checkinId: string;
  resultId?: string;
  text: string;
  photoUrl: string | null;
  source: FeedPostSource;
  authorName: string | null;
  boxName: string | null;
  createdAt: string;
}
