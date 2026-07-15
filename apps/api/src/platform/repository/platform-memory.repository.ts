import { Injectable } from '@nestjs/common';
import { PlatformDto, CreatePlatformDto, UpdatePlatformDto } from '@excepio/shared';
import { PlatformRepository } from './platform.repository.interface';
import { randomBytes } from 'crypto';

/**
 * Implementación In-Memory del repositorio de Platform.
 * Útil para tests unitarios y desarrollo sin base de datos.
 */
@Injectable()
export class PlatformMemoryRepository implements PlatformRepository {
  private platforms: Map<number, PlatformDto> = new Map();

  /**
   * Limpia todos los datos del repositorio.
   * Útil para resetear entre tests.
   */
  clear(): void {
    this.platforms.clear();
  }

  /**
   * Permite cargar datos de prueba.
   * @param data - Datos a cargar
   */
  seed(data: PlatformDto[]): void {
    this.clear();
    data.forEach((platform) => this.platforms.set(platform.id, { ...platform }));
  }

  /**
   * Genera una API Key segura.
   */
  private generateApiKey(): string {
    return `exc_${randomBytes(32).toString('hex')}`;
  }

  async findAll(): Promise<PlatformDto[]> {
    return Array.from(this.platforms.values()).filter(
      (platform) => platform.statusId !== 4,
    );
  }

  async findById(id: number): Promise<PlatformDto | null> {
    const platform = this.platforms.get(id);
    if (!platform || platform.statusId === 4) return null;
    return { ...platform };
  }

  async existsById(id: number): Promise<boolean> {
    return this.platforms.has(id);
  }

  async findByApiKey(apiKey: string): Promise<PlatformDto | null> {
    const platform = Array.from(this.platforms.values()).find(
      (p) => p.apiKey === apiKey && p.statusId === 2,
    );
    if (!platform) return null;
    return { ...platform };
  }

  async create(data: CreatePlatformDto): Promise<PlatformDto> {
    const platform: PlatformDto = {
      id: data.id,
      name: data.name,
      apiKey: this.generateApiKey(),
      statusId: 2, // ACTIVE por defecto
      createdAt: new Date().toISOString(),
    };
    this.platforms.set(platform.id, platform);
    return { ...platform };
  }

  async update(id: number, data: UpdatePlatformDto): Promise<PlatformDto | null> {
    const platform = this.platforms.get(id);
    if (!platform) return null;

    const updated: PlatformDto = {
      ...platform,
      ...(data.name !== undefined && { name: data.name }),
      ...(data.statusId !== undefined && { statusId: data.statusId }),
    };
    this.platforms.set(id, updated);
    return { ...updated };
  }

  async delete(id: number): Promise<PlatformDto | null> {
    const platform = this.platforms.get(id);
    if (!platform) return null;

    const deleted: PlatformDto = { ...platform, statusId: 4 }; // DELETED
    this.platforms.set(id, deleted);
    return { ...deleted };
  }

  async regenerate(id: number): Promise<PlatformDto | null> {
    const platform = this.platforms.get(id);
    if (!platform) return null;

    const updated: PlatformDto = {
      ...platform,
      apiKey: this.generateApiKey(),
    };
    this.platforms.set(id, updated);
    return { ...updated };
  }
}
