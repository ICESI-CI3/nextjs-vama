'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/Toast/ToastContainer';
import { triviasService } from '@/services/trivias.service';
import { categoriesService } from '@/services/categories.service';
import { Trivia, Category } from '@/types/game';
import { TriviaCard } from './components/TriviaCard';
import { CreateTriviaModal } from './components/CreateTriviaModal';
import styles from './my-trivias.module.css';

export default function MyTriviasPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const toast = useToast();
  
  const [trivias, setTrivias] = useState<Trivia[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Filtros
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Cargar trivias y categorías por separado para mejor manejo de errores
      let triviasData: Trivia[] = [];
      let categoriesData: Category[] = [];
      
      try {
        triviasData = await triviasService.getMyTrivias();
      } catch (triviaErr: any) {
        console.error('Error cargando trivias:', triviaErr);
        // No bloqueamos la carga de categorías si fallan las trivias
      }
      
      try {
        categoriesData = await categoriesService.getCategories();
      } catch (catErr: any) {
        console.error('Error cargando categorías:', catErr);
        setError('No se pudieron cargar las categorías. Intenta recargar la página.');
      }
      
      setTrivias(triviasData);
      setCategories(categoriesData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrivia = () => {
    setShowCreateModal(true);
  };

  const handleTriviaCreated = (triviaId: string) => {
    setShowCreateModal(false);
    // Redirigir directamente a la página de edición para agregar preguntas
    router.push(`/my-trivias/${triviaId}/edit`);
  };

  const handleEditTrivia = (triviaId: string) => {
    router.push(`/my-trivias/${triviaId}/edit`);
  };

  const handleDeleteTrivia = async (triviaId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta trivia? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await triviasService.deleteTrivia(triviaId);
      loadData();
      toast.success('Trivia eliminada exitosamente');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al eliminar la trivia');
    }
  };

  const handlePublishTrivia = async (triviaId: string) => {
    try {
      await triviasService.publishTrivia(triviaId);
      loadData();
      toast.success('¡Trivia publicada exitosamente!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al publicar la trivia');
    }
  };

  const handleArchiveTrivia = async (triviaId: string) => {
    try {
      await triviasService.archiveTrivia(triviaId);
      loadData();
      toast.success('Trivia archivada exitosamente');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al archivar la trivia');
    }
  };

  // Filtrar trivias
  const filteredTrivias = trivias.filter((trivia) => {
    const matchesStatus = filterStatus === 'all' || trivia.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      trivia.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Estadísticas
  const stats = {
    total: trivias.length,
    published: trivias.filter(t => t.status === 'published').length,
    draft: trivias.filter(t => t.status === 'draft').length,
    archived: trivias.filter(t => t.status === 'archived').length,
  };

  if (authLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Cargando...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Mis Trivias</h1>
        <div className={styles.headerActions}>
          <button onClick={() => router.push('/dashboard')} className={styles.backButton}>
            ← Volver
          </button>
          <button onClick={logout} className={styles.logoutButton}>
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className={styles.main}>
        {/* Estadísticas */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📚</div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stats.total}</div>
              <div className={styles.statLabel}>Total</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>✅</div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stats.published}</div>
              <div className={styles.statLabel}>Publicadas</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📝</div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stats.draft}</div>
              <div className={styles.statLabel}>Borradores</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📦</div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stats.archived}</div>
              <div className={styles.statLabel}>Archivadas</div>
            </div>
          </div>
        </div>

        {/* Barra de acciones */}
        <div className={styles.actionsBar}>
          <div className={styles.filtersSection}>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="🔍 Buscar trivia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className={styles.filterSelect}
            >
              <option value="all">Todos los estados</option>
              <option value="published">Publicadas</option>
              <option value="draft">Borradores</option>
              <option value="archived">Archivadas</option>
            </select>
          </div>
          <button onClick={handleCreateTrivia} className={styles.createButton}>
            ➕ Nueva Trivia
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className={styles.error}>
            {error}
            <button onClick={() => setError('')}>✕</button>
          </div>
        )}

        {/* Lista de trivias */}
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Cargando tus trivias...</p>
          </div>
        ) : filteredTrivias.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📝</div>
            <h3>
              {searchTerm || filterStatus !== 'all'
                ? 'No se encontraron trivias'
                : '¡Crea tu primera trivia!'}
            </h3>
            <p>
              {searchTerm || filterStatus !== 'all'
                ? 'Prueba con otros filtros o búsqueda'
                : 'Comparte tu conocimiento creando trivias para que otros usuarios jueguen'}
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <button onClick={handleCreateTrivia} className={styles.createButtonLarge}>
                ➕ Crear Primera Trivia
              </button>
            )}
          </div>
        ) : (
          <div className={styles.triviasGrid}>
            {filteredTrivias.map((trivia) => (
              <TriviaCard
                key={trivia.id}
                trivia={trivia}
                categories={categories}
                onEdit={handleEditTrivia}
                onDelete={handleDeleteTrivia}
                onPublish={handlePublishTrivia}
                onArchive={handleArchiveTrivia}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal de crear trivia */}
      {showCreateModal && (
        <CreateTriviaModal
          categories={categories}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleTriviaCreated}
        />
      )}
    </div>
  );
}

