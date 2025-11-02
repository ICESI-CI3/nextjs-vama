import apiClient from '@/lib/api-client';
import {
  GameSession,
  CreateGameSessionDto,
  SubmitAnswerDto,
  AnswerResponse,
  Question,
} from '@/types/game';

class GameSessionsService {
  /**
   * Crear una nueva sesión de juego
   */
  async createSession(dto: CreateGameSessionDto): Promise<GameSession> {
    const response = await apiClient.post('/game-sessions', dto);
    return response.data.data;
  }

  /**
   * Obtener sesión actual en progreso
   */
  async getCurrentSession(): Promise<GameSession> {
    const response = await apiClient.get('/game-sessions/current');
    return response.data.data;
  }

  /**
   * Obtener una pregunta específica por número
   */
  async getQuestion(sessionId: string, questionNumber: number): Promise<Question> {
    const response = await apiClient.get(
      `/game-sessions/${sessionId}/questions/${questionNumber}`
    );
    // El backend devuelve { success: true, data: { question: {...}, ... } }
    // Necesitamos extraer solo la pregunta y ajustar la estructura
    const backendData = response.data.data;
    if (backendData.question) {
      // Mapear la estructura del backend a nuestro tipo Question
      return {
        question_id: backendData.question.question_id,
        order: backendData.question_number,
        question_text: backendData.question.question_text,
        question_type: backendData.question.question_type,
        points_value: backendData.question.points_value,
        options: backendData.question.options || [],
      };
    }
    // Si no está en el formato esperado, intentar retornar directamente
    return response.data.data.question || response.data;
  }

  /**
   * Enviar respuesta a una pregunta
   */
  async submitAnswer(
    sessionId: string,
    dto: SubmitAnswerDto
  ): Promise<AnswerResponse> {
    const response = await apiClient.post(`/game-sessions/${sessionId}/answer`, dto);
    return response.data.data;
  }

  /**
   * Abandonar sesión
   */
  async abandonSession(sessionId: string): Promise<void> {
    await apiClient.put(`/game-sessions/${sessionId}/abandon`);
  }

  /**
   * Completar sesión
   */
  async completeSession(sessionId: string): Promise<GameSession> {
    const response = await apiClient.put(`/game-sessions/${sessionId}/complete`);
    return response.data.data;
  }

  /**
   * Obtener historial de sesiones
   */
  async getHistory(params?: {
    page?: number;
    limit?: number;
    status?: 'in_progress' | 'completed' | 'abandoned';
    trivia_id?: string;
  }): Promise<any> {
    const response = await apiClient.get('/game-sessions/history', { params });
    return response.data.data;
  }
}

export const gameSessionsService = new GameSessionsService();

