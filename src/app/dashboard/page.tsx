'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>TriviaTime</h1>
        <div className={styles.userInfo}>
          <span>Hola, {user.name}</span>
          <button onClick={logout} className={styles.logoutButton}>
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.welcomeCard}>
          <h2>Bienvenido a TriviaTime</h2>
          <p>Tu puntuación total: <strong>{user.total_score}</strong></p>
          <p>Rol: <strong>{user.role}</strong></p>
        </div>

        <div className={styles.infoBox}>
          <p>Esta es la página del dashboard. Aquí podrás ver tus trivias, estadísticas y más.</p>
          <p>La funcionalidad completa se implementará próximamente.</p>
        </div>
      </main>
    </div>
  );
}

