import { rankingsService } from '../rankings.service';
import apiClient from '@/lib/api-client';

jest.mock('@/lib/api-client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('RankingsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getGlobalRanking', () => {
    it('debería obtener el ranking global', async () => {
      const mockRanking = [
        { user_id: '1', username: 'Player1', total_score: 1000, position: 1 },
        { user_id: '2', username: 'Player2', total_score: 800, position: 2 },
      ];

      mockedApiClient.get.mockResolvedValue({ data: mockRanking });

      const result = await rankingsService.getGlobalRanking();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/rankings/global');
      expect(result).toEqual(mockRanking);
    });
  });

  describe('getCategoryRanking', () => {
    it('debería obtener ranking por categoría', async () => {
      const mockRanking = [
        { user_id: '1', username: 'Player1', total_score: 500 },
      ];

      mockedApiClient.get.mockResolvedValue({ data: { data: { top_players: mockRanking } } });

      const result = await rankingsService.getCategoryRanking('cat-1');

      expect(mockedApiClient.get).toHaveBeenCalledWith('/rankings/category/cat-1', {
        params: { page: 1, limit: 20 },
      });
      expect(result).toEqual(mockRanking);
    });
  });

  describe('getUserRanking', () => {
    it('debería obtener el ranking de un usuario', async () => {
      const mockUserRanking = {
        user_id: 'user-1',
        position: 5,
        total_score: 750,
      };

      mockedApiClient.get.mockResolvedValue({ data: mockUserRanking });

      const result = await rankingsService.getUserRanking('user-1');

      expect(mockedApiClient.get).toHaveBeenCalledWith('/rankings/user/user-1');
      expect(result.position).toBe(5);
    });
  });
});

