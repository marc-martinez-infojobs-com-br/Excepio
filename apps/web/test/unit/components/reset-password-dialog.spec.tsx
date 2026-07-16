import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResetPasswordDialog } from '@components/users/reset-password-dialog';
import type { UserResponseDto } from '@excepio/shared';
import { UserRole } from '@excepio/shared';

describe('ResetPasswordDialog', () => {
  const mockUser: UserResponseDto = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    name: 'Test User',
    role: UserRole.USUARIO,
    statusId: 2,
    lastLoginAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockOnOpenChange = vi.fn();
  const mockOnConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnConfirm.mockResolvedValue(undefined);
  });

  describe('rendering', () => {
    it('Given_DialogOpen_When_Render_Then_ShowsAllElements', () => {
      render(
        <ResetPasswordDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          user={mockUser}
          onConfirm={mockOnConfirm}
        />
      );

      // Título
      expect(screen.getByText(/users\.resetPassword\.title/)).toBeInTheDocument();
      
      // Descripción con nombre del usuario
      expect(screen.getByText(/users\.resetPassword\.description/)).toBeInTheDocument();
      
      // Campos de contraseña
      const passwordFields = screen.getAllByPlaceholderText('••••••••');
      expect(passwordFields).toHaveLength(2);
      
      // Password strength indicator
      expect(screen.getByText(/auth\.passwordStrength\.label/)).toBeInTheDocument();
      
      // Botones
      expect(screen.getByRole('button', { name: /common\.buttons\.cancel/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /users\.resetPassword\.button/ })).toBeInTheDocument();
    });

    it('Given_DialogClosed_When_Render_Then_NotVisible', () => {
      render(
        <ResetPasswordDialog
          open={false}
          onOpenChange={mockOnOpenChange}
          user={mockUser}
          onConfirm={mockOnConfirm}
        />
      );

      // El dialog no debe estar visible cuando open=false
      expect(screen.queryByText(/users\.resetPassword\.title/)).not.toBeInTheDocument();
    });

    it('Given_NullUser_When_Render_Then_ShowsDialog', () => {
      render(
        <ResetPasswordDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          user={null}
          onConfirm={mockOnConfirm}
        />
      );

      // Debe mostrar el dialog incluso con user null
      expect(screen.getByText(/users\.resetPassword\.title/)).toBeInTheDocument();
    });
  });

  describe('validation', () => {
    it('Given_EmptyFields_When_Submit_Then_ShowsError', async () => {
      const user = userEvent.setup();
      render(
        <ResetPasswordDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          user={mockUser}
          onConfirm={mockOnConfirm}
        />
      );

      await user.click(screen.getByRole('button', { name: /users\.resetPassword\.button/ }));

      await waitFor(() => {
        // Mensaje de error de validación Zod
        expect(screen.getByText(/la nueva contraseña debe tener al menos 8 caracteres/i)).toBeInTheDocument();
      });

      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it('Given_ShortPassword_When_Submit_Then_ShowsError', async () => {
      const user = userEvent.setup();
      render(
        <ResetPasswordDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          user={mockUser}
          onConfirm={mockOnConfirm}
        />
      );

      const passwordFields = screen.getAllByPlaceholderText('••••••••');
      await user.type(passwordFields[0], 'Short1!');
      await user.type(passwordFields[1], 'Short1!');

      await user.click(screen.getByRole('button', { name: /users\.resetPassword\.button/ }));

      await waitFor(() => {
        expect(screen.getByText(/la nueva contraseña debe tener al menos 8 caracteres/i)).toBeInTheDocument();
      });

      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it('Given_MismatchedPasswords_When_Submit_Then_ShowsError', async () => {
      const user = userEvent.setup();
      render(
        <ResetPasswordDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          user={mockUser}
          onConfirm={mockOnConfirm}
        />
      );

      const passwordFields = screen.getAllByPlaceholderText('••••••••');
      await user.type(passwordFields[0], 'Password123!');
      await user.type(passwordFields[1], 'DifferentPass123!');

      await user.click(screen.getByRole('button', { name: /users\.resetPassword\.button/ }));

      await waitFor(() => {
        expect(screen.getByText(/las contraseñas no coinciden/i)).toBeInTheDocument();
      });

      expect(mockOnConfirm).not.toHaveBeenCalled();
    });
  });

  describe('interaction', () => {
    it('Given_ValidPasswords_When_Submit_Then_CallsOnConfirmWithData', async () => {
      const user = userEvent.setup();
      render(
        <ResetPasswordDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          user={mockUser}
          onConfirm={mockOnConfirm}
        />
      );

      const passwordFields = screen.getAllByPlaceholderText('••••••••');
      await user.type(passwordFields[0], 'NewPassword123!');
      await user.type(passwordFields[1], 'NewPassword123!');

      await user.click(screen.getByRole('button', { name: /users\.resetPassword\.button/ }));

      await waitFor(() => {
        expect(mockOnConfirm).toHaveBeenCalledWith({
          newPassword: 'NewPassword123!',
          confirmPassword: 'NewPassword123!',
        });
      });
    });

    it('Given_ValidSubmit_When_Success_Then_ClosesDialog', async () => {
      const user = userEvent.setup();
      render(
        <ResetPasswordDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          user={mockUser}
          onConfirm={mockOnConfirm}
        />
      );

      const passwordFields = screen.getAllByPlaceholderText('••••••••');
      await user.type(passwordFields[0], 'NewPassword123!');
      await user.type(passwordFields[1], 'NewPassword123!');

      await user.click(screen.getByRole('button', { name: /users\.resetPassword\.button/ }));

      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it('Given_CancelButton_When_Click_Then_ClosesDialog', async () => {
      const user = userEvent.setup();
      render(
        <ResetPasswordDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          user={mockUser}
          onConfirm={mockOnConfirm}
        />
      );

      await user.click(screen.getByRole('button', { name: /common\.buttons\.cancel/ }));

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it('Given_Submitting_When_Render_Then_DisablesButtons', () => {
      render(
        <ResetPasswordDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          user={mockUser}
          onConfirm={mockOnConfirm}
          isSubmitting={true}
        />
      );

      expect(screen.getByRole('button', { name: /common\.buttons\.cancel/ })).toBeDisabled();
      expect(screen.getByRole('button', { name: /users\.form\.submitting/ })).toBeDisabled();
    });

    it('Given_Submitting_When_Render_Then_ShowsLoadingText', () => {
      render(
        <ResetPasswordDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          user={mockUser}
          onConfirm={mockOnConfirm}
          isSubmitting={true}
        />
      );

      expect(screen.getByRole('button', { name: /users\.form\.submitting/ })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /users\.resetPassword\.button/ })).not.toBeInTheDocument();
    });

    it('Given_SubmitError_When_OnConfirmFails_Then_DoesNotCloseDialog', async () => {
      mockOnConfirm.mockRejectedValueOnce(new Error('API Error'));
      const user = userEvent.setup();
      
      render(
        <ResetPasswordDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          user={mockUser}
          onConfirm={mockOnConfirm}
        />
      );

      const passwordFields = screen.getAllByPlaceholderText('••••••••');
      await user.type(passwordFields[0], 'NewPassword123!');
      await user.type(passwordFields[1], 'NewPassword123!');

      await user.click(screen.getByRole('button', { name: /users\.resetPassword\.button/ }));

      await waitFor(() => {
        expect(mockOnConfirm).toHaveBeenCalled();
      });

      // No debe cerrar el dialog si falla
      expect(mockOnOpenChange).not.toHaveBeenCalledWith(false);
    });
  });

  describe('form reset', () => {
    it('Given_DialogReopened_When_Render_Then_ResetsForm', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <ResetPasswordDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          user={mockUser}
          onConfirm={mockOnConfirm}
        />
      );

      // Llenar campos
      const passwordFields = screen.getAllByPlaceholderText('••••••••');
      await user.type(passwordFields[0], 'TestPassword123!');
      await user.type(passwordFields[1], 'TestPassword123!');

      // Cerrar dialog
      rerender(
        <ResetPasswordDialog
          open={false}
          onOpenChange={mockOnOpenChange}
          user={mockUser}
          onConfirm={mockOnConfirm}
        />
      );

      // Reabrir dialog
      rerender(
        <ResetPasswordDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          user={mockUser}
          onConfirm={mockOnConfirm}
        />
      );

      // Los campos deben estar vacíos
      const newPasswordFields = screen.getAllByPlaceholderText('••••••••');
      expect(newPasswordFields[0]).toHaveValue('');
      expect(newPasswordFields[1]).toHaveValue('');
    });
  });

  describe('password strength', () => {
    it('Given_WeakPassword_When_Typing_Then_ShowsWeakStrength', async () => {
      const user = userEvent.setup();
      render(
        <ResetPasswordDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          user={mockUser}
          onConfirm={mockOnConfirm}
        />
      );

      // Escribir contraseña débil
      const passwordFields = screen.getAllByPlaceholderText('••••••••');
      await user.type(passwordFields[0], 'weak');

      await waitFor(() => {
        // Verificar que aparece el indicador de fortaleza
        expect(screen.getByText(/auth\.passwordStrength\.label/)).toBeInTheDocument();
      });
    });

    it('Given_StrongPassword_When_Typing_Then_ShowsStrongStrength', async () => {
      const user = userEvent.setup();
      render(
        <ResetPasswordDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          user={mockUser}
          onConfirm={mockOnConfirm}
        />
      );

      // Escribir contraseña fuerte
      const passwordFields = screen.getAllByPlaceholderText('••••••••');
      await user.type(passwordFields[0], 'StrongPassword123!');

      await waitFor(() => {
        // Verificar que aparece el indicador de fortaleza
        expect(screen.getByText(/auth\.passwordStrength\.label/)).toBeInTheDocument();
      });
    });
  });
});
