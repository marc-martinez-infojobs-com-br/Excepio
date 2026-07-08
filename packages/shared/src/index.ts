/**
 * @proyecto/shared
 * Tipos compartidos entre frontend y backend
 */

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
