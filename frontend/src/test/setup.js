import '@testing-library/jest-dom';
import { beforeAll, afterAll, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Mock del localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

// Mock del fetch global
global.fetch = vi.fn();

// Mock de console.error para tests más limpios
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning: ReactDOM.render is no longer supported')
  ) {
    return;
  }
  originalConsoleError(...args);
};

// Mock de IntersectionObserver
class MockIntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

window.IntersectionObserver = MockIntersectionObserver;

// Mock de ResizeObserver
class MockResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

window.ResizeObserver = MockResizeObserver;

// Configuración antes de todos los tests
beforeAll(() => {
  // Configurar variables de entorno
  process.env.VITE_API_URL = 'http://localhost:1230'
  
  // Mock de window.location
  Object.defineProperty(window, 'location', {
    value: {
      href: 'http://localhost:443/',
      origin: 'http://localhost:443',
      pathname: '/',
      search: '',
      hash: '',
      reload: vi.fn(),
    },
    writable: true,
  })
})

// Limpiar después de cada test
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  localStorage.clear()
})

// Configuración después de todos los tests
afterAll(() => {
  vi.resetAllMocks()
})
