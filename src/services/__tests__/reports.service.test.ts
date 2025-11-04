import { getGeneralStats, getTopPlayers, getPopularTrivias } from '../reports.service';
import apiClient from '@/lib/api-client';

jest.mock('@/lib/api-client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('ReportsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getGeneralStats', () => {
    it('debería obtener estadísticas generales', async () => {
      const mockStats = {
        total_users: 100,
        total_trivias: 50,
        total_sessions: 500,
        completed_sessions: 400,
      };

      mockedApiClient.get.mockResolvedValue({ data: { data: mockStats } });

      const result = await getGeneralStats();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/reports/general-stats');
      expect(result.total_users).toBe(100);
    });
  });

  describe('getTopPlayers', () => {
    it('debería obtener los mejores jugadores', async () => {
      const mockPlayers = [
        {
          user_id: '1',
          username: 'TopPlayer',
          total_score: 1000,
          games_played: 50,
          games_completed: 45,
          avg_score: 20,
          completion_rate: 90,
        },
      ];

      mockedApiClient.get.mockResolvedValue({ data: { data: mockPlayers } });

      const result = await getTopPlayers(10);

      expect(mockedApiClient.get).toHaveBeenCalledWith('/reports/top-players', {
        params: { limit: 10 },
      });
      expect(result[0].username).toBe('TopPlayer');
    });
  });

  describe('getPopularTrivias', () => {
    it('debería obtener las trivias más populares', async () => {
      const mockTrivias = [
        {
          trivia_id: 't1',
          title: 'Popular Trivia',
          plays_count: 100,
          completions_count: 80,
          avg_score: 85,
          completion_rate: 80,
          category: 'Science',
          difficulty: 'medium',
          created_by: 'user-1',
        },
      ];

      mockedApiClient.get.mockResolvedValue({ data: { data: mockTrivias } });

      const result = await getPopularTrivias(5);

      // El servicio agrega start_date y end_date automáticamente
      expect(mockedApiClient.get).toHaveBeenCalled();
      expect(result[0].title).toBe('Popular Trivia');
    });
  });
});

