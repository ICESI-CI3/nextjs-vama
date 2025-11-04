import apiClient from '@/lib/api-client';

function formatDate(date: Date) {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

export async function getGeneralStats() {
  const today = new Date();
  const start_date = `${today.getFullYear()}-01-01`;
  const end_date = formatDate(today); 


  const res = await apiClient.get('/reports/general-stats', {
    params: { start_date, end_date },
  });
  return res.data.data; 
}

export async function getTopPlayers(limit = 10) {
  const today = new Date();
  const start_date = `${today.getFullYear()}-01-01`;
  const end_date = formatDate(today); 

  const res = await apiClient.get('/reports/top-players', {
    params: { start_date, end_date, limit },
  });
  return res.data.data; 
}

export async function getPopularTrivias(limit = 10) {
  const today = new Date();
  const start_date = `${today.getFullYear()}-01-01`;
  const end_date = formatDate(today); 

  const res = await apiClient.get('/reports/popular-trivias', {
    params: { start_date, end_date, limit },
  });
  return res.data.data; 
}
