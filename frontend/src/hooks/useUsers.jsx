import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth.jsx';

/**
 * Hook para gestión de usuarios
 */
const useUsers = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    dateRange: null
  });

  // Usuarios filtrados
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filters.role || user.role === filters.role;
    const matchesStatus = !filters.status || 
                         (filters.status === 'active' && user.active) ||
                         (filters.status === 'inactive' && !user.active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Estadísticas
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.active).length,
    inactiveUsers: users.filter(u => !u.active).length,
    byRole: users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {}),
    recentLogins: users.filter(u => {
      const lastLogin = new Date(u.lastLogin);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return lastLogin > weekAgo;
    }).length
  };

  // Cargar usuarios
  const loadUsers = useCallback(async () => {
    if (!isAuthenticated || !isAdmin) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data);
      } else {
        setError(data.error || 'Error al cargar usuarios');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin]);

  // Crear usuario
  const createUser = useCallback(async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      
      if (data.success) {
        await loadUsers(); // Recargar usuarios
        return { success: true, data: data.data };
      } else {
        setError(data.error || 'Error al crear usuario');
        return { success: false, error: data.error };
      }
    } catch (err) {
      const errorMsg = 'Error al crear usuario';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [loadUsers]);

  // Actualizar usuario
  const updateUser = useCallback(async (userId, userData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      
      if (data.success) {
        await loadUsers(); // Recargar usuarios
        return { success: true, data: data.data };
      } else {
        setError(data.error || 'Error al actualizar usuario');
        return { success: false, error: data.error };
      }
    } catch (err) {
      const errorMsg = 'Error al actualizar usuario';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [loadUsers]);

  // Eliminar usuario
  const deleteUser = useCallback(async (userId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        await loadUsers(); // Recargar usuarios
        return { success: true };
      } else {
        setError(data.error || 'Error al eliminar usuario');
        return { success: false, error: data.error };
      }
    } catch (err) {
      const errorMsg = 'Error al eliminar usuario';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [loadUsers]);

  // Alternar estado del usuario
  const toggleUserStatus = useCallback(async (userId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/${userId}/toggle-status`, {
        method: 'PATCH'
      });

      const data = await response.json();
      
      if (data.success) {
        await loadUsers(); // Recargar usuarios
        return { success: true, data: data.data };
      } else {
        setError(data.error || 'Error al cambiar estado del usuario');
        return { success: false, error: data.error };
      }
    } catch (err) {
      const errorMsg = 'Error al cambiar estado del usuario';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [loadUsers]);

  // Resetear contraseña
  const resetUserPassword = useCallback(async (userId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/${userId}/reset-password`, {
        method: 'POST'
      });

      const data = await response.json();
      
      if (data.success) {
        return { success: true, data: data.data };
      } else {
        setError(data.error || 'Error al resetear contraseña');
        return { success: false, error: data.error };
      }
    } catch (err) {
      const errorMsg = 'Error al resetear contraseña';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Refrescar usuarios
  const refreshUsers = useCallback(() => {
    loadUsers();
  }, [loadUsers]);

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return {
    users,
    filteredUsers,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    stats,
    totalUsers: users.length,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    resetUserPassword,
    refreshUsers
  };
};

export default useUsers;
