'use client';

import { useState, FormEvent } from 'react';
import { Category } from '@/types/game';
import { triviasService, CreateTriviaDto } from '@/services/trivias.service';
import styles from './CreateTriviaModal.module.css';

interface CreateTriviaModalProps {
  categories: Category[];
  onClose: () => void;
  onSuccess: (triviaId: string) => void;
}

export function CreateTriviaModal({
  categories,
  onClose,
  onSuccess,
}: CreateTriviaModalProps) {
  const [formData, setFormData] = useState<CreateTriviaDto>({
    title: '',
    category_id: categories[0]?.id || '',
    difficulty_level: 'medium',
    status: 'draft',
    is_public: true,
    time_limit_seconds: 30,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('El título es requerido');
      return;
    }

    if (!formData.category_id) {
      setError('Debes seleccionar una categoría');
      return;
    }

    try {
      setLoading(true);
      const newTrivia = await triviasService.createTrivia(formData);
      console.log('Nueva trivia creada:', newTrivia);
      
      // Verificar que tenemos un ID válido
      if (!newTrivia || !newTrivia.id) {
        setError('Error: No se recibió el ID de la trivia creada');
        setLoading(false);
        return;
      }
      
      // Pequeño delay para asegurar que el backend procesó todo
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Redirigir directamente a la página de edición para agregar preguntas
      onSuccess(newTrivia.id);
    } catch (err: any) {
      console.error('Error creando trivia:', err);
      setError(err.response?.data?.message || 'Error al crear la trivia');
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : type === 'number'
          ? parseInt(value) || 0
          : value,
    }));
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
          <h2>✨ Nueva Trivia</h2>
          <button onClick={onClose} className={styles.closeButton}>
            ✕
          </button>
        </div>

        <div className={styles.infoBox}>
          <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>💡</span>
          <span>
            Después de crear la trivia, serás redirigido para agregar las preguntas
          </span>
        </div>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Título */}
          <div className={styles.formGroup}>
            <label htmlFor="title">
              Título <span className={styles.required}>*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ej: Historia del Perú, Matemáticas Básicas..."
              required
              disabled={loading}
              maxLength={100}
            />
            <small className={styles.helpText}>
              {formData.title.length}/100 caracteres
            </small>
          </div>

          {/* Categoría */}
          <div className={styles.formGroup}>
            <label htmlFor="category_id">
              Categoría <span className={styles.required}>*</span>
            </label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Dificultad */}
          <div className={styles.formGroup}>
            <label htmlFor="difficulty_level">
              Dificultad <span className={styles.required}>*</span>
            </label>
            <select
              id="difficulty_level"
              name="difficulty_level"
              value={formData.difficulty_level}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="easy">🟢 Fácil</option>
              <option value="medium">🟡 Media</option>
              <option value="hard">🔴 Difícil</option>
            </select>
          </div>

          {/* Estado inicial */}
          <div className={styles.formGroup}>
            <label htmlFor="status">Estado inicial</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="draft">📝 Borrador (podrás publicar después)</option>
              <option value="published">✅ Publicada (visible de inmediato)</option>
            </select>
            <small className={styles.helpText}>
              Se recomienda crear como borrador y publicar después de agregar preguntas
            </small>
          </div>

          {/* Tiempo límite */}
          <div className={styles.formGroup}>
            <label htmlFor="time_limit_seconds">
              Tiempo límite por pregunta (segundos)
            </label>
            <input
              id="time_limit_seconds"
              name="time_limit_seconds"
              type="number"
              value={formData.time_limit_seconds || ''}
              onChange={handleChange}
              placeholder="30"
              min={10}
              max={300}
              disabled={loading}
            />
            <small className={styles.helpText}>
              Entre 10 y 300 segundos. Dejar vacío para sin límite.
            </small>
          </div>

          {/* Visibilidad */}
          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="is_public"
                checked={formData.is_public}
                onChange={(e) =>
                  setFormData({ ...formData, is_public: e.target.checked })
                }
                disabled={loading}
              />
              <span>🌐 Trivia pública (visible para todos los usuarios)</span>
            </label>
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
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Creando...' : '✨ Crear Trivia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

