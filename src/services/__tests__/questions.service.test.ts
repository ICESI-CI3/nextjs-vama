import { questionsService } from '../questions.service';
import apiClient from '@/lib/api-client';

jest.mock('@/lib/api-client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('QuestionsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getQuestionsByTriviaId', () => {
    it('debería obtener preguntas de una trivia', async () => {
      const mockQuestions = [
        {
          question_id: 'q1',
          trivia_id: 'trivia-1',
          question_text: '¿Pregunta 1?',
          question_type: 'multiple_choice' as const,
          points_value: 10,
          order: 1,
        },
        {
          question_id: 'q2',
          trivia_id: 'trivia-1',
          question_text: '¿Pregunta 2?',
          question_type: 'true_false' as const,
          points_value: 5,
          order: 2,
        },
      ];

      mockedApiClient.get.mockResolvedValue({ data: mockQuestions });

      // Mock console.log
      jest.spyOn(console, 'log').mockImplementation();

      const result = await questionsService.getQuestionsByTriviaId('trivia-1');

      expect(mockedApiClient.get).toHaveBeenCalledWith('/trivias/trivia-1/questions');
      expect(result).toHaveLength(2);
      
      jest.restoreAllMocks();
    });
  });

  describe('getQuestionById', () => {
    it('debería obtener una pregunta por ID', async () => {
      const mockQuestion = {
        question_id: 'q1',
        trivia_id: 'trivia-1',
        question_text: '¿Pregunta de prueba?',
        question_type: 'multiple_choice' as const,
        points_value: 10,
        order: 1,
        options: [
          { option_id: 'opt1', option_text: 'Opción 1', is_correct: true, order: 1 },
          { option_id: 'opt2', option_text: 'Opción 2', is_correct: false, order: 2 },
        ],
      };

      mockedApiClient.get.mockResolvedValue({ data: mockQuestion });

      const result = await questionsService.getQuestionById('q1');

      expect(mockedApiClient.get).toHaveBeenCalledWith('/questions/q1');
      expect(result.question_text).toBe('¿Pregunta de prueba?');
    });
  });

  describe('createQuestion', () => {
    it('debería crear una nueva pregunta', async () => {
      const newQuestion = {
        trivia_id: 'trivia-1',
        question_text: '¿Nueva pregunta?',
        question_type: 'multiple_choice' as const,
        options: [
          { text: 'Respuesta A', is_correct: true },
          { text: 'Respuesta B', is_correct: false },
        ],
        correct_answer: 'Respuesta A',
        points_value: 15,
      };

      const mockResponse = {
        data: {
          question_id: 'q-new',
          ...newQuestion,
        },
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      // Mock console.log
      jest.spyOn(console, 'log').mockImplementation();

      const result = await questionsService.createQuestion(newQuestion);

      expect(mockedApiClient.post).toHaveBeenCalledWith('/questions', newQuestion);
      expect(result.question_id).toBe('q-new');
      expect(result.question_text).toBe('¿Nueva pregunta?');
      
      jest.restoreAllMocks();
    });
  });

  describe('updateQuestion', () => {
    it('debería actualizar una pregunta existente', async () => {
      const updates = {
        question_text: '¿Pregunta actualizada?',
        points_value: 20,
      };

      const mockResponse = {
        data: {
          question_id: 'q1',
          trivia_id: 'trivia-1',
          question_type: 'multiple_choice' as const,
          order: 1,
          ...updates,
        },
      };

      mockedApiClient.patch.mockResolvedValue(mockResponse);

      // Mock console.log
      jest.spyOn(console, 'log').mockImplementation();

      const result = await questionsService.updateQuestion('q1', updates);

      expect(mockedApiClient.patch).toHaveBeenCalledWith('/questions/q1', updates);
      expect(result.question_text).toBe('¿Pregunta actualizada?');
      expect(result.points_value).toBe(20);
      
      jest.restoreAllMocks();
    });
  });

  describe('deleteQuestion', () => {
    it('debería eliminar una pregunta', async () => {
      mockedApiClient.delete.mockResolvedValue({});

      await questionsService.deleteQuestion('q1');

      expect(mockedApiClient.delete).toHaveBeenCalledWith('/questions/q1');
    });
  });
});

