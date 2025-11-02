import apiClient from '@/lib/api-client';
import { Trivia } from '@/types/game';

class TriviasService {
  /**
   * Obtener todas las trivias publicadas
   */
  async getTrivias(filters?: {
    status?: 'published';
    difficulty_level?: 'easy' | 'medium' | 'hard';
    category_id?: string;
  }): Promise<Trivia[]> {
    const response = await apiClient.get('/trivias', { params: filters });
    return response.data;
  }

  /**
   * Obtener una trivia por ID
   */
  async getTriviaById(id: string): Promise<Trivia> {
    const response = await apiClient.get(`/trivias/${id}`);
    return response.data;
  }

  /**
   * Crear una nueva trivia (para trivias temporales de OpenTDB)
   */
  async createTrivia(triviaData: {
    title: string;
    category_id: string;
    difficulty_level: 'easy' | 'medium' | 'hard';
    status?: 'published' | 'draft';
    is_public?: boolean;
    time_limit_seconds?: number;
  }): Promise<Trivia> {
    const response = await apiClient.post('/trivias', triviaData);
    return response.data;
  }
}

export const triviasService = new TriviasService();

