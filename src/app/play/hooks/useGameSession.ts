'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { gameSessionsService } from '@/services/game-sessions.service';
import { GameSession, Question, AnswerResponse } from '@/types/game';
import { decodeHtmlEntities } from '@/lib/html-decoder';
import { decodeQuestion } from '../utils/questionHelpers';
import { completeSessionWithRetry } from '../utils/sessionHelpers';

export type GameStep = 'type-selection' | 'game-type' | 'playing' | 'completed' | 'session-dialog' | 'in-progress-sessions';

export function useGameSession(refreshUser: () => Promise<void>, userId?: string) {
  const router = useRouter();
  const [step, setStep] = useState<GameStep>('type-selection');
  const [gameType, setGameType] = useState<'own' | 'opentdb'>('own');
  const [session, setSession] = useState<GameSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [timeSpent, setTimeSpent] = useState(0);
  const [lastAnswer, setLastAnswer] = useState<AnswerResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeSession, setActiveSession] = useState<GameSession | null>(null);

  // Verificar si hay sesión activa al montar
  useEffect(() => {
    checkActiveSession();
  }, []);

  // Timer para la pregunta actual
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'playing' && currentQuestion) {
      interval = setInterval(() => {
        setTimeSpent((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, currentQuestion]);

  const checkActiveSession = async () => {
    try {
      // Ya no usamos este diálogo porque ahora permitimos múltiples sesiones
      // El usuario puede ver todas sus sesiones en progreso desde el botón dedicado
      setStep('type-selection');
    } catch (err) {
      // No hay sesión activa, continuar con selección
      setStep('type-selection');
    }
  };

  const continueActiveSession = async () => {
    if (!activeSession) return;
    try {
      setLoading(true);
      setSession(activeSession);
      setStep('playing');
      // Cargar la pregunta actual
      if (activeSession.current_question > 0) {
        await loadQuestion(activeSession.session_id, activeSession.current_question);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar la sesión activa');
      setStep('type-selection');
    } finally {
      setLoading(false);
    }
  };

  const startNewGame = async () => {
    // Ya no abandonamos la sesión, solo vamos a la selección de tipo
    setActiveSession(null);
    setStep('type-selection');
  };

  const loadQuestion = async (sessionId: string, questionNumber: number) => {
    try {
      setLoading(true);
      const question = await gameSessionsService.getQuestion(sessionId, questionNumber);
      
      // Asegurar que options siempre esté definido
      if (!question.options || !Array.isArray(question.options)) {
        console.error('Question options is missing or invalid:', question);
        setError('Error: La pregunta no tiene opciones válidas');
        return;
      }
      
      // Decodificar entidades HTML
      const decodedQuestion = decodeQuestion(question);
      setCurrentQuestion(decodedQuestion);
      setSelectedOption('');
      setTimeSpent(0);
      setLastAnswer(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar la pregunta');
    } finally {
      setLoading(false);
    }
  };

  const handleGameTypeSelection = (type: 'own' | 'opentdb') => {
    setGameType(type);
    setStep('game-type');
  };

  const handleStartGame = async (triviaId: string) => {
    try {
      setLoading(true);
      setError('');
      const newSession = await gameSessionsService.createSession({ trivia_id: triviaId });
      setSession(newSession);

      if (newSession.questions && newSession.questions.length > 0) {
        // Decodificar entidades HTML en la primera pregunta
        const firstQuestion = decodeQuestion(newSession.questions[0]);
        setCurrentQuestion(firstQuestion);
        setStep('playing');
      } else {
        await loadQuestion(newSession.session_id, 1);
        setStep('playing');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar la partida');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!session || !currentQuestion || !selectedOption) return;

    try {
      setLoading(true);
      const answer = await gameSessionsService.submitAnswer(session.session_id, {
        question_id: currentQuestion.question_id,
        selected_option_id: selectedOption,
        time_taken_seconds: timeSpent,
      });

      // Decodificar entidades HTML en la respuesta
      const decodedAnswer: AnswerResponse = {
        ...answer,
        question_text: decodeHtmlEntities(answer.question_text),
        selected_option_text: decodeHtmlEntities(answer.selected_option_text),
        correct_option: answer.correct_option
          ? {
              ...answer.correct_option,
              option_text: decodeHtmlEntities(answer.correct_option.option_text),
            }
          : undefined,
        next_question: answer.next_question,
        session_progress: answer.session_progress,
      };
      setLastAnswer(decodedAnswer);

      // Actualizar la sesión local con los datos de la respuesta
      // session_progress contiene el estado actualizado
      if (decodedAnswer.session_progress) {
        setSession((prev) => ({
          ...prev!,
          current_question: decodedAnswer.session_progress!.current_question,
          correct_answers: decodedAnswer.session_progress!.correct_answers,
          total_score: decodedAnswer.session_progress!.total_score,
        }));
      }

      // Si hay siguiente pregunta, cargarla inmediatamente
      if (answer.next_question) {
        await loadQuestion(session.session_id, answer.next_question.question_number);
      }

      // Intentar completar automáticamente si es la última pregunta
      try {
        const anyAnswer: any = answer;
        if (anyAnswer && anyAnswer.next_question === null) {
          setLoading(true);
          await new Promise((resolve) => setTimeout(resolve, 2000));

          const completedSession = await completeSessionWithRetry(session.session_id);
          setSession(completedSession);
          setStep('completed');
          await refreshUser();
          return;
        }
      } catch (completeErr: any) {
        setError(
          completeErr.response?.data?.message || 'Error al completar la sesión automáticamente'
        );
      } finally {
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al enviar la respuesta');
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = async () => {
    if (!session) return;
    const nextQuestionNumber = session.current_question + 1;
    await loadQuestion(session.session_id, nextQuestionNumber);
  };

  const handleCompleteSession = async () => {
    if (!session) return;
    
    try {
      setLoading(true);
      setError('');

      const completedSession = await completeSessionWithRetry(session.session_id);
      setSession(completedSession);
      setStep('completed');
      await refreshUser();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al completar la sesión';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAbandon = async () => {
    if (!session) return;

    if (confirm('¿Estás seguro de que quieres abandonar esta partida?')) {
      try {
        setLoading(true);
        await gameSessionsService.abandonSession(session.session_id);
        setStep('type-selection');
        setSession(null);
        setCurrentQuestion(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al abandonar la partida');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSaveAndExit = () => {
    if (confirm('¿Deseas guardar tu progreso y salir? Podrás continuar esta trivia más tarde.')) {
      router.push('/dashboard');
    }
  };

  const resetToTypeSelection = () => {
    setStep('type-selection');
  };

  const handleResumeSession = async (sessionId: string) => {
    try {
      setLoading(true);
      setError('');
      
      // Obtener los detalles completos de la sesión específica
      const sessionData = await gameSessionsService.getSessionById(sessionId);
      
      // current_question en el backend representa el número de preguntas respondidas
      // Si current_question es 0, significa que no ha respondido ninguna, debe cargar pregunta 1
      // Si current_question es 1, significa que respondió 1 pregunta, debe cargar pregunta 2
      const nextQuestionNumber = sessionData.current_question === 0 ? 1 : sessionData.current_question + 1;
      
      // Transformar los datos al formato esperado
      // current_question en la UI debe reflejar el número de la pregunta que se está mostrando
      const sessionFormatted: GameSession = {
        session_id: sessionData.session_id,
        trivia_id: sessionData.trivia.id,
        trivia_title: sessionData.trivia.title,
        player_id: sessionData.player?.id || userId || '',
        status: sessionData.status,
        current_question: nextQuestionNumber, // Número de la pregunta que se va a mostrar
        total_questions: sessionData.total_questions,
        correct_answers: sessionData.correct_answers,
        total_score: sessionData.total_score,
        time_spent_seconds: sessionData.time_spent_seconds,
        started_at: sessionData.started_at,
      };
      
      setSession(sessionFormatted);
      setStep('playing');
      
      await loadQuestion(sessionId, nextQuestionNumber);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al reanudar la sesión');
      setStep('type-selection');
    } finally {
      setLoading(false);
    }
  };

  const viewInProgressSessions = () => {
    setStep('in-progress-sessions');
  };

  return {
    // Estado
    step,
    gameType,
    session,
    currentQuestion,
    selectedOption,
    timeSpent,
    lastAnswer,
    loading,
    error,
    activeSession,
    
    // Setters
    setStep,
    setSelectedOption,
    setError,
    
    // Handlers
    continueActiveSession,
    startNewGame,
    handleGameTypeSelection,
    handleStartGame,
    handleSubmitAnswer,
    handleNextQuestion,
    handleCompleteSession,
    handleAbandon,
    handleSaveAndExit,
    resetToTypeSelection,
    handleResumeSession,
    viewInProgressSessions,
  };
}

