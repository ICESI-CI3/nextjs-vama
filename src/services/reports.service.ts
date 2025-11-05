import apiClient from '@/lib/api-client';
import { GeneralStats, TopPlayer, PopularTrivia } from '@/types/reports';

function formatDate(date: Date) {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

// Tipo para la respuesta del backend (snake_case)
interface GeneralStatsResponse {
  total_users: number;
  total_trivias: number;
  total_sessions: number;
  completed_sessions?: number;
  avg_score?: number;
}

// Devuelve datos tipados de GeneralStats
export async function getGeneralStats(): Promise<GeneralStats> {
  const res = await apiClient.get<{ data: GeneralStatsResponse }>('/reports/general-stats');
  const data = res.data.data;
  
  // Transformar de snake_case a camelCase
  return {
    totalUsers: data.total_users ?? 0,
    totalTrivias: data.total_trivias ?? 0,
    totalSessions: data.total_sessions ?? 0,
    avgScore: data.avg_score ?? 0,
    avgCompletionRate: data.completed_sessions && data.total_sessions
      ? (data.completed_sessions / data.total_sessions) * 100
      : 0,
  };
}

// Devuelve un array tipado de TopPlayer
export async function getTopPlayers(limit?: number): Promise<TopPlayer[]> {
  const res = await apiClient.get<{ data: TopPlayer[] }>('/reports/top-players', {
    params: { limit: limit ?? 0 }, // 0 o undefined para que el backend devuelva todos
  });
  return res.data.data;
}


// Devuelve un array tipado de PopularTrivia
export async function getPopularTrivias(limit = 10): Promise<PopularTrivia[]> {
  const today = new Date();
  const start_date = `${today.getFullYear()}-01-01`;
  const end_date = formatDate(today);

  const res = await apiClient.get<{ data: PopularTrivia[] }>('/reports/popular-trivias', {
    params: { start_date, end_date, limit },
  });

  return res.data.data;
}
