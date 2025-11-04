'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { usersService } from '@/services/users.service';
import { UpdateUserDto } from '@/types/auth';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout, refreshUser } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    profile_image: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleEditProfile = () => {
    if (!user) return;
    setFormData({
      name: user.name,
      email: user.email,
      profile_image: user.profile_image || '',
    });
    setShowEditModal(true);
    setError('');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setError('');

    try {
      const updateDto: UpdateUserDto = {
        name: formData.name,
        email: formData.email,
        profile_image: formData.profile_image || undefined,
      };

      await usersService.updateUser(user.id, updateDto);
      // Actualizar el usuario en el store
      await refreshUser();
      setShowEditModal(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setError('');
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      profile_image: user?.profile_image || '',
    });
  };

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

        {/* Botones principales del dashboard */}
        <div className={styles.actionsGrid}>
          <button className={styles.actionCard} onClick={() => router.push('/play')}>
            <div className={styles.actionIcon}>🎮</div>
            <h3>Jugar Trivias</h3>
            <p>Explora y juega trivias disponibles</p>
          </button>

          <button className={styles.actionCard} onClick={() => {}}>
            <div className={styles.actionIcon}>📊</div>
            <h3>Mis Sesiones</h3>
            <p>Historial de tus partidas y sesiones</p>
          </button>

          <button
            className={styles.actionCard}
            onClick={() => router.push('/rankings')}
          >
            <div className={styles.actionIcon}>🏆</div>
            <h3>Rankings</h3>
            <p>Clasificaciones globales y por categoría</p>
          </button>


          <button className={styles.actionCard} onClick={handleEditProfile}>
            <div className={styles.actionIcon}>👤</div>
            <h3>Mi Perfil</h3>
            <p>Ver y editar tu información personal</p>
          </button>

          <button className={styles.actionCard} onClick={() => {}}>
            <div className={styles.actionIcon}>📝</div>
            <h3>Mis Trivias</h3>
            <p>Gestiona las trivias que has creado</p>
          </button>
        </div>
      </main>

      {/* Modal de editar perfil */}
      {showEditModal && (
        <div className={styles.modalOverlay} onClick={handleCancelEdit}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Editar Perfil</h3>
            {error && (
              <div className={styles.error}>
                {error}
              </div>
            )}
            <form onSubmit={handleSaveProfile}>
              <div className={styles.formGroup}>
                <label htmlFor="edit-name">Nombre</label>
                <input
                  id="edit-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={saving}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="edit-email">Email</label>
                <input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={saving}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="edit-profile-image">Imagen de perfil (URL)</label>
                <input
                  id="edit-profile-image"
                  type="url"
                  value={formData.profile_image}
                  onChange={(e) => setFormData({ ...formData, profile_image: e.target.value })}
                  placeholder="https://example.com/imagen.jpg"
                  disabled={saving}
                />
              </div>
              <div className={styles.modalActions}>
                <button type="submit" className={styles.saveButton} disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
                <button type="button" onClick={handleCancelEdit} className={styles.cancelButton} disabled={saving}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

