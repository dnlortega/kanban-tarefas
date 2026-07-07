export interface Track {
  id: string;
  youtubeId: string;
  title: string;
  channel: string | null;
  thumbnail: string | null;
  genre: string | null;
  requestedBy: string | null;
  status: string;
  order: number;
  createdAt: string;
}

export interface YoutubeSearchResultWithBlock {
  videoId: string;
  title: string;
  channel: string;
  thumbnail: string;
  genre?: string;
  blocked: boolean;
}
