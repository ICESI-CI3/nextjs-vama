'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getDashboardRoute } from '@/lib/utils';
import styles from '../login/login.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const { user, register, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
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

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Validar longitud mínima de contraseña
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
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
        'Error al registrar. Intenta nuevamente.'
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
        <h1 className={styles.title}>Crear Cuenta</h1>
        <p className={styles.subtitle}>Únete a TriviaTime</p>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="name">Nombre completo</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Juan Pérez"
              disabled={isLoading}
            />
          </div>

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
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              disabled={isLoading}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword">Confirmar contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Repite tu contraseña"
              minLength={6}
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            ¿Ya tienes una cuenta?{' '}
            <a href="/auth/login" className={styles.link}>
              Inicia sesión aquí
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

