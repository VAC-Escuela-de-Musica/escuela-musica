import { render } from '@testing-library/react'
import { vi } from 'vitest'

/**
 * Utilidades para testing
 */

// Mock de respuesta exitosa de fetch
export const mockFetchSuccess = (data) => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => data,
  })
}

// Mock de respuesta de error de fetch
export const mockFetchError = (error = 'Network Error', status = 500) => {
  global.fetch.mockRejectedValueOnce({
    ok: false,
    status,
    message: error,
  })
}

// Mock de localStorage con datos específicos
export const mockLocalStorage = (data) => {
  Object.keys(data).forEach(key => {
    localStorage.setItem.mockReturnValueOnce(data[key])
  })
}

// Datos de prueba comunes
export const mockUserData = {
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  role: 'student'
}

export const mockMaterialData = {
  id: '1',
  title: 'Material de Prueba',
  description: 'Descripción del material',
  category: 'Teoría',
  instrument: 'Piano',
  difficulty: 'Principiante',
  fileUrl: 'http://example.com/file.pdf',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

export const mockAuthToken = 'mock-jwt-token'

// Función helper para renderizar con contexto
export const renderWithContext = (component, options = {}) => {
  return render(component, {
    ...options,
  })
}

// Mock de servicios
export const mockAuthService = {
  login: vi.fn(),
  logout: vi.fn(),
  getCurrentUser: vi.fn(),
  isAuthenticated: vi.fn(),
}

export const mockMaterialService = {
  getAllMaterials: vi.fn(),
  getMaterialById: vi.fn(),
  createMaterial: vi.fn(),
  updateMaterial: vi.fn(),
  deleteMaterial: vi.fn(),
  uploadMultiple: vi.fn(),
}

export const mockUserService = {
  getAllUsers: vi.fn(),
  getUserById: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
}

// Helper para esperar cambios async
export const waitForAsyncChange = () => new Promise(resolve => setTimeout(resolve, 0))
