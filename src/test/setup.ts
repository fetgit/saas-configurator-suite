import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Mock des modules externes
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/' }),
    Navigate: ({ to }: { to: string }) => React.createElement('div', { 'data-testid': 'navigate', 'data-to': to }),
  };
});

// Mock de localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock de sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock de fetch
global.fetch = vi.fn();

// Mock de crypto pour les tests
Object.defineProperty(window, 'crypto', {
  value: {
    getRandomValues: vi.fn((arr) => arr.map(() => Math.floor(Math.random() * 256))),
    subtle: {
      importKey: vi.fn(),
      encrypt: vi.fn(),
      decrypt: vi.fn(),
    },
  },
});

// Mock de navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn(),
    readText: vi.fn(),
  },
});

// Mock de ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock de IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Supprimer les warnings de console pendant les tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
