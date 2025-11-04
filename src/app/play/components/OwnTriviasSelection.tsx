'use client';

import { useEffect, useState, useMemo } from 'react';
import styles from '../play.module.css';

interface OwnTriviasSelectionProps {
  onStartGame: (triviaId: string) => void;
  onBack: () => void;
  loading: boolean;
}

const ITEMS_PER_PAGE = 6;

export function OwnTriviasSelection({
  onStartGame,
  onBack,
  loading,
}: OwnTriviasSelectionProps) {
  const [trivias, setTrivias] = useState<any[]>([]);
  const [loadingTrivias, setLoadingTrivias] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadTrivias();
  }, []);

  const loadTrivias = async () => {
    try {
      setLoadingTrivias(true);
      const { triviasService } = await import('@/services/trivias.service');
      // Filtrar solo trivias publicadas Y públicas (excluye las de OpenTDB que son privadas)
      const data = await triviasService.getTrivias({ 
        status: 'published',
        is_public: true 
      });
      setTrivias(data);
    } catch (err) {
      console.error('Error loading trivias:', err);
    } finally {
      setLoadingTrivias(false);
    }
  };

  // Calcular paginación
  const totalPages = useMemo(() => Math.ceil(trivias.length / ITEMS_PER_PAGE), [trivias.length]);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTrivias = useMemo(
    () => trivias.slice(startIndex, endIndex),
    [trivias, startIndex, endIndex]
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
        <>
          <div className={styles.triviasList}>
            {currentTrivias.map((trivia) => (
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
                  // Mostrar solo algunas páginas alrededor de la actual
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
            Mostrando {startIndex + 1}-{Math.min(endIndex, trivias.length)} de {trivias.length}{' '}
            trivias
          </div>
        </>
      )}
    </div>
  );
}

