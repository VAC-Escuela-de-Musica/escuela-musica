import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import useAuth from '../hooks/useAuth';

// Mock del fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock del localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock del logger
vi.mock('../utils/logger.js', () => ({
  logger: {
    auth: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    token: vi.fn()
  }
}));

// Mock del AuthProvider para testing
const TestAuthProvider = ({ children }) => {
  return <div data-testid="auth-provider">{children}</div>;
};

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it('should initialize with unauthenticated state', () => {
    const TestComponent = () => {
      const { isAuthenticated, user, loading } = useAuth();
      return (
        <div>
          <span data-testid="authenticated">{isAuthenticated.toString()}</span>
          <span data-testid="user">{user ? user.email : 'null'}</span>
          <span data-testid="loading">{loading.toString()}</span>
        </div>
      );
    };

    render(<TestComponent />);

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('user')).toHaveTextContent('null');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
  });

  it('should login successfully', async () => {
    const mockResponse = {
      success: true,
      data: {
        user: { id: 1, email: 'test@example.com', role: 'student' },
        token: 'mock-token'
      }
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    const TestComponent = () => {
      const { login, isAuthenticated, user, loading, error } = useAuth();
      
      const handleLogin = async () => {
        await login('test@example.com', 'password123');
      };

      return (
        <div>
          <button onClick={handleLogin}>Login</button>
          <span data-testid="authenticated">{isAuthenticated.toString()}</span>
          <span data-testid="user">{user ? user.email : 'null'}</span>
          <span data-testid="loading">{loading.toString()}</span>
          <span data-testid="error">{error || 'null'}</span>
        </div>
      );
    };

    render(<TestComponent />);

    const loginButton = screen.getByRole('button', { name: 'Login' });
    await userEvent.click(loginButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/login'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
        })
      );
    });

    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', 'mock-token');
    });
  });

  it('should handle login error', async () => {
    const mockResponse = {
      success: false,
      error: 'Invalid credentials'
    };

    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve(mockResponse)
    });

    const TestComponent = () => {
      const { login, error, loading } = useAuth();
      
      const handleLogin = async () => {
        await login('test@example.com', 'wrongpassword');
      };

      return (
        <div>
          <button onClick={handleLogin}>Login</button>
          <span data-testid="error">{error || 'null'}</span>
          <span data-testid="loading">{loading.toString()}</span>
        </div>
      );
    };

    render(<TestComponent />);

    const loginButton = screen.getByRole('button', { name: 'Login' });
    await userEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Invalid credentials');
    });
  });

  it('should logout successfully', async () => {
    mockLocalStorage.getItem.mockReturnValue('mock-token');

    const TestComponent = () => {
      const { logout, isAuthenticated } = useAuth();
      
      return (
        <div>
          <button onClick={logout}>Logout</button>
          <span data-testid="authenticated">{isAuthenticated.toString()}</span>
        </div>
      );
    };

    render(<TestComponent />);

    const logoutButton = screen.getByRole('button', { name: 'Logout' });
    await userEvent.click(logoutButton);

    await waitFor(() => {
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
    });
  });

  it('should check admin role correctly', () => {
    const TestComponent = () => {
      const { isAdmin } = useAuth();
      
      return (
        <div>
          <span data-testid="is-admin">{isAdmin.toString()}</span>
        </div>
      );
    };

    render(<TestComponent />);

    expect(screen.getByTestId('is-admin')).toHaveTextContent('false');
  });

  it('should check teacher role correctly', () => {
    const TestComponent = () => {
      const { isTeacher } = useAuth();
      
      return (
        <div>
          <span data-testid="is-teacher">{isTeacher.toString()}</span>
        </div>
      );
    };

    render(<TestComponent />);

    expect(screen.getByTestId('is-teacher')).toHaveTextContent('false');
  });

  it('should check student role correctly', () => {
    const TestComponent = () => {
      const { isStudent } = useAuth();
      
      return (
        <div>
          <span data-testid="is-student">{isStudent.toString()}</span>
        </div>
      );
    };

    render(<TestComponent />);

    expect(screen.getByTestId('is-student')).toHaveTextContent('false');
  });

  it('should check permissions correctly', () => {
    const TestComponent = () => {
      const { hasPermission } = useAuth();
      
      return (
        <div>
          <span data-testid="has-permission">
            {hasPermission('upload_materials').toString()}
          </span>
        </div>
      );
    };

    render(<TestComponent />);

    expect(screen.getByTestId('has-permission')).toHaveTextContent('false');
  });

  it('should register successfully', async () => {
    const mockResponse = {
      success: true,
      data: {
        user: { id: 1, email: 'newuser@example.com', role: 'student' },
        token: 'mock-token'
      }
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    const TestComponent = () => {
      const { register, isAuthenticated, user } = useAuth();
      
      const handleRegister = async () => {
        await register('newuser@example.com', 'password123', 'John Doe');
      };

      return (
        <div>
          <button onClick={handleRegister}>Register</button>
          <span data-testid="authenticated">{isAuthenticated.toString()}</span>
          <span data-testid="user">{user ? user.email : 'null'}</span>
        </div>
      );
    };

    render(<TestComponent />);

    const registerButton = screen.getByRole('button', { name: 'Register' });
    await userEvent.click(registerButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/register'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: 'newuser@example.com', 
            password: 'password123', 
            username: 'John Doe' 
          })
        })
      );
    });
  });

  it('should clear error', () => {
    const TestComponent = () => {
      const { clearError, error } = useAuth();
      
      return (
        <div>
          <button onClick={clearError}>Clear Error</button>
          <span data-testid="error">{error || 'null'}</span>
        </div>
      );
    };

    render(<TestComponent />);

    const clearButton = screen.getByRole('button', { name: 'Clear Error' });
    fireEvent.click(clearButton);

    expect(screen.getByTestId('error')).toHaveTextContent('null');
  });

  it('should handle token refresh', async () => {
    const mockResponse = {
      success: true,
      data: {
        token: 'new-mock-token'
      }
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    mockLocalStorage.getItem.mockReturnValue('old-token');

    const TestComponent = () => {
      const { refreshToken } = useAuth();
      
      const handleRefresh = async () => {
        await refreshToken();
      };

      return (
        <div>
          <button onClick={handleRefresh}>Refresh Token</button>
        </div>
      );
    };

    render(<TestComponent />);

    const refreshButton = screen.getByRole('button', { name: 'Refresh Token' });
    await userEvent.click(refreshButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/refresh'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer old-token'
          })
        })
      );
    });
  });
});
