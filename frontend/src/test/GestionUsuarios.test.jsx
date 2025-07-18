import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import GestionUsuarios from '../components/GestionUsuarios';
import useAuth from '../hooks/useAuth';
import useUsers from '../hooks/useUsers';

// Mock de los hooks
vi.mock('../hooks/useAuth');
vi.mock('../hooks/useUsers');

// Mock del logger
vi.mock('../utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    admin: vi.fn(),
    success: vi.fn()
  }
}));

const mockUsers = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin',
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    username: 'teacher1',
    email: 'teacher1@example.com',
    role: 'teacher',
    active: true,
    createdAt: '2024-01-02T00:00:00Z',
    lastLogin: '2024-01-14T14:20:00Z'
  },
  {
    id: 3,
    username: 'student1',
    email: 'student1@example.com',
    role: 'student',
    active: true,
    createdAt: '2024-01-03T00:00:00Z',
    lastLogin: '2024-01-13T16:45:00Z'
  },
  {
    id: 4,
    username: 'student2',
    email: 'student2@example.com',
    role: 'student',
    active: false,
    createdAt: '2024-01-04T00:00:00Z',
    lastLogin: '2024-01-10T09:15:00Z'
  }
];

const mockUseAuth = {
  user: { id: 1, role: 'admin', username: 'admin' },
  isAuthenticated: true,
  isAdmin: true,
  isTeacher: false,
  isStudent: false,
  hasPermission: vi.fn().mockReturnValue(true)
};

const mockUseUsers = {
  users: mockUsers,
  loading: false,
  error: null,
  searchTerm: '',
  setSearchTerm: vi.fn(),
  filters: {
    role: '',
    status: '',
    dateRange: null
  },
  setFilters: vi.fn(),
  filteredUsers: mockUsers,
  totalUsers: mockUsers.length,
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
  toggleUserStatus: vi.fn(),
  resetUserPassword: vi.fn(),
  refreshUsers: vi.fn(),
  stats: {
    totalUsers: 4,
    activeUsers: 3,
    inactiveUsers: 1,
    byRole: {
      admin: 1,
      teacher: 1,
      student: 2
    },
    recentLogins: 3
  }
};

