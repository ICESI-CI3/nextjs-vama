'use client';

import { Question } from '@/types/game';
import styles from './QuestionCard.module.css';

interface QuestionCardProps {
  question: Question;
  index: number;
  onEdit: (question: Question) => void;
  onDelete: (questionId: string) => void;
}

export function QuestionCard({
  question,
  index,
  onEdit,
  onDelete,
}: QuestionCardProps) {
  const correctOption = question.options?.find((opt) =>
    question.question_type === 'multiple_choice'
      ? opt.option_text === question.question_text // Comparar con respuesta correcta
      : opt.option_text === 'True' || opt.option_text === 'False'
  );

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.questionNumber}>
          Pregunta #{index + 1}
        </div>
        <div className={styles.questionType}>
          {question.question_type === 'multiple_choice' ? '📋 Múltiple' : '✅ V/F'}
        </div>
        <div className={styles.points}>
          {question.points_value} pts
        </div>
      </div>

      <div className={styles.cardBody}>
        <h4 className={styles.questionText}>{question.question_text}</h4>

        <div className={styles.options}>
          {question.options && question.options.length > 0 ? (
            question.options.map((option, idx) => {
              // Determinar si es la opción correcta
              // Esto es una simplificación - en producción deberías tener un campo is_correct
              const isCorrect = idx === 0; // Asumiendo que la primera es correcta por ahora

              return (
                <div
                  key={option.option_id}
                  className={`${styles.option} ${isCorrect ? styles.correctOption : ''}`}
                >
                  <span className={styles.optionLetter}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className={styles.optionText}>{option.option_text}</span>
                  {isCorrect && <span className={styles.correctBadge}>✓ Correcta</span>}
                </div>
              );
            })
          ) : (
            <div className={styles.noOptions}>Sin opciones disponibles</div>
          )}
        </div>
      </div>

      <div className={styles.cardActions}>
        <button
          onClick={() => onEdit(question)}
          className={styles.editButton}
        >
          ✏️ Editar
        </button>
        <button
          onClick={() => onDelete(question.question_id)}
          className={styles.deleteButton}
        >
          🗑️ Eliminar
        </button>
      </div>
    </div>
  );
}

