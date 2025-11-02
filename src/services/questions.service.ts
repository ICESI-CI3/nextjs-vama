import apiClient from '@/lib/api-client';

export interface CreateQuestionDto {
  trivia_id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false';
  options: { text: string; is_correct: boolean }[];
  correct_answer: string;
  points_value?: number;
}

class QuestionsService {
  /**
   * Crear una pregunta
   */
  async createQuestion(dto: CreateQuestionDto): Promise<any> {
    const response = await apiClient.post('/questions', dto);
    return response.data;
  }

  /**
   * Crear múltiples preguntas
   */
  async createQuestions(questions: CreateQuestionDto[]): Promise<any[]> {
    const promises = questions.map((q) => this.createQuestion(q));
    return Promise.all(promises);
  }
}

export const questionsService = new QuestionsService();

