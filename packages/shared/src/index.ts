/**
 * @excepio/shared
 * Tipos compartidos entre frontend y backend
 */

// Zod (re-export para conveniencia)
export { z } from 'zod';

// Health check response
export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
}

// API Error response
export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
}

// DTOs
export * from './status.dto';
export * from './level.dto';
export * from './platform.dto';
export * from './exception.dto';
export * from './user.dto';
export * from './auth.dto';
