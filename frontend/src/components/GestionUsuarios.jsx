import React, { useEffect, useState } from 'react';
import { useUsers } from '../hooks/useUsers.js';
import { useAuth } from './AuthContextProvider.jsx';
import { logger } from '../utils/logger.js';
import './darkmode.css';
import './GestionUsuarios.styles.css';

const GestionUsuarios = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'edit', 'delete', 'roles'
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'student'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const { 
    users, 
    loading, 
    error, 
    fetchUsers, 
    createUser, 
    updateUser, 
    deleteUser, 
    updateUserRole,
    searchUsers,
    pagination,
    nextPage,
    prevPage,
    goToPage,
    clearError 
  } = useUsers();
  
  const { user: currentUser, isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchUsers();
    }
  }, [isAuthenticated, isAdmin, fetchUsers]);

  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (term.trim()) {
      await searchUsers(term);
    } else {
      await fetchUsers();
    }
  };

  const handleRoleFilter = async (role) => {
    setRoleFilter(role);
    await fetchUsers({
      page: 1,
      filters: { role: role || undefined }
    });
  };

  const openModal = (type, user = null) => {
    setModalType(type);
    setSelectedUser(user);
    setShowModal(true);
    
    if (type === 'edit' && user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        password: '',
        role: user.role || 'student'
      });
    } else if (type === 'create') {
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'student'
      });
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setModalType('');
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'student'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let result;
      
      if (modalType === 'create') {
        result = await createUser(formData);
      } else if (modalType === 'edit') {
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        result = await updateUser(selectedUser._id, updateData);
      } else if (modalType === 'roles') {
        result = await updateUserRole(selectedUser._id, formData.role);
      }
      
      if (result.success) {
        logger.success(`Usuario ${modalType === 'create' ? 'creado' : 'actualizado'} exitosamente`);
        closeModal();
        await fetchUsers();
      } else {
        logger.error('Error:', result.error);
      }
    } catch (error) {
      logger.error('Error en la operación:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    
    if (window.confirm(`¿Estás seguro de que quieres eliminar al usuario ${selectedUser.username || selectedUser.email}?`)) {
      const result = await deleteUser(selectedUser._id);
      if (result.success) {
        logger.success('Usuario eliminado exitosamente');
        closeModal();
        await fetchUsers();
      } else {
        logger.error('Error eliminando usuario:', result.error);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return '#f44336';
      case 'teacher': return '#ff9800';
      case 'student': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'teacher': return 'Profesor';
      case 'student': return 'Estudiante';
      default: return role || 'No especificado';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="gestion-usuarios">
        <div className="no-auth-message">
          <h2>Acceso requerido</h2>
          <p>Debes iniciar sesión para acceder a esta sección.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="gestion-usuarios">
        <div className="no-permission-message">
          <h2>Sin permisos</h2>
          <p>No tienes permisos para gestionar usuarios.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="gestion-usuarios">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gestion-usuarios">
        <div className="error-container">
          <h2>Error al cargar usuarios</h2>
          <p>{error}</p>
          <button onClick={clearError} className="retry-button">
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="gestion-usuarios">
      <div className="header">
        <h1>👥 Gestión de Usuarios</h1>
        <div className="header-actions">
          <button 
            onClick={() => openModal('create')}
            className="create-btn"
          >
            ➕ Crear Usuario
          </button>
        </div>
      </div>

      <div className="filters">
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-container">
          <select
            value={roleFilter}
            onChange={(e) => handleRoleFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">Todos los roles</option>
            <option value="admin">Administradores</option>
            <option value="teacher">Profesores</option>
            <option value="student">Estudiantes</option>
          </select>
        </div>
      </div>

      <div className="users-summary">
        <span>Total: {pagination.totalCount || users.length} usuarios</span>
        {roleFilter && (
          <span>Filtrado por: {getRoleText(roleFilter)}</span>
        )}
      </div>

      {users.length === 0 ? (
        <div className="no-users">
          <h2>No hay usuarios disponibles</h2>
          <p>
            {searchTerm || roleFilter
              ? 'No se encontraron usuarios con los filtros aplicados.'
              : 'No hay usuarios para mostrar en este momento.'
            }
          </p>
        </div>
      ) : (
        <>
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Fecha de Registro</th>
                  <th>Último Acceso</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="user-info">
                        <span className="username">{user.username || 'Sin username'}</span>
                        {user._id === currentUser._id && (
                          <span className="current-user-badge">Tú</span>
                        )}
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span 
                        className="role-badge"
                        style={{ backgroundColor: getRoleColor(user.role) }}
                      >
                        {getRoleText(user.role)}
                      </span>
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>{formatDate(user.lastLogin)}</td>
                    <td>
                      <div className="actions">
                        <button
                          onClick={() => openModal('edit', user)}
                          className="action-btn edit-btn"
                          title="Editar usuario"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => openModal('roles', user)}
                          className="action-btn role-btn"
                          title="Cambiar rol"
                        >
                          🔧
                        </button>
                        {user._id !== currentUser._id && (
                          <button
                            onClick={() => openModal('delete', user)}
                            className="action-btn delete-btn"
                            title="Eliminar usuario"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={prevPage}
                disabled={!pagination.hasPrevPage}
                className="pagination-btn"
              >
                ← Anterior
              </button>
              
              <div className="pagination-info">
                <span>
                  Página {pagination.page} de {pagination.totalPages}
                </span>
                <span>
                  ({pagination.totalCount} usuarios total)
                </span>
              </div>
              
              <button
                onClick={nextPage}
                disabled={!pagination.hasNextPage}
                className="pagination-btn"
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>
                {modalType === 'create' && 'Crear Usuario'}
                {modalType === 'edit' && 'Editar Usuario'}
                {modalType === 'roles' && 'Cambiar Rol'}
                {modalType === 'delete' && 'Eliminar Usuario'}
              </h2>
              <button onClick={closeModal} className="close-btn">✕</button>
            </div>
            
            <div className="modal-body">
              {modalType === 'delete' ? (
                <div className="delete-confirmation">
                  <p>
                    ¿Estás seguro de que quieres eliminar al usuario{' '}
                    <strong>{selectedUser?.username || selectedUser?.email}</strong>?
                  </p>
                  <p className="warning">Esta acción no se puede deshacer.</p>
                  <div className="modal-actions">
                    <button onClick={closeModal} className="cancel-btn">
                      Cancelar
                    </button>
                    <button onClick={handleDelete} className="confirm-delete-btn">
                      Eliminar
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {modalType !== 'roles' && (
                    <>
                      <div className="form-group">
                        <label htmlFor="username">Nombre de usuario</label>
                        <input
                          type="text"
                          id="username"
                          value={formData.username}
                          onChange={(e) => setFormData({...formData, username: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                          type="email"
                          id="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="password">
                          Contraseña {modalType === 'edit' && '(dejar vacío para no cambiar)'}
                        </label>
                        <input
                          type="password"
                          id="password"
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          required={modalType === 'create'}
                        />
                      </div>
                    </>
                  )}
                  
                  <div className="form-group">
                    <label htmlFor="role">Rol</label>
                    <select
                      id="role"
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      required
                    >
                      <option value="student">Estudiante</option>
                      <option value="teacher">Profesor</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                  
                  <div className="modal-actions">
                    <button type="button" onClick={closeModal} className="cancel-btn">
                      Cancelar
                    </button>
                    <button type="submit" className="submit-btn">
                      {modalType === 'create' ? 'Crear' : 'Actualizar'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionUsuarios;
