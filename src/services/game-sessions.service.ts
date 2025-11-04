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
    console.log('🎮 Creando sesión de juego para trivia:', dto.trivia_id);
    const response = await apiClient.post('/game-sessions', dto);
    const session = response.data.data;
    
    console.log('📊 Sesión creada:', {
      session_id: session.session_id,
      trivia_id: session.trivia_id,
      total_questions: session.total_questions,
      current_question: session.current_question,
    });
    
    // ADVERTENCIA: Si el backend devuelve más preguntas de las que realmente existen
    if (session.total_questions > 20) {
      console.warn(`⚠️ ADVERTENCIA: El backend dice que hay ${session.total_questions} preguntas. Esto parece incorrecto.`);
    }
    
    return session;
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
    console.log(`❓ Obteniendo pregunta ${questionNumber} para sesión ${sessionId}`);
    
    const response = await apiClient.get(
      `/game-sessions/${sessionId}/questions/${questionNumber}`
    );
    // El backend devuelve { success: true, data: { question: {...}, ... } }
    // Necesitamos extraer solo la pregunta y ajustar la estructura
    const backendData = response.data.data;
    if (backendData.question) {
      const question = {
        question_id: backendData.question.question_id,
        order: backendData.question_number,
        question_text: backendData.question.question_text,
        question_type: backendData.question.question_type,
        points_value: backendData.question.points_value,
        options: backendData.question.options || [],
      };
      
      console.log(`✅ Pregunta ${questionNumber} obtenida:`, {
        question_id: question.question_id,
        question_text: question.question_text.substring(0, 50) + '...',
        options_count: question.options.length,
      });
      
      return question;
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

  /**
   * Obtener todas las sesiones en progreso del usuario
   */
  async getInProgressSessions(): Promise<GameSession[]> {
    const response = await apiClient.get('/game-sessions/history', {
      params: { status: 'in_progress', limit: 100 },
    });
    return response.data.data.sessions || [];
  }

  /**
   * Obtener detalles de una sesión específica por ID
   */
  async getSessionById(sessionId: string): Promise<any> {
    const response = await apiClient.get(`/game-sessions/${sessionId}`);
    return response.data.data;
  }
}

export const gameSessionsService = new GameSessionsService();

