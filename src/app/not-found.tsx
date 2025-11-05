'use client';

import { useRouter } from 'next/navigation';
import styles from './not-found.module.css';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.iconContainer}>
          <span className={styles.icon}>🔍</span>
          <span className={styles.number}>404</span>
        </div>
        
        <h1 className={styles.title}>Página no encontrada</h1>
        
        <p className={styles.message}>
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>

        <div className={styles.suggestions}>
          <p className={styles.suggestionsTitle}>Prueba con:</p>
          <ul className={styles.suggestionsList}>
            <li>Verificar que la URL esté escrita correctamente</li>
            <li>Volver a la página anterior</li>
            <li>Ir al inicio y buscar desde allí</li>
          </ul>
        </div>

        <div className={styles.actions}>
          <button
            onClick={() => router.back()}
            className={styles.secondaryButton}
          >
            ← Volver atrás
          </button>
          
          <button
            onClick={() => router.push('/dashboard')}
            className={styles.primaryButton}
          >
            🏠 Ir al inicio
          </button>
        </div>
      </div>
    </div>
  );
}

