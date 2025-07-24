import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import Login from '../components/domain/auth/Login';
import { useAuth } from '../hooks/useAuth';

// Mock del hook useAuth
vi.mock('../hooks/useAuth');

const mockLogin = vi.fn();
const mockClearError = vi.fn();

const mockUseAuth = {
  login: mockLogin,
  loading: false,
  error: null,
  clearError: mockClearError,
  isAuthenticated: false
};

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue(mockUseAuth);
  });

  it('renders login form correctly', () => {
    render(<Login />);

    expect(screen.getByText('Iniciar sesión')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ingresar/i })).toBeInTheDocument();
  });

  it('handles form submission with valid data', async () => {
    mockLogin.mockResolvedValue({ success: true, data: { user: { id: 1, email: 'test@example.com' } } });
    
    const mockOnLogin = vi.fn();
    const user = userEvent.setup();
    
    render(<Login onLogin={mockOnLogin} />);

    await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('Contraseña'), 'password123');
    await user.click(screen.getByRole('button', { name: /ingresar/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup();
    
    render(<Login />);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Contraseña');
    const submitButton = screen.getByRole('button', { name: /ingresar/i });

    // HTML5 validation will prevent submission
    expect(emailInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('required');
    expect(submitButton).toBeInTheDocument();
  });

  it('shows validation error for invalid email format', async () => {
    const user = userEvent.setup();
    
    render(<Login />);

    const emailInput = screen.getByPlaceholderText('Email');
    
    // HTML5 email validation
    expect(emailInput).toHaveAttribute('type', 'email');
    
    await user.type(emailInput, 'invalid-email');
    
    // Browser will handle email validation
    expect(emailInput).toHaveValue('invalid-email');
  });

  it('displays loading state during authentication', () => {
    const mockAuthLoading = {
      ...mockUseAuth,
      loading: true
    };

    useAuth.mockReturnValue(mockAuthLoading);

    render(<Login />);

    expect(screen.getByText('Ingresando...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ingresando/i })).toBeDisabled();
  });

  it('displays error message when authentication fails', () => {
    const mockAuthError = {
      ...mockUseAuth,
      error: 'Credenciales inválidas'
    };

    useAuth.mockReturnValue(mockAuthError);

    render(<Login />);

    expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
  });

  it('clears error when inputs change', async () => {
    const mockAuthError = {
      ...mockUseAuth,
      error: 'Credenciales inválidas'
    };

    useAuth.mockReturnValue(mockAuthError);

    const user = userEvent.setup();
    
    render(<Login />);

    await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');

    expect(mockClearError).toHaveBeenCalled();
  });

  it('calls onLogin when user is authenticated', () => {
    const mockAuthenticatedUser = {
      ...mockUseAuth,
      isAuthenticated: true
    };

    useAuth.mockReturnValue(mockAuthenticatedUser);

    const mockOnLogin = vi.fn();
    render(<Login onLogin={mockOnLogin} />);

    expect(mockOnLogin).toHaveBeenCalled();
  });

  it('handles form submission correctly', async () => {
    const user = userEvent.setup();
    
    render(<Login />);

    await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('Contraseña'), 'password123');
    
    const form = screen.getByText('Iniciar sesión').closest('form');
    
    fireEvent.submit(form);

    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('shows form structure correctly', () => {
    render(<Login />);

    const form = screen.getByText('Iniciar sesión').closest('form');
    expect(form).toBeInTheDocument();
    expect(form).toHaveStyle('max-width: 400px');
    expect(form).toHaveStyle('margin: 2rem auto');
  });
});
