import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserCard } from '@components/users/user-card';
import type { UserResponseDto } from '@excepio/shared';
import { UserRole } from '@excepio/shared';

// Mock de next-intl
vi.mock('next-intl', () => ({
  useTranslations: vi.fn((namespace: string) => (key: string, params?: Record<string, string | number>) => {
    const translations: Record<string, Record<string, string>> = {
      'users.status': {
        active: 'Activo',
        pending: 'Pendiente',
        expired: 'Expirado',
        deleted: 'Eliminado',
      },
      'users.roles': {
        ADMINISTRADOR: 'Administrador',
        USUARIO: 'Usuario',
      },
      'users.timeAgo': {
        minutes: 'hace {count}m',
        hours: 'hace {count}h',
        days: 'hace {count}d',
      },
      'users': {
        'table.email': 'Email',
        'table.role': 'Rol',
        'table.status': 'Estado',
        'table.lastLogin': 'Último acceso',
        'table.createdAt': 'Creado',
        'edit.button': 'Editar',
        'delete.button': 'Eliminar',
        'activate.button': 'Activar',
        'timeAgo.minutes': 'hace {count}m',
        'timeAgo.hours': 'hace {count}h',
        'timeAgo.days': 'hace {count}d',
      },
    };
    
    let result = translations[namespace]?.[key] || key;
    
    // Replace placeholders if params provided
    if (params && typeof result === 'string') {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        result = result.replace(`{${paramKey}}`, String(paramValue));
      });
    }
    
    return result;
  }),
}));

describe('UserCard', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnActivate = vi.fn();

  const activeUser: UserResponseDto = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: UserRole.USUARIO,
    statusId: 2,
    lastLoginAt: '2024-01-15T10:30:00.000Z',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-15T10:30:00.000Z',
  };

  const adminUser: UserResponseDto = {
    ...activeUser,
    id: '2',
    name: 'Admin User',
    email: 'admin@example.com',
    role: UserRole.ADMINISTRADOR,
  };

  const deletedUser: UserResponseDto = {
    ...activeUser,
    id: '3',
    name: 'Deleted User',
    email: 'deleted@example.com',
    statusId: 4,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('renderizado básico', () => {
    it('debería renderizar el nombre del usuario', () => {
      render(
        <UserCard
          user={activeUser}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onActivate={mockOnActivate}
        />
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('debería renderizar el email del usuario', () => {
      render(
        <UserCard
          user={activeUser}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onActivate={mockOnActivate}
        />
      );

      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    it('debería renderizar el badge de rol', () => {
      render(
        <UserCard
          user={activeUser}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onActivate={mockOnActivate}
        />
      );

      expect(screen.getByText('Usuario')).toBeInTheDocument();
    });

    it('debería renderizar el badge de estado', () => {
      render(
        <UserCard
          user={activeUser}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onActivate={mockOnActivate}
        />
      );

      expect(screen.getByText('Activo')).toBeInTheDocument();
    });

    it('debería renderizar la fecha de creación', () => {
      const { container } = render(
        <UserCard
          user={activeUser}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onActivate={mockOnActivate}
        />
      );

      // La fecha se renderiza en una línea con el formato "Creado: <fecha>"
      const expectedDate = new Date('2024-01-01T00:00:00.000Z').toLocaleDateString();
      expect(container.textContent).toContain(`Creado: ${expectedDate}`);
    });
  });

  describe('usuario activo', () => {
    it('debería mostrar botones de Editar y Eliminar', () => {
      render(
        <UserCard
          user={activeUser}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onActivate={mockOnActivate}
        />
      );

      expect(screen.getByLabelText('Editar')).toBeInTheDocument();
      expect(screen.getByLabelText('Eliminar')).toBeInTheDocument();
    });

    it('NO debería mostrar botón de Activar', () => {
      render(
        <UserCard
          user={activeUser}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onActivate={mockOnActivate}
        />
      );

      expect(screen.queryByLabelText('Activar')).not.toBeInTheDocument();
    });

    it('debería llamar onEdit cuando se hace click en Editar', async () => {
      const user = userEvent.setup();
      render(
        <UserCard
          user={activeUser}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onActivate={mockOnActivate}
        />
      );

      await user.click(screen.getByLabelText('Editar'));
      expect(mockOnEdit).toHaveBeenCalledWith(activeUser);
    });

    it('debería llamar onDelete cuando se hace click en Eliminar', async () => {
      const user = userEvent.setup();
      render(
        <UserCard
          user={activeUser}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onActivate={mockOnActivate}
        />
      );

      await user.click(screen.getByLabelText('Eliminar'));
      expect(mockOnDelete).toHaveBeenCalledWith(activeUser);
    });
  });

  describe('usuario eliminado', () => {
    it('debería mostrar badge de Eliminado', () => {
      render(
        <UserCard
          user={deletedUser}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onActivate={mockOnActivate}
        />
      );

      expect(screen.getByText('Eliminado')).toBeInTheDocument();
    });

    it('debería mostrar solo botón de Activar', () => {
      render(
        <UserCard
          user={deletedUser}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onActivate={mockOnActivate}
        />
      );

      expect(screen.getByLabelText('Activar')).toBeInTheDocument();
      expect(screen.queryByLabelText('Editar')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Eliminar')).not.toBeInTheDocument();
    });

    it('debería llamar onActivate cuando se hace click en Activar', async () => {
      const user = userEvent.setup();
      render(
        <UserCard
          user={deletedUser}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onActivate={mockOnActivate}
        />
      );

      await user.click(screen.getByLabelText('Activar'));
      expect(mockOnActivate).toHaveBeenCalledWith(deletedUser);
    });
  });

  describe('usuario actual (currentUserId)', () => {
    it('NO debería mostrar botón de Eliminar para el usuario actual', () => {
      render(
        <UserCard
          user={activeUser}
          currentUserId="1"
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onActivate={mockOnActivate}
        />
      );

      expect(screen.getByLabelText('Editar')).toBeInTheDocument();
      expect(screen.queryByLabelText('Eliminar')).not.toBeInTheDocument();
    });

    it('debería mostrar botón de Eliminar para otros usuarios', () => {
      render(
        <UserCard
          user={activeUser}
          currentUserId="999"
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onActivate={mockOnActivate}
        />
      );

      expect(screen.getByLabelText('Editar')).toBeInTheDocument();
      expect(screen.getByLabelText('Eliminar')).toBeInTheDocument();
    });
  });

  describe('roles diferentes', () => {
    it('debería renderizar badge de ADMINISTRADOR correctamente', () => {
      render(
        <UserCard
          user={adminUser}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onActivate={mockOnActivate}
        />
      );

      expect(screen.getByText('Administrador')).toBeInTheDocument();
    });
  });
});
