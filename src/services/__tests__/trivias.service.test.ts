import { triviasService } from '../trivias.service';
import apiClient from '@/lib/api-client';

jest.mock('@/lib/api-client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('TriviasService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTrivias', () => {
    it('debería obtener todas las trivias', async () => {
      const mockTrivias = [
        { id: '1', title: 'Trivia 1', status: 'published' },
        { id: '2', title: 'Trivia 2', status: 'published' },
      ];

      mockedApiClient.get.mockResolvedValue({ data: mockTrivias });

      const result = await triviasService.getTrivias();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/trivias', { params: undefined });
      expect(result).toEqual(mockTrivias);
    });

    it('debería aplicar filtros correctamente', async () => {
      mockedApiClient.get.mockResolvedValue({ data: [] });

      await triviasService.getTrivias({ status: 'draft', difficulty_level: 'easy' });

      expect(mockedApiClient.get).toHaveBeenCalledWith('/trivias', {
        params: { status: 'draft', difficulty_level: 'easy' },
      });
    });
  });

  describe('createTrivia', () => {
    it('debería crear una nueva trivia', async () => {
      const newTrivia = {
        title: 'Nueva Trivia',
        category_id: 'cat-1',
        difficulty_level: 'medium' as const,
      };

      const mockResponse = {
        data: { id: 'trivia-1', ...newTrivia },
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      const result = await triviasService.createTrivia(newTrivia);

      expect(mockedApiClient.post).toHaveBeenCalledWith('/trivias', newTrivia);
      expect(result.id).toBe('trivia-1');
    });
  });

  describe('updateTrivia', () => {
    it('debería actualizar una trivia existente', async () => {
      const updates = { title: 'Título Actualizado' };
      const mockResponse = {
        data: { id: '1', ...updates },
      };

      mockedApiClient.patch.mockResolvedValue(mockResponse);

      const result = await triviasService.updateTrivia('1', updates);

      expect(mockedApiClient.patch).toHaveBeenCalledWith('/trivias/1', updates);
      expect(result.title).toBe('Título Actualizado');
    });
  });

  describe('deleteTrivia', () => {
    it('debería eliminar una trivia', async () => {
      mockedApiClient.delete.mockResolvedValue({});

      await triviasService.deleteTrivia('trivia-1');

      expect(mockedApiClient.delete).toHaveBeenCalledWith('/trivias/trivia-1');
    });
  });

  describe('publishTrivia', () => {
    it('debería publicar una trivia', async () => {
      const mockResponse = {
        data: { id: '1', status: 'published' },
      };

      mockedApiClient.patch.mockResolvedValue(mockResponse);

      const result = await triviasService.publishTrivia('1');

      expect(result.status).toBe('published');
    });
  });

  describe('getMyTrivias', () => {
    it('debería obtener mis trivias', async () => {
      const mockTrivias = [
        { id: '1', title: 'Mi Trivia' },
      ];

      mockedApiClient.get.mockResolvedValue({ data: { data: mockTrivias } });

      const result = await triviasService.getMyTrivias();

      expect(result).toEqual(mockTrivias);
    });
  });
});

