'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { gameSessionsService } from '@/services/game-sessions.service';
import { Question, GameSession } from '@/types/game';
import styles from './game-sessions.module.css';
import apiClient from '@/lib/api-client';

export default function GameSessionsPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  const [session, setSession] = useState<GameSession | null>(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [question, setQuestion] = useState<Question | null>(null);
  const [questionNumber, setQuestionNumber] = useState<number>(1);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [score, setScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [lastQuestionReached, setLastQuestionReached] = useState(false);

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/auth/login');
  }, [isAuthenticated, isLoading, router]);

  // Cargar sesión activa al iniciar
  useEffect(() => {
    if (!isLoading && isAuthenticated) fetchCurrentSession();
  }, [isLoading, isAuthenticated]);

  // Obtener sesión actual del backend
  const fetchCurrentSession = async () => {
    setLoading(true);
    setError('');
    try {
      const currentSession = await gameSessionsService.getCurrentSession();
      if (currentSession) {
        setSession(currentSession);
        setSessionActive(true);
        setQuestionNumber(currentSession.current_question || 1);
        fetchQuestion(currentSession.session_id, currentSession.current_question || 1);
        setScore(currentSession.total_score || 0);
      } else {
        setSessionActive(false);
      }
    } catch {
      setSessionActive(false);
    } finally {
      setLoading(false);
    }
  };

  // Obtener pregunta actual
  const fetchQuestion = async (sessionId: string, number: number) => {
    try {
      const q = await gameSessionsService.getQuestion(sessionId, number);
      setQuestion(q);
      setSelectedOption(null);
      setFeedback(null);
    } catch {
      setError('Error al cargar la pregunta');
    }
  };

  // Manejar respuesta seleccionada
  const handleAnswer = async (optionId: string) => {
    if (!question || !session) return;
    setSelectedOption(optionId);

    try {
      const response = await gameSessionsService.submitAnswer(session.session_id, {
        question_id: question.question_id,
        selected_option_id: optionId,
        time_taken_seconds: 0,
      });

      if (response.correct || response.is_correct) {
        setFeedback('correct');
        setScore((prev) => prev + (response.points_earned || question.points_value));
      } else {
        setFeedback('incorrect');
      }

      setTimeout(() => {
        if (response.next_question) {
          setQuestionNumber(response.next_question.question_number);
          fetchQuestion(session.session_id, response.next_question.question_number);
        } else {
          setLastQuestionReached(true);
          setQuestion(null);
        }
      }, 1200);
    } catch {
      setError('Error al enviar la respuesta');
    }
  };

  // Finalizar sesión y guardar score
  const finalizeSession = async () => {
    if (!session || !user) return;
    setLoading(true);
    setError('');
    try {
      await gameSessionsService.completeSession(session.session_id);

      if (user.id) {
        try {
          await apiClient.put(`/users/${user.id}/score`, { total_score: score });
        } catch {
          try {
            await apiClient.post(`/users/${user.id}/score`, { total_score: score });
          } catch {
            setError('Score guardado parcialmente o no se pudo guardar automáticamente.');
          }
        }
      }

      setSessionActive(false);
      setLastQuestionReached(true);
      setQuestion(null);
      setError('Se guardó el score y la partida ha finalizado.');
    } catch {
      setError('Error al finalizar la sesión y guardar el score');
    } finally {
      setLoading(false);
    }
  };

  // Abandonar sesión
  const abandonSession = async () => {
    if (!session || !user) return;
    setLoading(true);
    setError('');
    try {
      await gameSessionsService.abandonSession(session.session_id);

      if (user.id) {
        try {
          await apiClient.put(`/users/${user.id}/score`, { total_score: score });
        } catch {
          console.error('No se pudo guardar score parcial.');
        }
      }

      setSessionActive(false);
      setQuestion(null);
      setLastQuestionReached(true);
      setError('Partida abandonada. Score guardado.');
    } catch {
      setError('Error al abandonar la sesión');
    } finally {
      setLoading(false);
    }
  };

  // Reset de la sesión
  const resetSession = () => {
    setSession(null);
    setSessionActive(false);
    setQuestion(null);
    setQuestionNumber(1);
    setScore(0);
    setLastQuestionReached(false);
    setSelectedOption(null);
    setFeedback(null);
    setError('');
  };

  // Loader
  if (isLoading || loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Game Sessions</h1>
          <div className={styles.userInfo}>
            <span>{user ? `Hola, ${user.name}` : 'Cargando...'}</span>
          </div>
        </div>
        <main className={styles.main}>
          <p>Cargando sesión...</p>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <h1>Game Sessions</h1>
        <div className={styles.userInfo}>
          <span>Hola, {user?.name}</span>
          <button className={styles.smallButton} onClick={() => router.push('/admin/dashboard')}>Volver</button>
          <button className={styles.smallButtonCS} onClick={logout}>Cerrar Sesión</button>
        </div>
      </header>

      {/* Main */}
      <main className={styles.main}>

        {/* Sin sesiones activas */}
        {!sessionActive && !lastQuestionReached && (
          <div className={styles.noSession}>
            <p>No tienes sesiones activas.</p>
            <p>Puedes jugar ahora en <button className={styles.smallButton} onClick={() => router.push('/play')}>JUGAR TRIVIAS</button></p>
          </div>
        )}

        {/* Sesión finalizada */}
        {!sessionActive && lastQuestionReached && (
          <div className={styles.noSession}>
            <p>¡La partida ha finalizado!</p>
            <p>Puntaje final: <strong>{score}</strong></p>
            {error && <p style={{ color: 'green' }}>{error}</p>}
            <button className={styles.smallButton} onClick={() => router.push('/admin/dashboard')}>Volver al Dashboard</button>
          </div>
        )}

        {/* Sesión activa */}
        {sessionActive && (
          <div className={styles.sessionCard}>
            {question && (
              <>
                <div className={styles.questionText}>
                  Pregunta #{question.order}: {question.question_text}
                </div>
                <ul className={styles.optionsList}>
                  {question.options.map(opt => (
                    <li key={opt.option_id}>
                      <button
                        className={`${styles.optionButton} ${
                          selectedOption === opt.option_id
                            ? feedback === 'correct'
                              ? styles.correct
                              : feedback === 'incorrect'
                              ? styles.incorrect
                              : ''
                            : ''
                        }`}
                        onClick={() => handleAnswer(opt.option_id)}
                        disabled={!!selectedOption}
                      >
                        {opt.option_text}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {lastQuestionReached && !question && <p>¡Has terminado todas las preguntas!</p>}

            <div className={styles.score}>Puntaje: {score}</div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button className={styles.smallButton} onClick={finalizeSession}>Finalizar sesión</button>
              <button className={styles.smallButton} onClick={abandonSession}>Abandonar partida</button>
            </div>
          </div>
        )}

        {/* Mensaje de error general */}
        {error && sessionActive && <p style={{ color: 'red' }}>{error}</p>}
      </main>
    </div>
  );
}
