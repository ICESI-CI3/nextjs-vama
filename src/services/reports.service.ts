import apiClient from '@/lib/api-client';
import { GeneralStats, TopPlayer, PopularTrivia } from '@/types/reports';

function formatDate(date: Date) {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

// Devuelve datos tipados de GeneralStats
export async function getGeneralStats(): Promise<GeneralStats> {
  const res = await apiClient.get<{ data: GeneralStats }>('/reports/general-stats');
  return res.data.data;
}

// Devuelve un array tipado de TopPlayer
export async function getTopPlayers(limit?: number) {
  const res = await apiClient.get('/reports/top-players', {
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
