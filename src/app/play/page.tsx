'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { gameSessionsService } from '@/services/game-sessions.service';
import { GameSession, Question, AnswerResponse } from '@/types/game';
import { decodeHtmlEntities } from '@/lib/html-decoder';
import styles from './play.module.css';

export default function PlayPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();
  const [step, setStep] = useState<'type-selection' | 'game-type' | 'playing' | 'completed'>('type-selection');
  const [gameType, setGameType] = useState<'own' | 'opentdb'>('own');
  const [session, setSession] = useState<GameSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [timeSpent, setTimeSpent] = useState(0);
  const [lastAnswer, setLastAnswer] = useState<AnswerResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    // Verificar si hay sesión activa
    checkActiveSession();
  }, []);

  useEffect(() => {
    // Timer para la pregunta actual
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
      const activeSession = await gameSessionsService.getCurrentSession();
      setSession(activeSession);
      setStep('playing');
      // Cargar la pregunta actual
      if (activeSession.current_question > 0) {
        loadQuestion(activeSession.session_id, activeSession.current_question);
      }
    } catch (err) {
      // No hay sesión activa, continuar con selección
    }
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
      question.question_text = decodeHtmlEntities(question.question_text);
      question.options = question.options.map(opt => ({
        ...opt,
        option_text: decodeHtmlEntities(opt.option_text),
      }));
      setCurrentQuestion(question);
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
        const firstQuestion = newSession.questions[0];
        firstQuestion.question_text = decodeHtmlEntities(firstQuestion.question_text);
        firstQuestion.options = firstQuestion.options.map(opt => ({
          ...opt,
          option_text: decodeHtmlEntities(opt.option_text),
        }));
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
      const decodedAnswer = {
        ...answer,
        question_text: decodeHtmlEntities(answer.question_text),
        selected_option_text: decodeHtmlEntities(answer.selected_option_text),
        correct_option: answer.correct_option ? {
          ...answer.correct_option,
          option_text: decodeHtmlEntities(answer.correct_option.option_text),
        } : undefined,
        next_question: answer.next_question
      };
      setLastAnswer(decodedAnswer);

      // Si hay siguiente pregunta, la precargamos
      let nextQuestionToLoad = decodedAnswer.next_question;
      
      // Actualizar sesión - esperar un momento para asegurar que el backend haya procesado
      await new Promise(resolve => setTimeout(resolve, 500));
      const updatedSession = await gameSessionsService.getCurrentSession();
      setSession(updatedSession);

      // Si hay siguiente pregunta, cargarla inmediatamente
      if (answer.next_question) {
        await loadQuestion(session.session_id, answer.next_question.question_number);
      }

      // Si la respuesta no trae `next_question` (es la última pregunta), intentar completar la sesión automáticamente
      // Esto evita que el usuario vea el error de "Debes responder todas las preguntas" al pulsar "Ver Resultados".
      try {
        const anyAnswer: any = answer;
        if (anyAnswer && anyAnswer.next_question === null) {
          setLoading(true);
          // Esperar más tiempo inicialmente para asegurar que el backend haya procesado todo
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Refrescar la sesión varias veces hasta confirmar que está lista
          let retryCount = 0;
          let lastError = null;
          while (retryCount < 5) { // Aumentar número de intentos
            try {
              // Esperar antes de cada intento
              if (retryCount > 0) {
                await new Promise(resolve => setTimeout(resolve, 2000));
              }
              
              // Obtener estado más reciente
              const freshSession = await gameSessionsService.getCurrentSession();
              
              // Verificar que todas las preguntas han sido respondidas
              if (freshSession.current_question >= freshSession.total_questions) {
                // Intentar completar con la sesión fresca
                const completedSession = await gameSessionsService.completeSession(freshSession.session_id);
                setSession(completedSession);
                setStep('completed');
                // Actualizar el estado del usuario para reflejar los nuevos puntos
                await refreshUser();
                return; // Éxito - salir
              } else {
                // Si aún no se han respondido todas las preguntas, esperar más
                retryCount++;
                continue;
              }
            } catch (err: any) {
              lastError = err;
              const errorMessage = err.response?.data?.message || 'Error al completar la sesión';
              
              if (errorMessage.includes('responder todas') && retryCount < 4) {
                retryCount++;
                continue;
              } else {
                throw err;
              }
            }
          }
          
          // Si llegamos aquí, todos los intentos fallaron
          throw lastError || new Error('No se pudo completar la sesión después de varios intentos');
        }
      } catch (completeErr: any) {
        // Si falla la finalización automática, mostrar el error; el usuario podrá reintentar con el botón
        setError(completeErr.response?.data?.message || 'Error al completar la sesión automáticamente');
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
              <p>Juega con trivias creadas en la plataforma</p>
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
          </div>
        </div>
      )}

      {step === 'game-type' && (
        <GameTypeSelection
          gameType={gameType}
          onStartGame={handleStartGame}
          onBack={() => setStep('type-selection')}
          loading={loading}
        />
      )}

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
            <button onClick={handleAbandon} className={styles.abandonButton} disabled={loading}>
              Abandonar
            </button>
          </div>

          {lastAnswer ? (
            <div className={styles.answerFeedback}>
              <div className={`${styles.feedbackCard} ${lastAnswer.is_correct ? styles.correct : styles.incorrect}`}>
                <h3>{lastAnswer.is_correct ? '✓ Correcto!' : '✗ Incorrecto'}</h3>
                <p>
                  {lastAnswer.is_correct
                    ? `+${lastAnswer.points_earned} puntos`
                    : `Respuesta correcta: ${lastAnswer.correct_option?.option_text || lastAnswer.correct_answer || 'No disponible'}`}
                </p>
              </div>

              {session.current_question >= session.total_questions ? (
                <button
                  onClick={async () => {
                    try {
                      setLoading(true);
                      setError('');
                      
                      // Sistema de reintentos para completar la sesión
                      let retryCount = 0;
                      let lastError = null;
                      
                      while (retryCount < 5) { // Aumentar el número de intentos
                        try {
                          // Esperar más tiempo antes de cada intento para permitir la sincronización
                          await new Promise(resolve => setTimeout(resolve, 2000));
                          
                          // Obtener estado más reciente
                          const freshSession = await gameSessionsService.getCurrentSession();
                          setSession(freshSession);
                          
                          // Verificar que todas las preguntas han sido respondidas
                          if (freshSession.current_question >= freshSession.total_questions) {
                            // Intentar completar con la sesión fresca
                            const completedSession = await gameSessionsService.completeSession(freshSession.session_id);
                            setSession(completedSession);
                            setStep('completed');
                            return; // Éxito - salir
                          } else {
                            // Si aún no se han respondido todas las preguntas, esperar más
                            retryCount++;
                            continue;
                          }
                        } catch (err: any) {
                          lastError = err;
                          const errorMessage = err.response?.data?.message || 'Error al completar la sesión';
                          
                          if (errorMessage.includes('responder todas') && retryCount < 4) {
                            retryCount++;
                            continue;
                          }
                          
                          // Si no es error de sincronización o es el último intento, lanzar
                          throw err;
                        }
                      }
                      
                      // Si llegamos aquí, todos los intentos fallaron
                      throw lastError || new Error('No se pudo completar la sesión después de varios intentos');
                      
                    } catch (err: any) {
                      const errorMessage = err.response?.data?.message || 'Error al completar la sesión';
                      setError(errorMessage);
                    } finally {
                      setLoading(false);
                    }
                  }}
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
                    <div className={styles.error}>No hay opciones disponibles para esta pregunta</div>
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
              <p className={styles.statValue}>{Math.floor(session.time_spent_seconds / 60)}m {session.time_spent_seconds % 60}s</p>
            </div>
          </div>
          <div className={styles.resultsActions}>
            <button onClick={() => setStep('type-selection')} className={styles.playAgainButton}>
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

// Componente para selección de trivias
function GameTypeSelection({
  gameType,
  onStartGame,
  onBack,
  loading,
}: {
  gameType: 'own' | 'opentdb';
  onStartGame: (triviaId: string) => void;
  onBack: () => void;
  loading: boolean;
}) {
  if (gameType === 'own') {
    return <OwnTriviasSelection onStartGame={onStartGame} onBack={onBack} loading={loading} />;
  } else {
    return <OpenTDBSelection onStartGame={onStartGame} onBack={onBack} loading={loading} />;
  }
}

// Componente para selección de trivias propias
function OwnTriviasSelection({
  onStartGame,
  onBack,
  loading,
}: {
  onStartGame: (triviaId: string) => void;
  onBack: () => void;
  loading: boolean;
}) {
  const [trivias, setTrivias] = useState<any[]>([]);
  const [loadingTrivias, setLoadingTrivias] = useState(true);

  useEffect(() => {
    loadTrivias();
  }, []);

  const loadTrivias = async () => {
    try {
      setLoadingTrivias(true);
      const { triviasService } = await import('@/services/trivias.service');
      const data = await triviasService.getTrivias({ status: 'published' });
      setTrivias(data);
    } catch (err) {
      console.error('Error loading trivias:', err);
    } finally {
      setLoadingTrivias(false);
    }
  };

  return (
    <div className={styles.gameTypeSelection}>
      <button onClick={onBack} className={styles.backButton}>
        ← Atrás
      </button>
      <h2>Selecciona una Trivia</h2>
      {loadingTrivias ? (
        <div className={styles.loading}>Cargando trivias...</div>
      ) : trivias.length === 0 ? (
        <div className={styles.empty}>No hay trivias disponibles</div>
      ) : (
        <div className={styles.triviasList}>
          {trivias.map((trivia) => (
            <button
              key={trivia.id}
              onClick={() => onStartGame(trivia.id)}
              className={styles.triviaCard}
              disabled={loading}
            >
              <h3>{trivia.title}</h3>
              <p>Dificultad: {trivia.difficulty_level}</p>
              <p>Plays: {trivia.plays_count}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Componente para selección de OpenTDB
function OpenTDBSelection({
  onStartGame,
  onBack,
  loading,
}: {
  onStartGame: (triviaId: string) => void;
  onBack: () => void;
  loading: boolean;
}) {
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    amount: 10,
    category: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    type: 'multiple' as 'multiple' | 'boolean',
  });
  // Estado separado para manejar el input temporal
  const [tempAmount, setTempAmount] = useState<string>('10');

  // Añadir validación antes de crear y empezar
  const validateForm = () => {
    const numAmount = parseInt(tempAmount);
    if (isNaN(numAmount) || numAmount < 1) {
      alert('Por favor, ingresa un número válido de preguntas (mínimo 1)');
      return false;
    }
    // Asegurarse de que formData tenga el valor correcto antes de proceder
    setFormData(prev => ({ ...prev, amount: numAmount }));
    return true;
  };
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const { externalApiService } = await import('@/services/external-api.service');
      const data = await externalApiService.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleCreateAndStart = async () => {
    // Validar el formulario antes de proceder
    if (!validateForm()) {
      return;
    }

    try {
      setCreating(true);
      const { externalApiService } = await import('@/services/external-api.service');
      const { triviasService } = await import('@/services/trivias.service');
      const { categoriesService } = await import('@/services/categories.service');
      const { questionsService } = await import('@/services/questions.service');

      // Obtener categoría por defecto o primera disponible
      const appCategories = await categoriesService.getCategories();
      const defaultCategory = appCategories[0];
      if (!defaultCategory) {
        throw new Error('No hay categorías disponibles en la aplicación');
      }

      // Obtener preguntas de OpenTDB
      const openTDBResponse = await externalApiService.fetchQuestions({
        amount: formData.amount,
        category: formData.category ? parseInt(formData.category) : undefined,
        difficulty: formData.difficulty,
        type: formData.type,
      });

      // Crear trivia temporal
      const trivia = await triviasService.createTrivia({
        title: `OpenTDB Quiz - ${formData.difficulty}`,
        category_id: defaultCategory.id,
        difficulty_level: formData.difficulty,
        status: 'published',
        is_public: true,
      });

      // Convertir y crear preguntas
      const questionsData = openTDBResponse.results.map((q, index) => {
        const allAnswers = [q.correct_answer, ...q.incorrect_answers];
        const shuffledAnswers = allAnswers.sort(() => Math.random() - 0.5);
        const pointsMap: { [key: string]: number } = { easy: 5, medium: 10, hard: 15 };
        
        // Decodificar entidades HTML de OpenTDB
        const decodedQuestion = decodeHtmlEntities(q.question);
        const decodedCorrectAnswer = decodeHtmlEntities(q.correct_answer);
        const decodedIncorrectAnswers = q.incorrect_answers.map(ans => decodeHtmlEntities(ans));
        
        const allDecodedAnswers = [decodedCorrectAnswer, ...decodedIncorrectAnswers];
        const shuffledDecodedAnswers = allDecodedAnswers.sort(() => Math.random() - 0.5);
        
        return {
          trivia_id: trivia.id,
          question_text: decodedQuestion,
          question_type: (q.type === 'boolean' ? 'true_false' : 'multiple_choice') as 'multiple_choice' | 'true_false',
          options: shuffledDecodedAnswers.map((ans) => ({
            text: ans,
            is_correct: ans === decodedCorrectAnswer,
          })),
          correct_answer: decodedCorrectAnswer,
          points_value: pointsMap[q.difficulty] || 10,
        };
      });

      await questionsService.createQuestions(questionsData);

      // Iniciar juego
      onStartGame(trivia.id);
    } catch (err: any) {
      console.error('Error creating OpenTDB game:', err);
      alert(err.response?.data?.message || 'Error al crear la trivia de OpenTDB');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className={styles.gameTypeSelection}>
      <button onClick={onBack} className={styles.backButton}>
        ← Atrás
      </button>
      <h2>Configuración de OpenTDB</h2>
      <div className={styles.opentdbForm}>
        <div className={styles.formGroup}>
          <label>Cantidad de preguntas</label>
          <input
            type="number"
            min="1"
            max="50"
            value={tempAmount}
            onChange={(e) => {
              const value = e.target.value;
              setTempAmount(value);
              // Solo actualizar formData si hay un número válido
              if (value !== '' && !isNaN(parseInt(value))) {
                setFormData({ ...formData, amount: Math.max(1, parseInt(value)) });
              }
            }}
            onBlur={() => {
              // Al perder el foco, asegurar que haya un valor válido
              if (tempAmount === '' || isNaN(parseInt(tempAmount))) {
                setTempAmount('1');
                setFormData({ ...formData, amount: 1 });
              }
            }}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Categoría (opcional)</label>
          {loadingCategories ? (
            <div>Cargando categorías...</div>
          ) : (
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>Dificultad</label>
          <select
            value={formData.difficulty}
            onChange={(e) =>
              setFormData({ ...formData, difficulty: e.target.value as any })
            }
          >
            <option value="easy">Fácil</option>
            <option value="medium">Medio</option>
            <option value="hard">Difícil</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Tipo de pregunta</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
          >
            <option value="multiple">Opción múltiple</option>
            <option value="boolean">Verdadero/Falso</option>
          </select>
        </div>

        <button
          onClick={handleCreateAndStart}
          className={styles.startButton}
          disabled={loading || creating}
        >
          {creating ? 'Creando trivia...' : 'Iniciar Juego'}
        </button>
      </div>
    </div>
  );
}

