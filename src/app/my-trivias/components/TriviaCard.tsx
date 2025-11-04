'use client';

import { Trivia, Category } from '@/types/game';
import styles from './TriviaCard.module.css';

interface TriviaCardProps {
  trivia: Trivia;
  categories: Category[];
  onEdit: (triviaId: string) => void;
  onDelete: (triviaId: string) => void;
  onPublish: (triviaId: string) => void;
  onArchive: (triviaId: string) => void;
}

const STATUS_CONFIG = {
  draft: {
    label: 'Borrador',
    color: '#f59e0b',
    icon: '📝',
  },
  published: {
    label: 'Publicada',
    color: '#10b981',
    icon: '✅',
  },
  archived: {
    label: 'Archivada',
    color: '#6b7280',
    icon: '📦',
  },
};

const DIFFICULTY_CONFIG = {
  easy: {
    label: 'Fácil',
    color: '#10b981',
    icon: '🟢',
  },
  medium: {
    label: 'Media',
    color: '#f59e0b',
    icon: '🟡',
  },
  hard: {
    label: 'Difícil',
    color: '#ef4444',
    icon: '🔴',
  },
};

export function TriviaCard({
  trivia,
  categories,
  onEdit,
  onDelete,
  onPublish,
  onArchive,
}: TriviaCardProps) {
  const category = categories.find((c) => c.id === trivia.category_id);
  const statusConfig = STATUS_CONFIG[trivia.status];
  const difficultyConfig = DIFFICULTY_CONFIG[trivia.difficulty_level];

  return (
    <div className={styles.card}>
      {/* Header con estado */}
      <div className={styles.cardHeader}>
        <div
          className={styles.statusBadge}
          style={{ background: statusConfig.color }}
        >
          {statusConfig.icon} {statusConfig.label}
        </div>
        <button
          onClick={() => onDelete(trivia.id)}
          className={styles.deleteIcon}
          title="Eliminar trivia"
        >
          🗑️
        </button>
      </div>

      {/* Contenido principal */}
      <div className={styles.cardBody}>
        <h3 className={styles.title}>{trivia.title}</h3>

        <div className={styles.metadata}>
          <div className={styles.metaItem}>
            <span className={styles.metaIcon}>📂</span>
            <span className={styles.metaText}>
              {category?.name || 'Sin categoría'}
            </span>
          </div>

          <div className={styles.metaItem}>
            <span className={styles.metaIcon}>{difficultyConfig.icon}</span>
            <span className={styles.metaText}>{difficultyConfig.label}</span>
          </div>

          {trivia.is_public !== undefined && (
            <div className={styles.metaItem}>
              <span className={styles.metaIcon}>
                {trivia.is_public ? '🌐' : '🔒'}
              </span>
              <span className={styles.metaText}>
                {trivia.is_public ? 'Pública' : 'Privada'}
              </span>
            </div>
          )}
        </div>

        {/* Estadísticas */}
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{trivia.plays_count || 0}</div>
            <div className={styles.statLabel}>Jugadas</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>
              {trivia.avg_score?.toFixed(1) || '0.0'}
            </div>
            <div className={styles.statLabel}>Promedio</div>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className={styles.cardActions}>
        <button
          onClick={() => onEdit(trivia.id)}
          className={`${styles.actionButton} ${styles.editButton}`}
        >
          ✏️ Editar
        </button>

        {trivia.status === 'draft' && (
          <button
            onClick={() => onPublish(trivia.id)}
            className={`${styles.actionButton} ${styles.publishButton}`}
          >
            🚀 Publicar
          </button>
        )}

        {trivia.status === 'published' && (
          <button
            onClick={() => onArchive(trivia.id)}
            className={`${styles.actionButton} ${styles.archiveButton}`}
          >
            📦 Archivar
          </button>
        )}

        {trivia.status === 'archived' && (
          <button
            onClick={() => onPublish(trivia.id)}
            className={`${styles.actionButton} ${styles.publishButton}`}
          >
            🔄 Restaurar
          </button>
        )}
      </div>
    </div>
  );
}

