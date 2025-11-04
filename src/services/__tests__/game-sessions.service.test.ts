import { gameSessionsService } from '../game-sessions.service';
import apiClient from '@/lib/api-client';

jest.mock('@/lib/api-client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('GameSessionsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createSession', () => {
    it('debería crear una nueva sesión de juego', async () => {
      const mockSession = {
        session_id: 'session-1',
        trivia_id: 'trivia-1',
        total_questions: 10,
        current_question: 1,
        status: 'in_progress' as const,
      };

      mockedApiClient.post.mockResolvedValue({
        data: { data: mockSession },
      });

      const result = await gameSessionsService.createSession({ trivia_id: 'trivia-1' });

      expect(mockedApiClient.post).toHaveBeenCalledWith('/game-sessions', { trivia_id: 'trivia-1' });
      expect(result.session_id).toBe('session-1');
    });
  });

  describe('getQuestion', () => {
    it('debería obtener una pregunta específica', async () => {
      const mockQuestion = {
        question_id: 'q1',
        question_text: '¿Pregunta de prueba?',
        question_type: 'multiple_choice' as const,
        points_value: 10,
        options: [
          { option_id: 'opt1', option_text: 'Opción 1', order: 1 },
        ],
      };

      mockedApiClient.get.mockResolvedValue({
        data: {
          data: {
            question: mockQuestion,
            question_number: 1,
          },
        },
      });

      const result = await gameSessionsService.getQuestion('session-1', 1);

      expect(mockedApiClient.get).toHaveBeenCalledWith('/game-sessions/session-1/questions/1');
      expect(result.question_id).toBe('q1');
    });
  });

  describe('submitAnswer', () => {
    it('debería enviar una respuesta', async () => {
      const answerDto = {
        question_id: 'q1',
        selected_option_id: 'opt1',
        time_taken_seconds: 10,
      };

      const mockResponse = {
        is_correct: true,
        points_earned: 10,
      };

      mockedApiClient.post.mockResolvedValue({
        data: { data: mockResponse },
      });

      const result = await gameSessionsService.submitAnswer('session-1', answerDto);

      expect(mockedApiClient.post).toHaveBeenCalledWith('/game-sessions/session-1/answer', answerDto);
      expect(result.is_correct).toBe(true);
    });
  });

  describe('completeSession', () => {
    it('debería completar una sesión', async () => {
      const mockSession = {
        session_id: 'session-1',
        status: 'completed' as const,
        total_score: 80,
      };

      mockedApiClient.put.mockResolvedValue({
        data: { data: mockSession },
      });

      const result = await gameSessionsService.completeSession('session-1');

      expect(mockedApiClient.put).toHaveBeenCalledWith('/game-sessions/session-1/complete');
      expect(result.status).toBe('completed');
    });
  });

  describe('abandonSession', () => {
    it('debería abandonar una sesión', async () => {
      mockedApiClient.put.mockResolvedValue({});

      await gameSessionsService.abandonSession('session-1');

      expect(mockedApiClient.put).toHaveBeenCalledWith('/game-sessions/session-1/abandon');
    });
  });

  describe('getInProgressSessions', () => {
    it('debería obtener sesiones en progreso', async () => {
      const mockSessions = [
        { session_id: 's1', status: 'in_progress' },
        { session_id: 's2', status: 'in_progress' },
      ];

      mockedApiClient.get.mockResolvedValue({
        data: { data: { sessions: mockSessions } },
      });

      const result = await gameSessionsService.getInProgressSessions();

      expect(result).toHaveLength(2);
      expect(result[0].status).toBe('in_progress');
    });
  });
});

