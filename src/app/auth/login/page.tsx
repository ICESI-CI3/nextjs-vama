'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getDashboardRoute } from '@/lib/utils';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { user, login, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Si ya está autenticado, redirigir al dashboard según su rol
  if (isAuthenticated && user) {
    router.push(getDashboardRoute(user));
    return null;
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(formData);
      // Usar useAuthStore directamente para obtener el usuario actualizado
      const { useAuthStore } = await import('@/stores/authStore');
      const store = useAuthStore.getState();
      if (store.user) {
        router.push(getDashboardRoute(store.user));
      } else {
        // Fallback: leer desde localStorage si el store aún no se actualizó
        const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
        router.push(getDashboardRoute(storedUser));
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        err.message || 
        'Error al iniciar sesión. Verifica tus credenciales.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Iniciar Sesión</h1>
        <p className={styles.subtitle}>Bienvenido a TriviaTime</p>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="tu@email.com"
              disabled={isLoading}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            ¿No tienes una cuenta?{' '}
            <a href="/auth/register" className={styles.link}>
              Regístrate aquí
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

