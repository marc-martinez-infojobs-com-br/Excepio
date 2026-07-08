import { describe, it, expect } from 'vitest';
import { HealthController } from '../../src/health.controller';

describe('HealthController', () => {
  it('should return status ok', () => {
    const controller = new HealthController();
    const result = controller.check();

    expect(result.status).toBe('ok');
    expect(result.timestamp).toBeDefined();
  });
});
