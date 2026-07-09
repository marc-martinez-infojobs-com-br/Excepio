import { describe, it, expect } from 'vitest';
import { Prisma } from '@prisma/client';

describe('Prisma Schema', () => {
  it('should have Status model with correct fields', () => {
    const fields = Prisma.StatusScalarFieldEnum;
    expect(fields).toHaveProperty('id');
    expect(fields).toHaveProperty('name');
  });

  it('should have Level model with correct fields', () => {
    const fields = Prisma.LevelScalarFieldEnum;
    expect(fields).toHaveProperty('id');
    expect(fields).toHaveProperty('name');
    expect(fields).toHaveProperty('order');
    expect(fields).toHaveProperty('statusId');
  });

  it('should have Project model with correct fields', () => {
    const fields = Prisma.ProjectScalarFieldEnum;
    expect(fields).toHaveProperty('id');
    expect(fields).toHaveProperty('name');
    expect(fields).toHaveProperty('apiKey');
    expect(fields).toHaveProperty('statusId');
    expect(fields).toHaveProperty('createdAt');
  });

  it('should have Exception model with correct fields', () => {
    const fields = Prisma.ExceptionScalarFieldEnum;
    expect(fields).toHaveProperty('id');
    expect(fields).toHaveProperty('projectId');
    expect(fields).toHaveProperty('levelId');
    expect(fields).toHaveProperty('message');
    expect(fields).toHaveProperty('stackTrace');
    expect(fields).toHaveProperty('userId');
    expect(fields).toHaveProperty('url');
    expect(fields).toHaveProperty('userAgent');
    expect(fields).toHaveProperty('appVersion');
    expect(fields).toHaveProperty('metadata');
    expect(fields).toHaveProperty('createdAt');
  });

  it('should NOT have Platform model', () => {
    expect(Prisma).not.toHaveProperty('PlatformScalarFieldEnum');
  });

  it('should NOT have platformId in Exception model', () => {
    const fields = Prisma.ExceptionScalarFieldEnum;
    expect(fields).not.toHaveProperty('platformId');
  });
});
