'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { rankingsService } from '@/services/rankings.service';
import { categoriesService } from '@/services/categories.service';
import styles from './rankings.module.css';

// Imagen por defecto en formato data URI SVG
const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23e2e8f0'/%3E%3Cpath d='M50 30c-8.3 0-15 6.7-15 15 0 8.3 6.7 15 15 15s15-6.7 15-15c0-8.3-6.7-15-15-15zm0 40c-11 0-20 4.5-20 10v5h40v-5c0-5.5-9-10-20-10z' fill='%2394a3b8'/%3E%3C/svg%3E";

const getDefaultAvatar = () => DEFAULT_AVATAR;

const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = e.target as HTMLImageElement;
  if (target.src !== DEFAULT_AVATAR) {
    target.src = DEFAULT_AVATAR;
  }
};

export default function RankingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [rankings, setRankings] = useState<any[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('global');
  const [userRanking, setUserRanking] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const [page] = useState<number>(1);
  const limit = 50;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isLoading) return;
    fetchAll();
  }, [selectedCategory, user?.id, isLoading]);

  const extractPlayers = (resp: any) => {
    if (resp == null) return { players: [], last_updated: null };
    if (resp.success && resp.data) {
      const players = resp.data.top_players ?? resp.data;
      const last = resp.data.last_updated ?? null;
      return { players: Array.isArray(players) ? players : [], last_updated: last };
    }
    
    if (resp.data && Array.isArray(resp.data.top_players)) {
      return { players: resp.data.top_players, last_updated: resp.data.last_updated ?? null };
    }
   
    if (Array.isArray(resp)) {
      return { players: resp, last_updated: null };
    }
   
    if (resp.top_players && Array.isArray(resp.top_players)) {
      return { players: resp.top_players, last_updated: resp.last_updated ?? null };
    }
    return { players: [], last_updated: null };
  };

  const fetchAll = async () => {
    setLoading(true);
    setError('');

    try {
      // Cargar categorías 
      try {
        const cats = await categoriesService.getCategories();
        if (Array.isArray(cats)) setCategories(cats);
      } catch (err) {
      }

      // Cargar ranking global o por categoría
      let resp: any = null;

      if (selectedCategory === 'global') {
        
        try {
          resp = await rankingsService.getGlobalRanking(page, limit);
        } catch (errGlobalPag) {
          
          try {
            resp = await rankingsService.getGlobalRanking();
          } catch (errGlobal) {
            
            resp = null;
          }
        }
      } else {
        
        try {
          if (typeof rankingsService.getCategoryRanking === 'function') {
            resp = await rankingsService.getCategoryRanking(selectedCategory, page, limit);
          } else {
           
            if (typeof rankingsService.getCategoryRanking === 'function') {
              resp = await rankingsService.getCategoryRanking(selectedCategory);
            } else {
              throw new Error('El servicio de rankings no expone métodos para ranking por categoría');
            }
          }
        } catch (err) {
          
          try {
            if (!resp) {
              if (typeof rankingsService.getCategoryRanking === 'function') {
                resp = await rankingsService.getCategoryRanking(selectedCategory);
              } 
            }
          } catch (err2) {
            resp = null;
          }
        }
      }

      const normalized = extractPlayers(resp);
      setRankings(normalized.players || []);
      setLastUpdated(normalized.last_updated || null);

      // Cargar posición del usuario 
      if (user?.id) {
        try {
          let ur: any = null;
          try {
            ur = await rankingsService.getUserRanking(String(user.id));
          } catch (e1) {
            try {
              ur = await rankingsService.getUserRanking(user.id);
            } catch (e2) {
              ur = null;
            }
          }
          
          if (ur) {
            if (ur.success && ur.data) setUserRanking(ur.data);
            else setUserRanking(ur.data ?? ur);
          }
        } catch (err) {
       
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Error al cargar los rankings');
    } finally {
      setLoading(false);
    }
  };

  const topThree = useMemo(() => rankings.slice(0, 3), [rankings]);
  const others = useMemo(() => rankings.slice(3), [rankings]);

  if (isLoading || loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Rankings</h1>
          <div className={styles.userInfo}>
            <span>{user ? `Hola, ${user.name}` : 'Cargando...'}</span>
          </div>
        </div>
        <main className={styles.main}>
          <p>Cargando rankings...</p>
        </main>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Rankings</h1>
        <div className={styles.userInfo}>
          <span>Hola, {user.name}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => router.push('/dashboard')} className={styles.smallButton}>
              Volver
            </button>
            <button onClick={logout} className={styles.smallLogout}>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.controls}>
          <div className={styles.selectWrap}>
            <label htmlFor="category-select">Ver:</label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="global">Global</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.meta}>
            {lastUpdated && (
              <small>Última actualización: {new Date(lastUpdated).toLocaleString()}</small>
            )}
            <button onClick={fetchAll} className={styles.refreshButton}>
               Refrescar
            </button>
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}
{/* Si no hay jugadores */}
{rankings.length === 0 ? (
  <div className={styles.noPlayers}>
    <p>No hay jugadores en esta categoría.</p>
  </div>
) : (
  <>
    <section className={styles.topSection}>
      <div className={styles.topLeft}>
        <h2>Top 3</h2>
        <div className={styles.topGrid}>
          {topThree.map((p, idx) => (
            <div
              key={String(p.user_id)}
              className={`${styles.topCard} ${styles[`place${idx + 1}`]}`}
            >
              <div className={styles.rankBadge}>#{p.position}</div>
              <img
                src={p.profile_image || getDefaultAvatar()}
                alt={p.username}
                className={styles.avatarLarge}
                onClick={() => router.push(`/profile/${p.user_id}`)}
                onError={handleImageError}
              />
              <h3>{p.username}</h3>
              <p className={styles.score}>
                {p.total_score?.toLocaleString?.() ?? p.total_score} pts
              </p>
            </div>
          ))}
        </div>
      </div>

      <aside className={styles.userCard}>
        <h3>Tu posición</h3>
        {userRanking ? (
          <div>
            <div className={styles.userRow}>
              <img
                src={
                  userRanking.user?.profile_image ??
                  userRanking.profile_image ??
                  getDefaultAvatar()
                }
                alt={userRanking.user?.username ?? userRanking.username}
                className={styles.avatar}
                onError={handleImageError}
              />
              <div>
                <strong>{userRanking.user?.username ?? userRanking.username}</strong>
                <div className={styles.smallMuted}>
                  Puntaje:{' '}
                  {userRanking.global_ranking?.total_score ??
                    userRanking.total_score ??
                    '—'}
                </div>
              </div>
            </div>

            <div className={styles.stats}>
              <div>
                Posición:{' '}
                <strong>
                  {userRanking.global_ranking?.position ??
                    userRanking.position ??
                    '—'}
                </strong>
              </div>
              <div>
                Partidas:{' '}
                <strong>
                  {userRanking.global_ranking?.games_played ??
                    userRanking.games_played ??
                    '—'}
                </strong>
              </div>
              <div>
                % Vict:{' '}
                <strong>
                  {userRanking.global_ranking?.win_percentage ??
                    userRanking.win_percentage ??
                    '—'}
                </strong>
              </div>
            </div>

            {Array.isArray(userRanking.category_rankings) &&
              userRanking.category_rankings.length > 0 && (
                <>
                  <h4>  </h4>
                  <h4>Por categoría:</h4>
                  <ul className={styles.categoryList}>
                    {userRanking.category_rankings.map((cr: any) => (
                      <li key={cr.category_id ?? cr.id}>
                        {cr.category_name ?? cr.name}: #{cr.position ?? '—'} —{' '}
                        {cr.total_score ?? 0} pts
                      </li>
                    ))}
                  </ul>
                </>
              )}
          </div>
        ) : (
          <p className={styles.smallMuted}>Sin datos personales en ranking.</p>
        )}
      </aside>
    </section>

    <section className={styles.listSection}>
      <h3>Posiciones</h3>
      <div className={styles.listHeader}>
        <span>Posición</span>
        <span>Jugador</span>
        <span className={styles.desktopOnly}>Partidas</span>
        <span>Puntaje</span>
      </div>

      <ul className={styles.rankingList}>
      {rankings.map((p) => (
        <li
          key={String(p.user_id)}
          className={styles.rankingItem}
          onClick={() => router.push(`/profile/${p.user_id}`)}
        >
          <div className={styles.pos}>#{p.position}</div>
          <div className={styles.playerInfo}>
            <img
              src={p.profile_image || getDefaultAvatar()}
              alt={p.username}
              className={styles.avatarSmall}
              onError={handleImageError}
            />
            <div>
              <div className={styles.playerName}>{p.username}</div>
              <div className={styles.smallMuted}>
                {p.win_percentage ? `${p.win_percentage}% vict.` : ''}
              </div>
            </div>
          </div>
          <div className={`${styles.desktopOnly} ${styles.center}`}>
            {p.games_played ?? '—'}
          </div>
          <div className={styles.scoreCol}>
            {p.total_score?.toLocaleString?.() ?? p.total_score}
          </div>
        </li>
      ))}
    </ul>
    </section>
  </>
)}
</main>
</div>
);
}