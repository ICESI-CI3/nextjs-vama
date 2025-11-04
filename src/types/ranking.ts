export interface Ranking {
  id: string;
  name: string;
  total_score: number;
  profile_image?: string | null;
  rank: number;
}

export interface UserRanking {
  id: string;
  name: string;
  total_score: number;
  profile_image?: string | null;
  rank: number;
  category?: string;
}
