import apiClient from '@/lib/api-client';
import { Question } from '@/types/game';

export interface CreateQuestionDto {
  trivia_id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false';
  options: { text: string; is_correct: boolean }[];
  correct_answer: string;
  points_value?: number;
}

export interface UpdateQuestionDto {
  question_text?: string;
  question_type?: 'multiple_choice' | 'true_false';
  options?: { text: string; is_correct: boolean }[];
  correct_answer?: string;
  points_value?: number;
}

class QuestionsService {
  /**
   * Obtener preguntas de una trivia
   */
  async getQuestionsByTriviaId(triviaId: string): Promise<Question[]> {
    try {
      const response = await apiClient.get(`/trivias/${triviaId}/questions`);
      // El backend puede devolver { data: questions } o directamente questions
      let questions = response.data.data || response.data;
      let questionsArray = Array.isArray(questions) ? questions : [];
      
      // Normalizar cada pregunta
      questionsArray = questionsArray.map((q: any) => {
        // Normalizar question_id
        const normalized: any = {
          ...q,
          question_id: q.question_id || q.id,
        };
        
      // Normalizar opciones si existen
      if (normalized.options && Array.isArray(normalized.options)) {
        normalized.options = normalized.options.map((opt: any, index: number) => ({
          option_id: opt.option_id || opt.id || `${normalized.question_id}-opt-${index}`,
          option_text: opt.option_text || opt.text || '',
          order: opt.order || index,
        }));
      }
        
        return normalized;
      });
      
      console.log(`✅ Preguntas obtenidas para trivia ${triviaId}:`, questionsArray.length);
      return questionsArray;
    } catch (error: any) {
      const status = error.response?.status;
      
      // Si la trivia es nueva, no tiene preguntas, o el endpoint no está implementado
      if (status === 404 || status === 500 || status === 400) {
        console.warn(`⚠️ Endpoint de preguntas no disponible (${status}), devolviendo array vacío`);
        return [];
      }
      
      // Para otros errores, también devolver array vacío en lugar de fallar
      console.error('❌ Error obteniendo preguntas, devolviendo array vacío:', error.message);
      return [];
    }
  }

  /**
   * Obtener una pregunta por ID
   */
  async getQuestionById(questionId: string): Promise<Question> {
    const response = await apiClient.get(`/questions/${questionId}`);
    return response.data;
  }

  /**
   * Crear una pregunta
   */
  async createQuestion(dto: CreateQuestionDto): Promise<Question> {
    try {
      console.log('📤 Enviando pregunta al backend:', dto);
      const response = await apiClient.post('/questions', dto);
      console.log('📥 Respuesta completa del backend:', JSON.stringify(response.data, null, 2));
      
      // El backend puede devolver { data: question } o directamente question
      let question = response.data.data || response.data;
      
      // Normalizar el formato: el backend puede usar 'id' en lugar de 'question_id'
      if (question && question.id && !question.question_id) {
        console.log('⚙️ Normalizando respuesta: renombrando id -> question_id');
        question = {
          ...question,
          question_id: question.id,
        };
      }
      
      // Normalizar opciones si existen
      if (question && question.options && Array.isArray(question.options)) {
        console.log('⚙️ Normalizando opciones de la pregunta...');
        question.options = question.options.map((opt: any, index: number) => ({
          option_id: opt.option_id || opt.id || `${question.id || question.question_id}-opt-${index}`,
          option_text: opt.option_text || opt.text || '',
          order: opt.order || index,
        }));
        console.log('✅ Opciones normalizadas:', question.options.map((o: any) => o.option_id));
      }
      
      // Validar que recibimos una pregunta válida
      if (!question || (!question.question_id && !question.id)) {
        console.error('❌ Respuesta inválida del backend:', question);
        throw new Error('La pregunta no se creó correctamente - respuesta inválida del servidor');
      }
      
      console.log('✅ Pregunta creada exitosamente:', question.question_id || question.id);
      return question;
    } catch (error: any) {
      console.error('❌ Error creando pregunta:', error);
      console.error('Detalles del error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  }

  /**
   * Crear múltiples preguntas
   */
  async createQuestions(questions: CreateQuestionDto[]): Promise<Question[]> {
    const promises = questions.map((q) => this.createQuestion(q));
    return Promise.all(promises);
  }

  /**
   * Actualizar una pregunta
   */
  async updateQuestion(questionId: string, dto: UpdateQuestionDto): Promise<Question> {
    try {
      console.log('📤 Actualizando pregunta en backend:', questionId, dto);
      const response = await apiClient.patch(`/questions/${questionId}`, dto);
      console.log('📥 Respuesta completa de actualización:', JSON.stringify(response.data, null, 2));
      
      // El backend puede devolver { data: question } o directamente question
      let question = response.data.data || response.data;
      
      // Normalizar el formato: el backend puede usar 'id' en lugar de 'question_id'
      if (question && question.id && !question.question_id) {
        console.log('⚙️ Normalizando respuesta: renombrando id -> question_id');
        question = {
          ...question,
          question_id: question.id,
        };
      }
      
      // Normalizar opciones si existen
      if (question && question.options && Array.isArray(question.options)) {
        console.log('⚙️ Normalizando opciones de la pregunta...');
        question.options = question.options.map((opt: any, index: number) => ({
          option_id: opt.option_id || opt.id || `${question.id || question.question_id}-opt-${index}`,
          option_text: opt.option_text || opt.text || '',
          order: opt.order || index,
        }));
        console.log('✅ Opciones normalizadas:', question.options.map((o: any) => o.option_id));
      }
      
      // Validar que recibimos una pregunta válida
      if (!question || (!question.question_id && !question.id)) {
        console.error('❌ Respuesta inválida del backend al actualizar:', question);
        throw new Error('La pregunta no se actualizó correctamente - respuesta inválida del servidor');
      }
      
      console.log('✅ Pregunta actualizada exitosamente:', question.question_id || question.id);
      return question;
    } catch (error: any) {
      console.error('❌ Error actualizando pregunta:', error);
      console.error('Detalles del error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  }

  /**
   * Eliminar una pregunta
   */
  async deleteQuestion(questionId: string): Promise<void> {
    await apiClient.delete(`/questions/${questionId}`);
  }
}

export const questionsService = new QuestionsService();

