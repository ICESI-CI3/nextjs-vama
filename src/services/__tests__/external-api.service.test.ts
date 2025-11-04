import { externalApiService } from '../external-api.service';
import apiClient from '@/lib/api-client';

jest.mock('@/lib/api-client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('ExternalApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCategories', () => {
    it('debería obtener categorías de OpenTDB', async () => {
      const mockCategories = [
        { id: 9, name: 'General Knowledge' },
        { id: 10, name: 'Entertainment: Books' },
        { id: 11, name: 'Entertainment: Film' },
      ];

      mockedApiClient.get.mockResolvedValue({
        data: { trivia_categories: mockCategories },
      });

      const result = await externalApiService.getCategories();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/external-api/categories');
      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('General Knowledge');
    });
  });

  describe('fetchQuestions', () => {
    it('debería obtener preguntas de OpenTDB con parámetros básicos', async () => {
      const mockResponse = {
        response_code: 0,
        results: [
          {
            category: 'General Knowledge',
            type: 'multiple',
            difficulty: 'easy',
            question: 'What is the capital of France?',
            correct_answer: 'Paris',
            incorrect_answers: ['London', 'Berlin', 'Madrid'],
          },
        ],
      };

      mockedApiClient.get.mockResolvedValue({ data: mockResponse });

      const params = {
        amount: 10,
        category: 9,
        difficulty: 'easy' as const,
      };

      const result = await externalApiService.fetchQuestions(params);

      expect(mockedApiClient.get).toHaveBeenCalled();
      expect(result.results).toHaveLength(1);
      expect(result.response_code).toBe(0);
    });

    it('debería manejar respuesta sin resultados', async () => {
      const mockResponse = {
        response_code: 1,
        results: [],
      };

      mockedApiClient.get.mockResolvedValue({ data: mockResponse });

      const result = await externalApiService.fetchQuestions({ amount: 10 });

      expect(result.results).toHaveLength(0);
      expect(result.response_code).toBe(1);
    });
  });

  describe('requestToken', () => {
    it('debería solicitar token de sesión de OpenTDB', async () => {
      const mockResponse = {
        token: 'abc123xyz',
      };

      mockedApiClient.post.mockResolvedValue({ data: mockResponse });

      const result = await externalApiService.requestToken();

      expect(mockedApiClient.post).toHaveBeenCalledWith('/external-api/token/request');
      expect(result).toBe('abc123xyz');
    });
  });

  describe('resetToken', () => {
    it('debería resetear token de sesión', async () => {
      mockedApiClient.post.mockResolvedValue({ data: {} });

      await externalApiService.resetToken('old-token');

      expect(mockedApiClient.post).toHaveBeenCalledWith('/external-api/token/reset', {
        token: 'old-token',
      });
    });
  });
});

