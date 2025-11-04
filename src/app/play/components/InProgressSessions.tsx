'use client';

import { useEffect, useState, useMemo } from 'react';
import { gameSessionsService } from '@/services/game-sessions.service';
import styles from '../play.module.css';

interface InProgressSessionsProps {
  onResumeSession: (sessionId: string) => void;
  onBack: () => void;
  loading: boolean;
}

const ITEMS_PER_PAGE = 6;

export function InProgressSessions({
  onResumeSession,
  onBack,
  loading,
}: InProgressSessionsProps) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoadingSessions(true);
      const data = await gameSessionsService.getInProgressSessions();
      setSessions(data);
    } catch (err) {
      console.error('Error loading in-progress sessions:', err);
    } finally {
      setLoadingSessions(false);
    }
  };

  // Calcular paginación
  const totalPages = useMemo(() => Math.ceil(sessions.length / ITEMS_PER_PAGE), [sessions.length]);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentSessions = useMemo(
    () => sessions.slice(startIndex, endIndex),
    [sessions, startIndex, endIndex]
  );

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `Hace ${days} día${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    return 'Hace un momento';
  };

  return (
    <div className={styles.gameTypeSelection}>
      <button onClick={onBack} className={styles.backButton}>
        ← Atrás
      </button>
      <h2>Mis Partidas en Progreso</h2>
      {loadingSessions ? (
        <div className={styles.loading}>Cargando partidas...</div>
      ) : sessions.length === 0 ? (
        <div className={styles.empty}>No tienes partidas en progreso</div>
      ) : (
        <>
          <div className={styles.triviasList}>
            {currentSessions.map((session) => (
              <button
                key={session.session_id}
                onClick={() => onResumeSession(session.session_id)}
                className={styles.triviaCard}
                disabled={loading}
              >
                <h3>{session.trivia_title}</h3>
                <p>Progreso: {session.correct_answers}/{session.total_questions} preguntas</p>
                <p>Puntos: {session.total_score}</p>
                <p className={styles.sessionDate}>{formatDate(session.started_at)}</p>
              </button>
            ))}
          </div>

          {/* Controles de paginación */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={handlePreviousPage}
                className={styles.paginationButton}
                disabled={currentPage === 1 || loading}
              >
                ← Anterior
              </button>
              
              <div className={styles.paginationNumbers}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageClick(page)}
                        className={`${styles.paginationNumber} ${
                          currentPage === page ? styles.paginationNumberActive : ''
                        }`}
                        disabled={loading}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className={styles.paginationEllipsis}>...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={handleNextPage}
                className={styles.paginationButton}
                disabled={currentPage === totalPages || loading}
              >
                Siguiente →
              </button>
            </div>
          )}

          <div className={styles.paginationInfo}>
            Mostrando {startIndex + 1}-{Math.min(endIndex, sessions.length)} de {sessions.length}{' '}
            partidas
          </div>
        </>
      )}
    </div>
  );
}

