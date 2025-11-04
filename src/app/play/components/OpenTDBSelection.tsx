'use client';

import { useEffect, useState } from 'react';
import { validateOpenTDBForm } from '../utils/sessionHelpers';
import { transformOpenTDBQuestions } from '../utils/questionHelpers';
import styles from '../play.module.css';

interface OpenTDBSelectionProps {
  onStartGame: (triviaId: string) => void;
  onBack: () => void;
  loading: boolean;
}

export function OpenTDBSelection({
  onStartGame,
  onBack,
  loading,
}: OpenTDBSelectionProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    amount: 10,
    category: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    type: 'multiple' as 'multiple' | 'boolean',
  });
  const [tempAmount, setTempAmount] = useState<string>('10');
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

  const validateForm = () => {
    try {
      const numAmount = validateOpenTDBForm(tempAmount);
      setFormData(prev => ({ ...prev, amount: numAmount }));
      return true;
    } catch (err: any) {
      alert(err.message);
      return false;
    }
  };

  const handleCreateAndStart = async () => {
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
      const questionsData = transformOpenTDBQuestions(
        openTDBResponse.results,
        trivia.id
      );

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
              if (value !== '' && !isNaN(parseInt(value))) {
                setFormData({ ...formData, amount: Math.max(1, parseInt(value)) });
              }
            }}
            onBlur={() => {
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

