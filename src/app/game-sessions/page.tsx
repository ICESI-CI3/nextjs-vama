'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { gameSessionsService } from '@/services/game-sessions.service';
import styles from './game-sessions.module.css';

type SessionStatus = 'all' | 'in_progress' | 'completed' | 'abandoned';

interface SessionData {
  session_id: string;
  trivia_id: string;
  trivia_title: string;
  category: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  total_score: number;
  correct_answers: number;
  total_questions: number;
  accuracy_percentage: number;
  time_spent_seconds: number;
  started_at: string;
  completed_at?: string;
}

export default function GameSessionsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<SessionStatus>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSessions, setTotalSessions] = useState(0);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadSessions();
    }
  }, [isAuthenticated, statusFilter, currentPage]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await gameSessionsService.getHistory({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });

      // Normalizar los datos para asegurar que tenemos trivia_id
      const normalizedSessions = (response.sessions || []).map((session: any) => ({
        ...session,
        trivia_id: session.trivia_id || session.trivia?.id,
      }));

      setSessions(normalizedSessions);
      setTotalPages(response.pagination?.total_pages || 1);
      setTotalSessions(response.pagination?.total_items || 0);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar las sesiones');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResumeSession = async (sessionId: string) => {
    // Redirigir al módulo de juego con la sesión específica
    router.push(/play?resume=${sessionId});
  };

  const handlePlayAgain = async (triviaId: string, triviaTitle: string) => {
    try {
      setLoading(true);
      setError('');
      
      // Intentar crear una nueva sesión con la misma trivia
      const newSession = await gameSessionsService.createSession({ trivia_id: triviaId });
      
      // Redirigir al juego con la nueva sesión
      router.push(/play?resume=${newSession.session_id});
    } catch (err: any) {
      setLoading(false);
      const errorMessage = err.response?.data?.message || 'Error al iniciar la partida';
      
      // Verificar diferentes tipos de errores
      if (err.response?.status === 404) {
        setError(La trivia "${triviaTitle}" ya no está disponible. Es posible que haya sido eliminada.);
      } else if (errorMessage.includes('no está publicada')) {
        setError(La trivia "${triviaTitle}" ya no está publicada y no se puede jugar en este momento.);
      } else if (errorMessage.includes('no tiene preguntas')) {
        setError(La trivia "${triviaTitle}" no tiene preguntas disponibles.);
      } else {
        setError(No se pudo iniciar la trivia "${triviaTitle}": ${errorMessage});
      }
      
      // Scroll hacia arriba para ver el error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return ${hours}h ${minutes}m ${secs}s;
    } else if (minutes > 0) {
      return ${minutes}m ${secs}s;
    } else {
      return ${secs}s;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      in_progress: { label: '⏸ En Progreso', className: styles.statusInProgress },
      completed: { label: '✅ Completada', className: styles.statusCompleted },
      abandoned: { label: '❌ Abandonada', className: styles.statusAbandoned },
    };
    return statusMap[status as keyof typeof statusMap] || { label: status, className: '' };
  };

  if (authLoading || loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Cargando sesiones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button onClick={() => router.push('/dashboard')} className={styles.backButton}>
            ← Volver
          </button>
          <h1>📊 Mis Sesiones de Juego</h1>
        </div>
        <div className={styles.headerRight}>
          <span>Hola, {user?.name}</span>
        </div>
      </header>

      <main className={styles.main}>
        {/* Filtros */}
        <div className={styles.filters}>
          <h3>Filtrar por estado:</h3>
          <div className={styles.filterButtons}>
            <button
              onClick={() => {
                setStatusFilter('all');
                setCurrentPage(1);
              }}
              className={${styles.filterButton} ${statusFilter === 'all' ? styles.filterButtonActive : ''}}
            >
              📋 Todas 
            </button>
            <button
              onClick={() => {
                setStatusFilter('in_progress');
                setCurrentPage(1);
              }}
              className={${styles.filterButton} ${statusFilter === 'in_progress' ? styles.filterButtonActive : ''}}
            >
              ⏸ En Progreso
            </button>
            <button
              onClick={() => {
                setStatusFilter('completed');
                setCurrentPage(1);
              }}
              className={${styles.filterButton} ${statusFilter === 'completed' ? styles.filterButtonActive : ''}}
            >
              ✅ Completadas
            </button>
            <button
              onClick={() => {
                setStatusFilter('abandoned');
                setCurrentPage(1);
              }}
              className={${styles.filterButton} ${statusFilter === 'abandoned' ? styles.filterButtonActive : ''}}
            >
              ❌ Abandonadas
            </button>
          </div>
        </div>

        {error && (
          <div className={styles.error}>
            {error}
            <button onClick={() => setError('')}>✕</button>
          </div>
        )}

        {/* Lista de sesiones */}
        {sessions.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🎮</div>
            <h3>No hay sesiones {statusFilter !== 'all' && statusFilter.replace('_', ' ')}</h3>
            <p>Comienza a jugar para ver tu historial aquí</p>
            <button onClick={() => router.push('/play')} className={styles.playButton}>
              🎮 Jugar Trivia
            </button>
          </div>
        ) : (
          <>
            <div className={styles.sessionsList}>
              {sessions.map((session) => {
                const statusInfo = getStatusBadge(session.status);
                return (
                  <div key={session.session_id} className={styles.sessionCard}>
                    <div className={styles.sessionHeader}>
                      <div>
                        <h3>{session.trivia_title}</h3>
                        <p className={styles.sessionCategory}>📂 {session.category}</p>
                      </div>
                      <span className={${styles.statusBadge} ${statusInfo.className}}>
                        {statusInfo.label}
                      </span>
                    </div>

                    <div className={styles.sessionBody}>
                      <div className={styles.sessionStats}>
                        <div className={styles.stat}>
                          <span className={styles.statLabel}>Puntuación</span>
                          <span className={styles.statValue}>{session.total_score}</span>
                        </div>
                        <div className={styles.stat}>
                          <span className={styles.statLabel}>Precisión</span>
                          <span className={styles.statValue}>{session.accuracy_percentage}%</span>
                        </div>
                        <div className={styles.stat}>
                          <span className={styles.statLabel}>Preguntas</span>
                          <span className={styles.statValue}>
                            {session.correct_answers}/{session.total_questions}
                          </span>
                        </div>
                        
                      </div>

                      <div className={styles.sessionDates}>
                        {session.completed_at && (
                          <p>
                            <strong>Finalizada:</strong> {formatDate(session.completed_at)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className={styles.sessionFooter}>
                      {session.status === 'in_progress' ? (
                        <button
                          onClick={() => handleResumeSession(session.session_id)}
                          className={styles.resumeButton}
                          disabled={loading}
                        >
                          ▶ Continuar Jugando
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePlayAgain(session.trivia_id, session.trivia_title)}
                          className={styles.playAgainButton}
                          disabled={loading}
                        >
                          🔄 Jugar de Nuevo
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className={styles.paginationButton}
                  disabled={currentPage === 1}
                >
                  ← Anterior
                </button>

                <div className={styles.paginationInfo}>
                  Página {currentPage} de {totalPages}
                </div>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  className={styles.paginationButton}
                  disabled={currentPage === totalPages}
                >
                  Siguiente →
                </button>
              </div>
            )}

            <div className={styles.resultsInfo}>
              Mostrando {sessions.length} de {totalSessions} sesiones
            </div>
          </>
        )}
      </main>
    </div>
  );
}