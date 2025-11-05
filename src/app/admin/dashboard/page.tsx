'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/Toast/ToastContainer';
import { usersService } from '@/services/users.service';
import { User, UpdateUserDto, ChangeRoleDto } from '@/types/auth';
import styles from './admin-dashboard.module.css';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Estados para búsqueda, filtros y paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'player'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;


  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || user?.role !== 'admin') {
        router.push('/dashboard');
      } else {
        loadUsers();
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await usersService.getUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (id: string, dto: UpdateUserDto) => {
    try {
      setActionLoading(id);
      await usersService.updateUser(id, dto);
      await loadUsers();
      setEditingUser(null);
      toast.success('Usuario actualizado exitosamente');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al actualizar usuario');
    } finally {
      setActionLoading(null);
    }
  };


  const handleDeleteUser = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

    try {
      setActionLoading(id);
      await usersService.deleteUser(id);
      await loadUsers();
      toast.success('Usuario eliminado exitosamente');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al eliminar usuario');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleActive = async (userToToggle: User) => {
    try {
      setActionLoading(userToToggle.id);
      const wasActive = userToToggle.is_active;
      if (userToToggle.is_active) {
        await usersService.deactivateUser(userToToggle.id);
      } else {
        await usersService.activateUser(userToToggle.id);
      }
      await loadUsers();
      toast.success(`Usuario ${wasActive ? 'desactivado' : 'activado'} exitosamente`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al cambiar estado del usuario');
    } finally {
      setActionLoading(null);
    }
  };

  const handleChangeRole = async (id: string, role: 'player' | 'admin') => {
    try {
      setActionLoading(id);
      await usersService.changeUserRole(id, { role });
      await loadUsers();
      setShowRoleModal(null);
      toast.success('Rol actualizado exitosamente');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al cambiar rol');
    } finally {
      setActionLoading(null);
    }
  };

  // Filtrar y buscar usuarios
  const filteredUsers = users.filter((u) => {
    // Filtro de búsqueda (nombre o email)
    const matchesSearch = 
      searchTerm === '' ||
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtro por rol
    const matchesRole = 
      filterRole === 'all' || u.role === filterRole;

    // Filtro por estado
    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'active' && u.is_active) ||
      (filterStatus === 'inactive' && !u.is_active);

    return matchesSearch && matchesRole && matchesStatus;

  });

  // Paginación
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRole, filterStatus]);

  if (isLoading || loading) {
    return (
      <div className={styles.container}>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Panel de Administración</h1>
          <h2 className={styles.subtitle}>Gestión de Usuarios</h2>
        </div>
        <div className={styles.headerActions}>
          <button onClick={loadUsers} className={styles.refreshButton}>
             Actualizar
          </button>
          <button onClick={logout} className={styles.logoutButton}>
            Cerrar Sesión
          </button>
        </div>
      </header>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      

      {/* Barra de búsqueda y filtros */}
      <div className={styles.filtersContainer}>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="🔍 Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filters}>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as 'all' | 'admin' | 'player')}
            className={styles.filterSelect}
          >
            <option value="all">Todos los roles</option>
            <option value="admin">Admin</option>
            <option value="player">Player</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
            className={styles.filterSelect}
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
      </div>

     
      <section className={styles.reportsSection}>
        <h2 className={styles.subtitle}>Reportes y estadísticas</h2>
        <div className={styles.reportsGrid}>
          <div className={styles.reportCard} onClick={() => router.push('/reports')}>
            <div className={styles.reportIcon}>📈</div>
            <h3>Reportes</h3>
            <p>Desempeño y métricas</p>
          </div>
          </div>
      </section>


      {/* Información de resultados */}
      <div className={styles.resultsInfo}>
        <span>
          Mostrando {paginatedUsers.length} de {filteredUsers.length} usuarios
          {filteredUsers.length !== users.length && ` (filtrados de ${users.length} total)`}
        </span>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Puntuación</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.emptyState}>
                  {users.length === 0 
                    ? 'No hay usuarios registrados' 
                    : 'No se encontraron usuarios con los filtros aplicados'}
                </td>
              </tr>
            ) : (
              paginatedUsers.map((u) => (
                <tr key={u.id} className={u.is_active === false ? styles.inactiveRow : ''}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={u.role === 'admin' ? styles.adminBadge : styles.playerBadge}>
                      {u.role}
                    </span>
                  </td>
                  <td>{u.total_score}</td>
                  <td>
                    <span className={u.is_active ? styles.activeBadge : styles.inactiveBadge}>
                      {u.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button
                        onClick={() => setEditingUser(u)}
                        className={styles.editButton}
                        disabled={actionLoading === u.id}
                      >
                         Editar
                      </button>
                      <button
                        onClick={() => handleToggleActive(u)}
                        className={u.is_active ? styles.deactivateButton : styles.activateButton}
                        disabled={actionLoading === u.id}
                      >
                        {actionLoading === u.id ? '...' : u.is_active ? ' Desactivar' : ' Activar'}
                      </button>
                      <button
                        onClick={() => setShowRoleModal(u)}
                        className={styles.roleButton}
                        disabled={actionLoading === u.id}
                      >
                         Rol
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className={styles.deleteButton}
                        disabled={actionLoading === u.id}
                      >
                         Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Controles de paginación */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className={styles.paginationButton}
          >
            ← Anterior
          </button>
          <span className={styles.paginationInfo}>
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className={styles.paginationButton}
          >
            Siguiente →
          </button>
        </div>
      )}

      {/* Modal para editar usuario */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onSave={(dto) => handleUpdateUser(editingUser.id, dto)}
          onClose={() => setEditingUser(null)}
        />
      )}

      {/* Modal para cambiar rol */}
      {showRoleModal && (
        <ChangeRoleModal
          user={showRoleModal}
          onSave={(role) => handleChangeRole(showRoleModal.id, role)}
          onClose={() => setShowRoleModal(null)}
        />
      )}
    </div>
  );
}



// Modal para editar usuario
function EditUserModal({
  user,
  onSave,
  onClose,
}: {
  user: User;
  onSave: (dto: UpdateUserDto) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    profile_image: user.profile_image || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>Editar Usuario</h3>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Nombre</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Imagen de perfil (URL)</label>
            <input
              type="url"
              value={formData.profile_image}
              onChange={(e) => setFormData({ ...formData, profile_image: e.target.value })}
            />
          </div>
          <div className={styles.modalActions}>
            <button type="submit" className={styles.saveButton}>
              Guardar
            </button>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal para cambiar rol
function ChangeRoleModal({
  user,
  onSave,
  onClose,
}: {
  user: User;
  onSave: (role: 'player' | 'admin') => void;
  onClose: () => void;
}) {
  const [selectedRole, setSelectedRole] = useState<'player' | 'admin'>(user.role);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(selectedRole);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>Cambiar Rol de Usuario</h3>
        <p>Usuario: {user.name} ({user.email})</p>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Nuevo Rol</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as 'player' | 'admin')}
              className={styles.select}
            >
              <option value="player">Player</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className={styles.modalActions}>
            <button type="submit" className={styles.saveButton}>
              Cambiar Rol
            </button>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancelar
            </button>

            
          </div>
        </form>
                  
      </div>
    </div>

  );
}