describe('GestionUsuarios Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue(mockUseAuth);
    useUsers.mockReturnValue(mockUseUsers);
  });

  it('should render users management interface', () => {
    render(<GestionUsuarios />);

    expect(screen.getByText('Gestión de Usuarios')).toBeInTheDocument();
    expect(screen.getByText('Buscar usuarios...')).toBeInTheDocument();
    expect(screen.getByText('Nuevo Usuario')).toBeInTheDocument();
    expect(screen.getByText('4 usuarios encontrados')).toBeInTheDocument();
  });

  it('should display user statistics', () => {
    render(<GestionUsuarios />);

    expect(screen.getByText('Total: 4')).toBeInTheDocument();
    expect(screen.getByText('Activos: 3')).toBeInTheDocument();
    expect(screen.getByText('Inactivos: 1')).toBeInTheDocument();
    expect(screen.getByText('Administradores: 1')).toBeInTheDocument();
    expect(screen.getByText('Profesores: 1')).toBeInTheDocument();
    expect(screen.getByText('Estudiantes: 2')).toBeInTheDocument();
  });

  it('should display users table', () => {
    render(<GestionUsuarios />);

    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    expect(screen.getByText('teacher1')).toBeInTheDocument();
    expect(screen.getByText('teacher1@example.com')).toBeInTheDocument();
    expect(screen.getByText('student1')).toBeInTheDocument();
    expect(screen.getByText('student1@example.com')).toBeInTheDocument();
  });

  it('should handle search input', async () => {
    render(<GestionUsuarios />);

    const searchInput = screen.getByPlaceholderText('Buscar usuarios...');
    await userEvent.type(searchInput, 'teacher');

    expect(mockUseUsers.setSearchTerm).toHaveBeenCalledWith('teacher');
  });

  it('should handle role filter', async () => {
    render(<GestionUsuarios />);

    const roleFilter = screen.getByDisplayValue('Todos los roles');
    await userEvent.selectOptions(roleFilter, 'teacher');

    expect(mockUseUsers.setFilters).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'teacher' })
    );
  });

  it('should handle status filter', async () => {
    render(<GestionUsuarios />);

    const statusFilter = screen.getByDisplayValue('Todos los estados');
    await userEvent.selectOptions(statusFilter, 'active');

    expect(mockUseUsers.setFilters).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'active' })
    );
  });

  it('should open new user modal', async () => {
    render(<GestionUsuarios />);

    const newUserButton = screen.getByText('Nuevo Usuario');
    await userEvent.click(newUserButton);

    expect(screen.getByText('Crear Nuevo Usuario')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre de usuario')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByLabelText('Rol')).toBeInTheDocument();
  });

  it('should create new user', async () => {
    mockUseUsers.createUser.mockResolvedValue({
      success: true,
      data: { id: 5, username: 'newuser', email: 'newuser@example.com' }
    });

    render(<GestionUsuarios />);

    const newUserButton = screen.getByText('Nuevo Usuario');
    await userEvent.click(newUserButton);

    // Llenar formulario
    await userEvent.type(screen.getByLabelText('Nombre de usuario'), 'newuser');
    await userEvent.type(screen.getByLabelText('Email'), 'newuser@example.com');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'password123');
    await userEvent.selectOptions(screen.getByLabelText('Rol'), 'student');

    const createButton = screen.getByRole('button', { name: /crear usuario/i });
    await userEvent.click(createButton);

    await waitFor(() => {
      expect(mockUseUsers.createUser).toHaveBeenCalledWith({
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
        role: 'student'
      });
    });
  });

  it('should handle user creation validation', async () => {
    render(<GestionUsuarios />);

    const newUserButton = screen.getByText('Nuevo Usuario');
    await userEvent.click(newUserButton);

    const createButton = screen.getByRole('button', { name: /crear usuario/i });
    await userEvent.click(createButton);

    expect(screen.getByText('El nombre de usuario es requerido')).toBeInTheDocument();
    expect(screen.getByText('El email es requerido')).toBeInTheDocument();
    expect(screen.getByText('La contraseña es requerida')).toBeInTheDocument();
  });

  it('should edit user', async () => {
    mockUseUsers.updateUser.mockResolvedValue({
      success: true,
      data: { id: 2, username: 'teacher1-updated' }
    });

    render(<GestionUsuarios />);

    const editButtons = screen.getAllByText('Editar');
    await userEvent.click(editButtons[1]); // Edit teacher1

    expect(screen.getByText('Editar Usuario')).toBeInTheDocument();
    expect(screen.getByDisplayValue('teacher1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('teacher1@example.com')).toBeInTheDocument();

    // Actualizar nombre
    const usernameInput = screen.getByDisplayValue('teacher1');
    await userEvent.clear(usernameInput);
    await userEvent.type(usernameInput, 'teacher1-updated');

    const updateButton = screen.getByRole('button', { name: /actualizar usuario/i });
    await userEvent.click(updateButton);

    await waitFor(() => {
      expect(mockUseUsers.updateUser).toHaveBeenCalledWith(2, {
        username: 'teacher1-updated',
        email: 'teacher1@example.com',
        role: 'teacher'
      });
    });
  });

  it('should toggle user status', async () => {
    mockUseUsers.toggleUserStatus.mockResolvedValue({
      success: true,
      data: { id: 3, active: false }
    });

    render(<GestionUsuarios />);

    const statusButtons = screen.getAllByText(/desactivar|activar/i);
    await userEvent.click(statusButtons[0]); // Toggle first user

    expect(screen.getByText('¿Estás seguro?')).toBeInTheDocument();

    const confirmButton = screen.getByText('Confirmar');
    await userEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockUseUsers.toggleUserStatus).toHaveBeenCalledWith(1);
    });
  });

  it('should delete user', async () => {
    mockUseUsers.deleteUser.mockResolvedValue({
      success: true
    });

    render(<GestionUsuarios />);

    const deleteButtons = screen.getAllByText('Eliminar');
    await userEvent.click(deleteButtons[0]);

    expect(screen.getByText('¿Estás seguro de eliminar este usuario?')).toBeInTheDocument();

    const confirmButton = screen.getByText('Eliminar');
    await userEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockUseUsers.deleteUser).toHaveBeenCalledWith(1);
    });
  });

  it('should reset user password', async () => {
    mockUseUsers.resetUserPassword.mockResolvedValue({
      success: true,
      data: { temporaryPassword: 'temp123' }
    });

    render(<GestionUsuarios />);

    const resetButtons = screen.getAllByText('Reset Password');
    await userEvent.click(resetButtons[0]);

    expect(screen.getByText('¿Resetear contraseña?')).toBeInTheDocument();

    const confirmButton = screen.getByText('Resetear');
    await userEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockUseUsers.resetUserPassword).toHaveBeenCalledWith(1);
    });

    expect(screen.getByText('Contraseña temporal: temp123')).toBeInTheDocument();
  });

  it('should display user details modal', async () => {
    render(<GestionUsuarios />);

    const viewButtons = screen.getAllByText('Ver');
    await userEvent.click(viewButtons[0]);

    expect(screen.getByText('Detalles del Usuario')).toBeInTheDocument();
    expect(screen.getByText('ID: 1')).toBeInTheDocument();
    expect(screen.getByText('Username: admin')).toBeInTheDocument();
    expect(screen.getByText('Email: admin@example.com')).toBeInTheDocument();
    expect(screen.getByText('Rol: admin')).toBeInTheDocument();
  });

  it('should handle bulk actions', async () => {
    render(<GestionUsuarios />);

    // Seleccionar usuarios
    const checkboxes = screen.getAllByRole('checkbox');
    await userEvent.click(checkboxes[1]); // Select first user
    await userEvent.click(checkboxes[2]); // Select second user

    expect(screen.getByText('2 usuarios seleccionados')).toBeInTheDocument();

    const bulkActions = screen.getByText('Acciones en lote');
    await userEvent.click(bulkActions);

    expect(screen.getByText('Activar seleccionados')).toBeInTheDocument();
    expect(screen.getByText('Desactivar seleccionados')).toBeInTheDocument();
    expect(screen.getByText('Eliminar seleccionados')).toBeInTheDocument();
  });

  it('should export users data', async () => {
    const mockBlob = new Blob(['mock csv data'], { type: 'text/csv' });
    const mockCreateObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    const mockRevokeObjectURL = vi.fn();

    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;

    render(<GestionUsuarios />);

    const exportButton = screen.getByText('Exportar');
    await userEvent.click(exportButton);

    const csvOption = screen.getByText('Exportar como CSV');
    await userEvent.click(csvOption);

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalled();
  });

  it('should handle pagination', async () => {
    const mockManyUsers = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      username: `user${i + 1}`,
      email: `user${i + 1}@example.com`,
      role: 'student',
      active: true,
      createdAt: '2024-01-01T00:00:00Z'
    }));

    const mockPaginated = {
      ...mockUseUsers,
      users: mockManyUsers,
      filteredUsers: mockManyUsers.slice(0, 10),
      totalUsers: mockManyUsers.length,
      currentPage: 1,
      totalPages: 5,
      setCurrentPage: vi.fn()
    };

    useUsers.mockReturnValue(mockPaginated);

    render(<GestionUsuarios />);

    expect(screen.getByText('Página 1 de 5')).toBeInTheDocument();
    expect(screen.getByText('Siguiente')).toBeInTheDocument();
    expect(screen.getByText('Anterior')).toBeInTheDocument();

    const nextButton = screen.getByText('Siguiente');
    await userEvent.click(nextButton);

    expect(mockPaginated.setCurrentPage).toHaveBeenCalledWith(2);
  });

  it('should handle loading state', () => {
    const mockLoading = {
      ...mockUseUsers,
      loading: true
    };

    useUsers.mockReturnValue(mockLoading);

    render(<GestionUsuarios />);

    expect(screen.getByText('Cargando usuarios...')).toBeInTheDocument();
  });

  it('should handle error state', () => {
    const mockError = {
      ...mockUseUsers,
      error: 'Error al cargar usuarios'
    };

    useUsers.mockReturnValue(mockError);

    render(<GestionUsuarios />);

    expect(screen.getByText('Error al cargar usuarios')).toBeInTheDocument();
  });

  it('should handle permission validation', () => {
    const mockUnauthorized = {
      ...mockUseAuth,
      isAdmin: false,
      hasPermission: vi.fn().mockReturnValue(false)
    };

    useAuth.mockReturnValue(mockUnauthorized);

    render(<GestionUsuarios />);

    expect(screen.getByText('No tienes permisos para gestionar usuarios')).toBeInTheDocument();
  });

  it('should handle user activity monitoring', () => {
    render(<GestionUsuarios />);

    const activityTab = screen.getByText('Actividad');
    fireEvent.click(activityTab);

    expect(screen.getByText('Actividad Reciente')).toBeInTheDocument();
    expect(screen.getByText('Últimos inicios de sesión')).toBeInTheDocument();
  });

  it('should handle user permissions management', async () => {
    render(<GestionUsuarios />);

    const permissionsButtons = screen.getAllByText('Permisos');
    await userEvent.click(permissionsButtons[0]);

    expect(screen.getByText('Gestionar Permisos')).toBeInTheDocument();
    expect(screen.getByText('Permisos de usuario')).toBeInTheDocument();
    expect(screen.getByText('Subir materiales')).toBeInTheDocument();
    expect(screen.getByText('Editar materiales')).toBeInTheDocument();
    expect(screen.getByText('Eliminar materiales')).toBeInTheDocument();
  });
});
