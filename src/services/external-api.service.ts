import apiClient from '@/lib/api-client';
import {
  OpenTDBCategoriesResponse,
  OpenTDBResponse,
  OpenTDBCategory,
  FetchQuestionsDto,
} from '@/types/game';

class ExternalApiService {
  /**
   * Obtener categorías de OpenTDB
   */
  async getCategories(): Promise<OpenTDBCategory[]> {
    const response = await apiClient.get('/external-api/categories');
    return response.data.trivia_categories;
  }

  /**
   * Obtener preguntas de OpenTDB
   */
  async fetchQuestions(params: FetchQuestionsDto): Promise<OpenTDBResponse> {
    // El idioma ahora se especifica en cada llamada, pero mantenemos español como fallback
    const paramsWithLang = {
      ...params,
      lang: params.lang || 'es', // 🌐 Español por defecto si no se especifica
    };
    
    const response = await apiClient.get('/external-api/questions', { params: paramsWithLang });
    return response.data;
  }

  /**
   * Solicitar token de sesión de OpenTDB
   */
  async requestToken(): Promise<string> {
    const response = await apiClient.post('/external-api/token/request');
    return response.data.token;
  }

  /**
   * Resetear token de sesión de OpenTDB
   */
  async resetToken(token: string): Promise<void> {
    await apiClient.post('/external-api/token/reset', { token });
  }
}

export const externalApiService = new ExternalApiService();

