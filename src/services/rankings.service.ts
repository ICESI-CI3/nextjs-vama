import apiClient from '@/lib/api-client';
import { Ranking, UserRanking } from '@/types/ranking';

class RankingsService {
 
  async getGlobalRanking(): Promise<Ranking[]> {
    const response = await apiClient.get('/rankings/global');
    return response.data;
  }

  async getCategoryRanking(categoryId: string, page = 1, limit = 20): Promise<Ranking[]> {
    const response = await apiClient.get(`/rankings/category/${categoryId}`, {
    params: { page, limit },
    });

    return response.data?.data?.top_players || [];
  }

  async getUserRanking(userId: string): Promise<UserRanking> {
    const response = await apiClient.get(`/rankings/user/${userId}`);
    return response.data;
  }
}

export const rankingsService = new RankingsService();
