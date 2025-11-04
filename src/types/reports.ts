export interface GeneralStats {
  totalUsers: number;
  totalTrivias: number;
  totalSessions: number;
  avgCompletionRate: number;
  avgScore: number;
}

export interface TopPlayer {
  user_id: string;
  username: string;
  profile_image?: string;
  total_score: number;
  games_played: number;
  games_completed: number;
  completion_rate: number;
  avg_score: number;
}

export interface PopularTrivia {
  trivia_id: string;
  title: string;
  category: string;
  difficulty: string;
  plays_count: number;
  completions_count: number;
  completion_rate: number;
  avg_score: number;
  created_by: string;
}

export interface ReportsData {
  generalStats: GeneralStats | null;
  topPlayers: TopPlayer[];
  popularTrivias: PopularTrivia[];
}

