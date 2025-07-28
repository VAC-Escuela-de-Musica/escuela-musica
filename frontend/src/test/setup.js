import '@testing-library/jest-dom';
import { beforeAll, afterAll, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

global.fetch = vi.fn();

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

class MockIntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

window.IntersectionObserver = MockIntersectionObserver;

class MockResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

window.ResizeObserver = MockResizeObserver;

beforeAll(() => {
  process.env.VITE_API_URL = 'http://localhost:1230'
  
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

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  localStorage.clear()
})

afterAll(() => {
  vi.resetAllMocks()
})
