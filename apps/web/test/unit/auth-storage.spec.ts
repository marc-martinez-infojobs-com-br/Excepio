import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authStorage } from '@lib/auth-storage';

// Mock de localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Reemplazar localStorage global
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('authStorage', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('debería guardar y recuperar el token', () => {
    const token = 'fake-jwt-token';
    authStorage.setToken(token);
    expect(authStorage.getToken()).toBe(token);
  });

  it('debería retornar null si no hay token', () => {
    expect(authStorage.getToken()).toBeNull();
  });

  it('debería guardar y recuperar el usuario', () => {
    const user = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@test.com',
      name: 'Test User',
      role: 'USUARIO' as const,
      statusId: 2,
      lastLoginAt: null,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };
    authStorage.setUser(user);
    expect(authStorage.getUser()).toEqual(user);
  });

  it('debería retornar null si no hay usuario', () => {
    expect(authStorage.getUser()).toBeNull();
  });

  it('debería limpiar token y usuario', () => {
    const token = 'fake-jwt-token';
    const user = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@test.com',
      name: 'Test User',
      role: 'USUARIO' as const,
      statusId: 2,
      lastLoginAt: null,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };

    authStorage.setToken(token);
    authStorage.setUser(user);
    authStorage.clear();

    expect(authStorage.getToken()).toBeNull();
    expect(authStorage.getUser()).toBeNull();
  });

  it('debería verificar si está autenticado', () => {
    expect(authStorage.isAuthenticated()).toBe(false);

    // Token JWT válido con exp en el futuro
    const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIiwicm9sZSI6IlVTVUFSSU8iLCJleHAiOjQwNzA5MDg4MDB9.abcd123';
    authStorage.setToken(validToken);
    expect(authStorage.isAuthenticated()).toBe(true);

    authStorage.clear();
    expect(authStorage.isAuthenticated()).toBe(false);
  });
});

describe('authStorage - Token expiration', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('debería detectar token expirado', () => {
    // Token JWT con exp en el pasado (1 de enero de 2020)
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIiwicm9sZSI6IlVTVUFSSU8iLCJleHAiOjE1Nzc4MzY4MDB9.4Adcj0vPHhBa0A3H3Z_Z5Z';
    authStorage.setToken(expiredToken);
    expect(authStorage.isTokenValid()).toBe(false);
  });

  it('debería detectar token válido', () => {
    // Token JWT con exp en el futuro (1 de enero de 2099)
    const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIiwicm9sZSI6IlVTVUFSSU8iLCJleHAiOjQwNzA5MDg4MDB9.abcd123';
    authStorage.setToken(validToken);
    expect(authStorage.isTokenValid()).toBe(true);
  });

  it('debería retornar false si no hay token', () => {
    authStorage.clear();
    expect(authStorage.isTokenValid()).toBe(false);
  });

  it('debería retornar false si el token no tiene campo exp', () => {
    // Token JWT sin campo exp
    const tokenWithoutExp = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIiwicm9sZSI6IlVTVUFSSU8ifQ.abcd123';
    authStorage.setToken(tokenWithoutExp);
    expect(authStorage.isTokenValid()).toBe(false);
  });

  it('debería retornar false si el token es inválido', () => {
    const invalidToken = 'not-a-valid-jwt-token';
    authStorage.setToken(invalidToken);
    expect(authStorage.isTokenValid()).toBe(false);
  });

  it('isAuthenticated() debería usar isTokenValid()', () => {
    // Token expirado
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIiwicm9sZSI6IlVTVUFSSU8iLCJleHAiOjE1Nzc4MzY4MDB9.4Adcj0vPHhBa0A3H3Z_Z5Z';
    authStorage.setToken(expiredToken);
    expect(authStorage.isAuthenticated()).toBe(false);

    // Token válido
    const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIiwicm9sZSI6IlVTVUFSSU8iLCJleHAiOjQwNzA5MDg4MDB9.abcd123';
    authStorage.setToken(validToken);
    expect(authStorage.isAuthenticated()).toBe(true);
  });
});
