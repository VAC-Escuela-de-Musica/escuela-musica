import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import Login from '../components/domain/auth/Login';
import { useAuth } from '../context/AuthContext.jsx';
import { mockFetchSuccess, mockUserData, mockAuthToken } from './testUtils.js';

// Mock del hook useAuth
vi.mock('../hooks/useAuth.js');

// Mock del logger
vi.mock('../utils/logger.js', () => ({
  logger: {
    login: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    validation: vi.fn()
  }
}));

describe('Login Component', () => {
  const mockLogin = vi.fn();
  const mockClearError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      login: mockLogin,
      loading: false,
      error: null,
      clearError: mockClearError,
      isAuthenticated: false,
      user: null
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form correctly', () => {
    render(<Login />);
    
    expect(screen.getByText('🎵 Iniciar Sesión')).toBeInTheDocument();
    expect(screen.getByLabelText('Email:')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('handles form submission with valid data', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue({ success: true });
    
    render(<Login />);
    
    await user.type(screen.getByLabelText('Email:'), 'test@example.com');
    await user.type(screen.getByLabelText('Contraseña:'), 'password123');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup();
    
    render(<Login />);
    
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    
    expect(screen.getByText('Por favor, ingresa tu email')).toBeInTheDocument();
    expect(screen.getByText('Por favor, ingresa tu contraseña')).toBeInTheDocument();
  });

  it('shows validation error for invalid email format', async () => {
    const user = userEvent.setup();
    
    render(<Login />);
    
    await user.type(screen.getByLabelText('Email:'), 'invalid-email');
    await user.type(screen.getByLabelText('Contraseña:'), 'password123');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    
    expect(screen.getByText('Por favor, ingresa un email válido')).toBeInTheDocument();
  });

  it('displays loading state during authentication', () => {
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      loading: true,
      error: null,
      clearError: mockClearError,
      isAuthenticated: false,
      user: null
    });
    
    render(<Login />);
    
    expect(screen.getByText('Iniciando sesión...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeDisabled();
  });

  it('displays error message when authentication fails', () => {
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      loading: false,
      error: 'Credenciales inválidas',
      clearError: mockClearError,
      isAuthenticated: false,
      user: null
    });
    
    render(<Login />);
    
    expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '✕' })).toBeInTheDocument();
  });

  it('clears error when close button is clicked', async () => {
    const user = userEvent.setup();
    
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      loading: false,
      error: 'Credenciales inválidas',
      clearError: mockClearError,
      isAuthenticated: false,
      user: null
    });
    
    render(<Login />);
    
    await user.click(screen.getByRole('button', { name: '✕' }));
    
    expect(mockClearError).toHaveBeenCalled();
  });

  it('redirects when user is already authenticated', () => {
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      loading: false,
      error: null,
      clearError: mockClearError,
      isAuthenticated: true,
      user: { id: 1, email: 'test@example.com' }
    });
    
    render(<Login />);
    
    expect(screen.getByText('Ya estás autenticado')).toBeInTheDocument();
    expect(screen.getByText('Redirigiendo...')).toBeInTheDocument();
  });

  it('handles remember me functionality', async () => {
    const user = userEvent.setup();
    
    render(<Login />);
    
    const rememberCheckbox = screen.getByLabelText('Recordarme');
    await user.click(rememberCheckbox);
    
    expect(rememberCheckbox).toBeChecked();
  });

  it('shows password visibility toggle', async () => {
    const user = userEvent.setup();
    
    render(<Login />);
    
    const passwordInput = screen.getByLabelText('Contraseña:');
    const toggleButton = screen.getByRole('button', { name: /mostrar contraseña/i });
    
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    await user.click(toggleButton);
    
    expect(passwordInput).toHaveAttribute('type', 'text');
  });
});
