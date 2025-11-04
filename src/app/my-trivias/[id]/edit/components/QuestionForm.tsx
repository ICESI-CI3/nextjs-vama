'use client';

import { useState, FormEvent, useEffect } from 'react';
import { Question } from '@/types/game';
import { questionsService, CreateQuestionDto, UpdateQuestionDto } from '@/services/questions.service';
import styles from './QuestionForm.module.css';

interface QuestionFormProps {
  triviaId: string;
  question: Question | null;
  onClose: () => void;
  onSuccess: (savedQuestion?: Question) => void;
}

interface OptionData {
  text: string;
  is_correct: boolean;
}

export function QuestionForm({
  triviaId,
  question,
  onClose,
  onSuccess,
}: QuestionFormProps) {
  const isEditing = !!question;

  const [questionType, setQuestionType] = useState<'multiple_choice' | 'true_false'>(
    question?.question_type || 'multiple_choice'
  );
  const [questionText, setQuestionText] = useState(question?.question_text || '');
  const [pointsValue, setPointsValue] = useState(question?.points_value || 10);
  const [options, setOptions] = useState<OptionData[]>(
    question?.options && question.options.length > 0
      ? question.options.map((opt, idx) => ({
          text: opt.option_text,
          is_correct: idx === 0, // Simplificación: asume que la primera es correcta
        }))
      : [
          { text: '', is_correct: true },
          { text: '', is_correct: false },
          { text: '', is_correct: false },
          { text: '', is_correct: false },
        ]
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Actualizar opciones cuando cambia el tipo de pregunta
  useEffect(() => {
    if (questionType === 'true_false' && !isEditing) {
      setOptions([
        { text: 'Verdadero', is_correct: true },
        { text: 'Falso', is_correct: false },
      ]);
    } else if (questionType === 'multiple_choice' && !isEditing && options.length === 2) {
      setOptions([
        { text: '', is_correct: true },
        { text: '', is_correct: false },
        { text: '', is_correct: false },
        { text: '', is_correct: false },
      ]);
    }
  }, [questionType]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!questionText.trim()) {
      setError('El texto de la pregunta es requerido');
      return;
    }

    if (pointsValue < 1 || pointsValue > 100) {
      setError('Los puntos deben estar entre 1 y 100');
      return;
    }

    const validOptions = options.filter((opt) => opt.text.trim() !== '');
    
    if (validOptions.length < 2) {
      setError('Debes tener al menos 2 opciones');
      return;
    }

    const correctOptions = validOptions.filter((opt) => opt.is_correct);
    if (correctOptions.length !== 1) {
      setError('Debe haber exactamente una opción correcta');
      return;
    }

    try {
      setLoading(true);
      setError(''); // Limpiar errores previos

      let savedQuestion: Question;

      if (isEditing && question) {
        // Actualizar pregunta existente
        const updateDto: UpdateQuestionDto = {
          question_text: questionText,
          question_type: questionType,
          options: validOptions.map((opt) => ({
            text: opt.text,
            is_correct: opt.is_correct,
          })),
          correct_answer: correctOptions[0].text,
          points_value: pointsValue,
        };
        console.log('📝 Actualizando pregunta:', updateDto);
        savedQuestion = await questionsService.updateQuestion(question.question_id, updateDto);
        console.log('✅ Pregunta actualizada:', savedQuestion);
      } else {
        // Crear nueva pregunta
        const createDto: CreateQuestionDto = {
          trivia_id: triviaId,
          question_text: questionText,
          question_type: questionType,
          options: validOptions.map((opt) => ({
            text: opt.text,
            is_correct: opt.is_correct,
          })),
          correct_answer: correctOptions[0].text,
          points_value: pointsValue,
        };
        console.log('➕ Creando pregunta:', createDto);
        savedQuestion = await questionsService.createQuestion(createDto);
        console.log('✅ Pregunta creada:', savedQuestion);
      }

      // Esperar un momento para que el backend procese completamente
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('🔄 Cerrando formulario y pasando pregunta al componente padre...');
      onSuccess(savedQuestion);
    } catch (err: any) {
      console.error('❌ Error guardando pregunta:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Error al guardar la pregunta';
      setError(errorMessage);
      
      // No cerrar el modal para que el usuario vea el error y pueda reintentar
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index].text = text;
    setOptions(newOptions);
  };

  const handleCorrectOptionChange = (index: number) => {
    const newOptions = options.map((opt, idx) => ({
      ...opt,
      is_correct: idx === index,
    }));
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, { text: '', is_correct: false }]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, idx) => idx !== index);
      // Si eliminamos la opción correcta, hacer correcta la primera
      if (options[index].is_correct && newOptions.length > 0) {
        newOptions[0].is_correct = true;
      }
      setOptions(newOptions);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{isEditing ? '✏️ Editar Pregunta' : '➕ Nueva Pregunta'}</h2>
          <button onClick={onClose} className={styles.closeButton}>
            ✕
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Tipo de pregunta */}
          <div className={styles.formGroup}>
            <label htmlFor="question_type">
              Tipo de pregunta <span className={styles.required}>*</span>
            </label>
            <select
              id="question_type"
              value={questionType}
              onChange={(e) =>
                setQuestionType(e.target.value as 'multiple_choice' | 'true_false')
              }
              disabled={loading}
            >
              <option value="multiple_choice">📋 Múltiple opción</option>
              <option value="true_false">✅ Verdadero/Falso</option>
            </select>
          </div>

          {/* Texto de la pregunta */}
          <div className={styles.formGroup}>
            <label htmlFor="question_text">
              Pregunta <span className={styles.required}>*</span>
            </label>
            <textarea
              id="question_text"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Escribe tu pregunta aquí..."
              required
              disabled={loading}
              rows={3}
              maxLength={500}
            />
            <small className={styles.helpText}>
              {questionText.length}/500 caracteres
            </small>
          </div>

          {/* Puntos */}
          <div className={styles.formGroup}>
            <label htmlFor="points_value">
              Puntos <span className={styles.required}>*</span>
            </label>
            <input
              id="points_value"
              type="number"
              value={pointsValue}
              onChange={(e) => setPointsValue(parseInt(e.target.value) || 0)}
              min={1}
              max={100}
              required
              disabled={loading}
            />
            <small className={styles.helpText}>Entre 1 y 100 puntos</small>
          </div>

          {/* Opciones */}
          <div className={styles.optionsSection}>
            <div className={styles.optionsSectionHeader}>
              <label>
                Opciones <span className={styles.required}>*</span>
              </label>
              {questionType === 'multiple_choice' && options.length < 6 && (
                <button
                  type="button"
                  onClick={addOption}
                  className={styles.addOptionButton}
                  disabled={loading}
                >
                  ➕ Agregar opción
                </button>
              )}
            </div>

            <div className={styles.optionsList}>
              {options.map((option, index) => (
                <div key={index} className={styles.optionItem}>
                  <div className={styles.optionHeader}>
                    <label className={styles.radioLabel}>
                      <input
                        type="radio"
                        name="correct_option"
                        checked={option.is_correct}
                        onChange={() => handleCorrectOptionChange(index)}
                        disabled={loading}
                      />
                      <span className={styles.optionLetter}>
                        {questionType === 'true_false'
                          ? index === 0
                            ? 'V'
                            : 'F'
                          : String.fromCharCode(65 + index)}
                      </span>
                      <span className={styles.correctLabel}>
                        {option.is_correct ? '✓ Correcta' : 'Incorrecta'}
                      </span>
                    </label>
                    {questionType === 'multiple_choice' && options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className={styles.removeOptionButton}
                        disabled={loading}
                        title="Eliminar opción"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={
                      questionType === 'true_false'
                        ? index === 0
                          ? 'Verdadero'
                          : 'Falso'
                        : `Opción ${String.fromCharCode(65 + index)}`
                    }
                    disabled={loading || questionType === 'true_false'}
                    className={styles.optionInput}
                    required
                  />
                </div>
              ))}
            </div>
            <small className={styles.helpText}>
              Marca con el círculo cuál es la respuesta correcta
            </small>
          </div>

          {/* Acciones */}
          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={loading}
            >
              Cancelar
            </button>
            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? 'Guardando...' : isEditing ? '💾 Guardar Cambios' : '➕ Agregar Pregunta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

