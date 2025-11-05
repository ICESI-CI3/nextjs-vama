'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './error.module.css';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log del error para debugging
    console.error('Error capturado:', error);
  }, [error]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.iconContainer}>
          <span className={styles.icon}>⚠️</span>
        </div>
        
        <h1 className={styles.title}>¡Oops! Algo salió mal</h1>
        
        <p className={styles.message}>
          Lo sentimos, ha ocurrido un error inesperado. No te preocupes, nuestro equipo ha sido notificado.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <details className={styles.errorDetails}>
            <summary>Detalles del error (solo en desarrollo)</summary>
            <pre className={styles.errorMessage}>{error.message}</pre>
            {error.stack && (
              <pre className={styles.errorStack}>{error.stack}</pre>
            )}
          </details>
        )}

        <div className={styles.actions}>
          <button
            onClick={reset}
            className={styles.primaryButton}
          >
            🔄 Intentar de nuevo
          </button>
          
          <button
            onClick={() => router.push('/dashboard')}
            className={styles.secondaryButton}
          >
            🏠 Volver al inicio
          </button>
        </div>

        <p className={styles.helpText}>
          Si el problema persiste, contacta al soporte técnico.
        </p>
      </div>
    </div>
  );
}

