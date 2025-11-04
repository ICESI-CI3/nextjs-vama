'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useGameSession } from './hooks/useGameSession';
import { GameTypeSelection } from './components/GameTypeSelection';
import { InProgressSessions } from './components/InProgressSessions';
import styles from './play.module.css';

export default function PlayPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();
  const {
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
  } = useGameSession(refreshUser, user?.id);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Cargando...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>TriviaTime</h1>
        <button onClick={() => router.push('/dashboard')} className={styles.backButton}>
          ← Volver
        </button>
      </header>

      {error && (
        <div className={styles.error}>
          {error}
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}

      {/* Diálogo de sesión activa */}
      {step === 'session-dialog' && activeSession && (
        <div className={styles.activeSessionDialog}>
          <h2>Tienes una trivia en progreso</h2>
          <p>
            Has completado {activeSession.correct_answers} de {activeSession.total_questions}{' '}
            preguntas. ¿Deseas continuar esta trivia o empezar una nueva?
          </p>
          <div className={styles.dialogButtons}>
            <button
              onClick={continueActiveSession}
              className={styles.continueSessionButton}
              disabled={loading}
            >
              Continuar Trivia
            </button>
            <button onClick={startNewGame} className={styles.newGameButton} disabled={loading}>
              Nueva Trivia
            </button>
          </div>
        </div>
      )}

      {/* Selección de tipo de trivia */}
      {step === 'type-selection' && (
        <div className={styles.selectionScreen}>
          <h2>Elige el tipo de trivia</h2>
          <div className={styles.typeButtons}>
            <button
              onClick={() => handleGameTypeSelection('own')}
              className={styles.typeButton}
              disabled={loading}
            >
              <div className={styles.typeIcon}>📝</div>
              <h3>Trivias Propias</h3>
              <p>Juega trivias creadas por usuarios de la plataforma</p>
            </button>
            <button
              onClick={() => handleGameTypeSelection('opentdb')}
              className={styles.typeButton}
              disabled={loading}
            >
              <div className={styles.typeIcon}>🌐</div>
              <h3>OpenTDB</h3>
              <p>Juega con preguntas de Open Trivia Database</p>
            </button>
            <button
              onClick={viewInProgressSessions}
              className={`${styles.typeButton} ${styles.typeButtonCenter}`}
              disabled={loading}
            >
              <div className={styles.typeIcon}>⏸️</div>
              <h3>Mis Partidas en Progreso</h3>
              <p>Continúa con tus partidas guardadas</p>
            </button>
          </div>
        </div>
      )}

      {/* Selección de trivia específica */}
      {step === 'game-type' && (
        <GameTypeSelection
          gameType={gameType}
          onStartGame={handleStartGame}
          onBack={resetToTypeSelection}
          loading={loading}
        />
      )}

      {/* Sesiones en progreso */}
      {step === 'in-progress-sessions' && (
        <InProgressSessions
          onResumeSession={handleResumeSession}
          onBack={resetToTypeSelection}
          loading={loading}
        />
      )}

      {/* Pantalla de juego */}
      {step === 'playing' && session && currentQuestion && currentQuestion.options && (
        <div className={styles.gameScreen}>
          <div className={styles.gameHeader}>
            <div className={styles.progress}>
              <span>
                Pregunta {session.current_question} de {session.total_questions}
              </span>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: `${(session.current_question / session.total_questions) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div className={styles.gameStats}>
              <span>Puntos: {session.total_score}</span>
              <span>Correctas: {session.correct_answers}</span>
            </div>
            <div className={styles.gameActions}>
              <button
                onClick={handleSaveAndExit}
                className={styles.saveExitButton}
                disabled={loading}
              >
                Guardar y Salir
              </button>
              <button onClick={handleAbandon} className={styles.abandonButton} disabled={loading}>
                Abandonar
              </button>
            </div>
          </div>

          {lastAnswer ? (
            <div className={styles.answerFeedback}>
              <div
                className={`${styles.feedbackCard} ${
                  lastAnswer.is_correct ? styles.correct : styles.incorrect
                }`}
              >
                <h3>{lastAnswer.is_correct ? '✓ Correcto!' : '✗ Incorrecto'}</h3>
                <p>
                  {lastAnswer.is_correct
                    ? `+${lastAnswer.points_earned} puntos`
                    : `Respuesta correcta: ${
                        lastAnswer.correct_option?.option_text ||
                        lastAnswer.correct_answer ||
                        'No disponible'
                      }`}
                </p>
              </div>

              {session.current_question >= session.total_questions ? (
                <button
                  onClick={handleCompleteSession}
                  className={styles.nextButton}
                  disabled={loading}
                >
                  {loading ? 'Completando...' : 'Ver Resultados'}
                </button>
              ) : (
                <button onClick={handleNextQuestion} className={styles.nextButton} disabled={loading}>
                  Siguiente Pregunta →
                </button>
              )}
            </div>
          ) : (
            <>
              <div className={styles.questionCard}>
                <h2>{currentQuestion.question_text}</h2>
                <p className={styles.points}>Puntos: {currentQuestion.points_value}</p>
                <p className={styles.timer}>Tiempo: {timeSpent}s</p>

                <div className={styles.options}>
                  {currentQuestion.options && currentQuestion.options.length > 0 ? (
                    currentQuestion.options.map((option) => (
                      <button
                        key={option.option_id}
                        onClick={() => setSelectedOption(option.option_id)}
                        className={`${styles.option} ${
                          selectedOption === option.option_id ? styles.selected : ''
                        }`}
                        disabled={loading}
                      >
                        {option.option_text}
                      </button>
                    ))
                  ) : (
                    <div className={styles.error}>
                      No hay opciones disponibles para esta pregunta
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSubmitAnswer}
                  className={styles.submitButton}
                  disabled={!selectedOption || loading}
                >
                  {loading ? 'Enviando...' : 'Responder'}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Pantalla de resultados */}
      {step === 'completed' && session && (
        <div className={styles.resultsScreen}>
          <h2>¡Partida Completada!</h2>
          <div className={styles.resultsStats}>
            <div className={styles.statCard}>
              <h3>Puntuación Total</h3>
              <p className={styles.statValue}>{session.total_score}</p>
            </div>
            <div className={styles.statCard}>
              <h3>Respuestas Correctas</h3>
              <p className={styles.statValue}>
                {session.correct_answers} / {session.total_questions}
              </p>
            </div>
            <div className={styles.statCard}>
              <h3>Tiempo Total</h3>
              <p className={styles.statValue}>
                {Math.floor(session.time_spent_seconds / 60)}m {session.time_spent_seconds % 60}s
              </p>
            </div>
          </div>
          <div className={styles.resultsActions}>
            <button onClick={resetToTypeSelection} className={styles.playAgainButton}>
              Jugar Otra Vez
            </button>
            <button onClick={() => router.push('/dashboard')} className={styles.backButton}>
              Volver al Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
