'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './reports.module.css';
import { ReportsData, GeneralStats, TopPlayer, PopularTrivia } from '@/types/reports';
import { getGeneralStats, getTopPlayers, getPopularTrivias } from '@/services/reports.service';

export default function StatsPage() {
  const [data, setData] = useState<ReportsData>({
    generalStats: null,
    topPlayers: [],
    popularTrivias: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  // --- Función para cargar los datos ---
  const fetchReports = async () => {
    setLoading(true);
    setError('');

    try {
      const [generalStats, topPlayersRes, popularTriviasRes] = await Promise.all([
        getGeneralStats(),
        getTopPlayers(10),
        getPopularTrivias(10),
      ]);

      const topPlayers: TopPlayer[] = topPlayersRes.map((p) => ({
        user_id: p.user_id,
        username: p.username,
        profile_image: p.profile_image,
        total_score: p.total_score,
        games_played: p.games_played,
        games_completed: p.games_completed,
        avg_score: p.avg_score,
        completion_rate: p.completion_rate,
      }));

      const popularTrivias: PopularTrivia[] = popularTriviasRes.map((t) => ({
        trivia_id: t.trivia_id,
        title: t.title,
        category: t.category,
        difficulty: t.difficulty,
        plays_count: t.plays_count,
        completions_count: t.completions_count,
        avg_score: t.avg_score,
        completion_rate: t.completion_rate,
        created_by: t.created_by,
      }));

      setData({ generalStats, topPlayers, popularTrivias });
    } catch (err: any) {
      console.error('Error al cargar reportes:', err);
      setError('Error al cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  // --- useEffect para cargar al inicio ---
  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) return <p className={styles.loading}>Cargando estadísticas...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.headerTitle}> Panel de Reportes</h1>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className={styles.smallButton}
          >
            Volver
          </button>

          <button
            onClick={() => fetchReports()}
            className={styles.smallButton}
            disabled={loading}
          >
            {loading ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>
      </header>

      {/* --- General Stats --- */}
      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Usuarios</p>
            <h2 className={styles.statValue}>{data.generalStats?.totalUsers ?? 0}</h2>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Trivias</p>
            <h2 className={styles.statValue}>{data.generalStats?.totalTrivias ?? 0}</h2>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Sesiones</p>
            <h2 className={styles.statValue}>{data.generalStats?.totalSessions ?? 0}</h2>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Promedio Puntaje</p>
            <h2 className={styles.statValue}>
              {data.generalStats?.avgScore?.toFixed(1) ?? 0}
            </h2>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Tasa de Completado</p>
            <h2 className={styles.statValue}>
              {data.generalStats?.avgCompletionRate?.toFixed(1) ?? 0}%
            </h2>
          </div>
        </div>
      </section>

      {/* --- Top Players --- */}
      <section className={styles.chartContainer}>
        <h2 className={styles.chartTitle}> Top Jugadores</h2>
        {!data.topPlayers.length ? (
          <p>No hay datos disponibles</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Jugador</th>
                <th>Puntaje Total</th>
                <th>Partidas</th>
                <th>Completadas</th>
                <th>Promedio</th>
              </tr>
            </thead>
            <tbody>
              {data.topPlayers.map((p) => (
                <tr key={p.user_id}>
                  <td className={styles.playerCell}>
                    {p.profile_image && (
                      <img
                        src={p.profile_image}
                        alt={p.username}
                        className={styles.playerAvatar}
                      />
                    )}
                    {p.username}
                  </td>
                  <td>{p.total_score}</td>
                  <td>{p.games_played}</td>
                  <td>{p.games_completed}</td>
                  <td>{p.avg_score?.toFixed(1) ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* --- Popular Trivias --- */}
      <section className={styles.chartContainer}>
        <h2 className={styles.chartTitle}> Trivias Más Populares</h2>
        {!data.popularTrivias.length ? (
          <p>No hay datos disponibles</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Título</th>
                <th>Categoría</th>
                <th>Dificultad</th>
                <th>Jugadas</th>
                <th>Completadas</th>
                <th>Promedio</th>
              </tr>
            </thead>
            <tbody>
              {data.popularTrivias.map((t) => (
                <tr key={t.trivia_id}>
                  <td>{t.title}</td>
                  <td>{t.category}</td>
                  <td>{t.difficulty}</td>
                  <td>{t.plays_count}</td>
                  <td>{t.completions_count}</td>
                  <td>{t.avg_score?.toFixed(1) ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
