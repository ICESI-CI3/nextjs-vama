import apiClient from '@/lib/api-client';
import { Trivia } from '@/types/game';

export interface CreateTriviaDto {
  title: string;
  category_id: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
  status?: 'published' | 'draft' | 'archived';
  is_public?: boolean;
  time_limit_seconds?: number;
}

export interface UpdateTriviaDto {
  title?: string;
  category_id?: string;
  difficulty_level?: 'easy' | 'medium' | 'hard';
  status?: 'published' | 'draft' | 'archived';
  is_public?: boolean;
  time_limit_seconds?: number;
}

class TriviasService {
  /**
   * Obtener todas las trivias publicadas
   */
  async getTrivias(filters?: {
    status?: 'published' | 'draft' | 'archived';
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
    try {
      // Intentar primero con el endpoint estándar
      const response = await apiClient.get(`/trivias/${id}`);
      // El backend puede devolver { data: trivia } o directamente trivia
      const trivia = response.data.data || response.data;
      console.log('Trivia obtenida por ID (endpoint estándar):', trivia);
      return trivia;
    } catch (error: any) {
      console.warn('Endpoint /trivias/:id no disponible, intentando con /trivias/my-trivias');
      
      // Si falla, intentar obtener de mis trivias
      try {
        const myTrivias = await this.getMyTrivias();
        const trivia = myTrivias.find((t) => t.id === id);
        
        if (trivia) {
          console.log('Trivia encontrada en my-trivias:', trivia);
          return trivia;
        }
        
        // Si no se encuentra en my-trivias, buscar en todas las trivias
        console.warn('Trivia no encontrada en my-trivias, buscando en todas las trivias');
        const allTrivias = await apiClient.get('/trivias');
        const allTriviasData = allTrivias.data.data || allTrivias.data;
        const foundTrivia = Array.isArray(allTriviasData) 
          ? allTriviasData.find((t: Trivia) => t.id === id)
          : null;
        
        if (foundTrivia) {
          console.log('Trivia encontrada en todas las trivias:', foundTrivia);
          return foundTrivia;
        }
        
        throw new Error('Trivia no encontrada');
      } catch (fallbackError) {
        console.error('Error en todos los intentos de obtener trivia:', fallbackError);
        throw error; // Lanzar el error original
      }
    }
  }

  /**
   * Obtener mis trivias creadas
   */
  async getMyTrivias(): Promise<Trivia[]> {
    try {
      // Intentar primero con el endpoint específico
      const response = await apiClient.get('/trivias/my-trivias');
      const data = response.data.data || response.data;
      console.log('✅ Mis trivias obtenidas:', Array.isArray(data) ? data.length : 0);
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      console.warn('⚠️ Endpoint /trivias/my-trivias no disponible, usando fallback');
      
      // Si no existe ese endpoint, obtener todas las trivias del usuario
      // El backend filtrará por el usuario autenticado
      try {
        const response = await apiClient.get('/trivias');
        const data = response.data.data || response.data;
        const trivias = Array.isArray(data) ? data : [];
        console.log('✅ Trivias obtenidas desde fallback:', trivias.length);
        return trivias;
      } catch (fallbackError) {
        console.error('❌ Error en todos los intentos de obtener trivias');
        return [];
      }
    }
  }

  /**
   * Crear una nueva trivia
   */
  async createTrivia(triviaData: CreateTriviaDto): Promise<Trivia> {
    const response = await apiClient.post('/trivias', triviaData);
    // El backend puede devolver { data: trivia } o directamente trivia
    const trivia = response.data.data || response.data;
    console.log('Trivia creada:', trivia);
    return trivia;
  }

  /**
   * Actualizar una trivia existente
   */
  async updateTrivia(id: string, triviaData: UpdateTriviaDto): Promise<Trivia> {
    const response = await apiClient.patch(`/trivias/${id}`, triviaData);
    return response.data;
  }

  /**
   * Eliminar una trivia
   */
  async deleteTrivia(id: string): Promise<void> {
    await apiClient.delete(`/trivias/${id}`);
  }

  /**
   * Publicar una trivia (cambiar status a published)
   */
  async publishTrivia(id: string): Promise<Trivia> {
    try {
      // Intentar primero con el endpoint específico
      const response = await apiClient.patch(`/trivias/${id}/publish`);
      return response.data;
    } catch (error: any) {
      // Si no existe, actualizar directamente el status
      if (error.response?.status === 404 || error.response?.status === 405) {
        return this.updateTrivia(id, { status: 'published' });
      }
      throw error;
    }
  }

  /**
   * Archivar una trivia
   */
  async archiveTrivia(id: string): Promise<Trivia> {
    try {
      // Intentar primero con el endpoint específico
      const response = await apiClient.patch(`/trivias/${id}/archive`);
      return response.data;
    } catch (error: any) {
      // Si no existe, actualizar directamente el status
      if (error.response?.status === 404 || error.response?.status === 405) {
        return this.updateTrivia(id, { status: 'archived' });
      }
      throw error;
    }
  }

  /**
   * Obtener estadísticas de una trivia
   */
  async getTriviaStats(id: string): Promise<{
    plays_count: number;
    completions_count: number;
    avg_score: number;
    completion_rate: number;
  }> {
    const response = await apiClient.get(`/trivias/${id}/stats`);
    return response.data;
  }
}

export const triviasService = new TriviasService();

