'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { triviasService, UpdateTriviaDto } from '@/services/trivias.service';
import { questionsService, CreateQuestionDto } from '@/services/questions.service';
import { categoriesService } from '@/services/categories.service';
import { Trivia, Category, Question } from '@/types/game';
import { QuestionForm } from './components/QuestionForm';
import { QuestionCard } from './components/QuestionCard';
import styles from './edit.module.css';

export default function EditTriviaPage() {
  const router = useRouter();
  const params = useParams();
  const triviaId = params.id as string;
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [trivia, setTrivia] = useState<Trivia | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Edición de trivia
  const [editingTrivia, setEditingTrivia] = useState(false);
  const [triviaFormData, setTriviaFormData] = useState<UpdateTriviaDto>({});

  // Agregar/editar pregunta
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated && triviaId) {
      loadData();
    }
  }, [isAuthenticated, triviaId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Cargando trivia con ID:', triviaId);
      
      const [triviaData, categoriesData, questionsData] = await Promise.all([
        triviasService.getTriviaById(triviaId),
        categoriesService.getCategories(),
        questionsService.getQuestionsByTriviaId(triviaId),
      ]);
      
      console.log('Datos cargados:', { triviaData, categoriesData, questionsData });
      
      if (!triviaData) {
        setError('No se pudo cargar la trivia. Por favor, intenta nuevamente.');
        return;
      }
      
      setTrivia(triviaData);
      setCategories(categoriesData);
      setQuestions(questionsData);
      setTriviaFormData({
        title: triviaData.title,
        category_id: triviaData.category_id,
        difficulty_level: triviaData.difficulty_level,
        status: triviaData.status,
        is_public: triviaData.is_public,
        time_limit_seconds: triviaData.time_limit_seconds,
      });
    } catch (err: any) {
      console.error('Error cargando trivia:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Error al cargar los datos';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTrivia = async () => {
    if (!trivia) return;

    try {
      setSaving(true);
      await triviasService.updateTrivia(trivia.id, triviaFormData);
      await loadData();
      setEditingTrivia(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al actualizar la trivia');
    } finally {
      setSaving(false);
    }
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setShowQuestionForm(true);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setShowQuestionForm(true);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta pregunta?')) return;

    try {
      await questionsService.deleteQuestion(questionId);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar la pregunta');
    }
  };

  const handleQuestionSaved = async (savedQuestion?: Question) => {
    console.log('🎉 Pregunta guardada, actualizando estado local...', savedQuestion);
    setShowQuestionForm(false);
    setEditingQuestion(null);
    
    if (savedQuestion) {
      // Si recibimos la pregunta guardada, actualizarla directamente en el estado
      if (editingQuestion) {
        // Actualización: reemplazar la pregunta existente
        setQuestions(prevQuestions => 
          prevQuestions.map(q => 
            q.question_id === savedQuestion.question_id ? savedQuestion : q
          )
        );
        console.log('✅ Pregunta actualizada en el estado local');
      } else {
        // Nueva pregunta: agregarla al final
        setQuestions(prevQuestions => [...prevQuestions, savedQuestion]);
        console.log('✅ Nueva pregunta agregada al estado local');
      }
    } else {
      // Si no recibimos la pregunta (fallback), intentar recargar desde el backend
      console.log('⚠️ No se recibió la pregunta guardada, intentando recargar desde backend...');
      try {
        const questionsData = await questionsService.getQuestionsByTriviaId(triviaId);
        setQuestions(questionsData);
        console.log('✅ Preguntas recargadas desde backend:', questionsData.length);
      } catch (err: any) {
        console.error('❌ Error recargando preguntas desde backend:', err);
        // No mostrar error al usuario, la pregunta se guardó correctamente en el backend
        console.log('ℹ️ La pregunta se guardó en el backend pero no se pudo recargar la lista');
      }
    }
  };

  if (authLoading || loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!loading && !trivia && error) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button onClick={() => router.push('/my-trivias')} className={styles.backButton}>
              ← Volver a Mis Trivias
            </button>
            <h1>Error</h1>
          </div>
        </header>
        <main className={styles.main}>
          <div className={styles.errorAlert}>
            <h3>⚠️ Trivia no encontrada</h3>
            <p>{error}</p>
            <button onClick={() => router.push('/my-trivias')} className={styles.backButton}>
              ← Volver a Mis Trivias
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button onClick={() => router.push('/my-trivias')} className={styles.backButton}>
            ← Volver a Mis Trivias
          </button>
          <h1>Editar Trivia</h1>
        </div>
      </header>

      <main className={styles.main}>
        {error && (
          <div className={styles.errorAlert}>
            {error}
            <button onClick={() => setError('')}>✕</button>
          </div>
        )}

        {/* Sección de información de la trivia */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>📝 Información de la Trivia</h2>
            {!editingTrivia ? (
              <button
                onClick={() => setEditingTrivia(true)}
                className={styles.editButton}
              >
                ✏️ Editar
              </button>
            ) : (
              <div className={styles.editActions}>
                <button
                  onClick={() => {
                    setEditingTrivia(false);
                    setTriviaFormData({
                      title: trivia.title,
                      category_id: trivia.category_id,
                      difficulty_level: trivia.difficulty_level,
                      status: trivia.status,
                      is_public: trivia.is_public,
                      time_limit_seconds: trivia.time_limit_seconds,
                    });
                  }}
                  className={styles.cancelButton}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateTrivia}
                  className={styles.saveButton}
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : '💾 Guardar'}
                </button>
              </div>
            )}
          </div>

          <div className={styles.triviaInfo}>
            {!editingTrivia ? (
              <>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Título:</span>
                  <span className={styles.infoValue}>{trivia.title}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Categoría:</span>
                  <span className={styles.infoValue}>
                    {categories.find((c) => c.id === trivia.category_id)?.name || 'N/A'}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Dificultad:</span>
                  <span className={styles.infoValue}>
                    {trivia.difficulty_level === 'easy' && '🟢 Fácil'}
                    {trivia.difficulty_level === 'medium' && '🟡 Media'}
                    {trivia.difficulty_level === 'hard' && '🔴 Difícil'}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Estado:</span>
                  <span className={styles.infoValue}>
                    {trivia.status === 'draft' && '📝 Borrador'}
                    {trivia.status === 'published' && '✅ Publicada'}
                    {trivia.status === 'archived' && '📦 Archivada'}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Visibilidad:</span>
                  <span className={styles.infoValue}>
                    {trivia.is_public ? '🌐 Pública' : '🔒 Privada'}
                  </span>
                </div>
              </>
            ) : (
              <div className={styles.editForm}>
                <div className={styles.formGroup}>
                  <label>Título</label>
                  <input
                    type="text"
                    value={triviaFormData.title}
                    onChange={(e) =>
                      setTriviaFormData({ ...triviaFormData, title: e.target.value })
                    }
                    disabled={saving}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Categoría</label>
                  <select
                    value={triviaFormData.category_id}
                    onChange={(e) =>
                      setTriviaFormData({ ...triviaFormData, category_id: e.target.value })
                    }
                    disabled={saving}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Dificultad</label>
                  <select
                    value={triviaFormData.difficulty_level}
                    onChange={(e) =>
                      setTriviaFormData({
                        ...triviaFormData,
                        difficulty_level: e.target.value as any,
                      })
                    }
                    disabled={saving}
                  >
                    <option value="easy">🟢 Fácil</option>
                    <option value="medium">🟡 Media</option>
                    <option value="hard">🔴 Difícil</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Estado</label>
                  <select
                    value={triviaFormData.status}
                    onChange={(e) =>
                      setTriviaFormData({ ...triviaFormData, status: e.target.value as any })
                    }
                    disabled={saving}
                  >
                    <option value="draft">📝 Borrador</option>
                    <option value="published">✅ Publicada</option>
                    <option value="archived">📦 Archivada</option>
                  </select>
                </div>
                <div className={styles.checkboxGroup}>
                  <label>
                    <input
                      type="checkbox"
                      checked={triviaFormData.is_public}
                      onChange={(e) =>
                        setTriviaFormData({ ...triviaFormData, is_public: e.target.checked })
                      }
                      disabled={saving}
                    />
                    <span>🌐 Trivia pública</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Sección de preguntas */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>❓ Preguntas ({questions.length})</h2>
            <button onClick={handleAddQuestion} className={styles.addButton}>
              ➕ Agregar Pregunta
            </button>
          </div>

          {questions.length === 0 ? (
            <div className={styles.emptyQuestions}>
              <div className={styles.emptyIcon}>❓</div>
              <h3>No hay preguntas todavía</h3>
              <p>Agrega preguntas para que tu trivia esté completa</p>
              <button onClick={handleAddQuestion} className={styles.addButtonLarge}>
                ➕ Agregar Primera Pregunta
              </button>
            </div>
          ) : (
            <div className={styles.questionsList}>
              {questions.map((question, index) => (
                <QuestionCard
                  key={question.question_id}
                  question={question}
                  index={index}
                  onEdit={handleEditQuestion}
                  onDelete={handleDeleteQuestion}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Modal de agregar/editar pregunta */}
      {showQuestionForm && (
        <QuestionForm
          triviaId={triviaId}
          question={editingQuestion}
          onClose={() => {
            setShowQuestionForm(false);
            setEditingQuestion(null);
          }}
          onSuccess={handleQuestionSaved}
        />
      )}
    </div>
  );
}

