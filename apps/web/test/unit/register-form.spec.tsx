import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterForm } from '@components/auth/register-form';

// Mock de useAuth
const mockRegister = vi.fn();
vi.mock('@hooks/use-auth', () => ({
  useAuth: () => ({
    register: mockRegister,
  }),
}));

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render all form fields', () => {
      render(<RegisterForm />);

      // Los placeholders usan keys de traducción
      expect(screen.getByPlaceholderText(/auth\.register\.namePlaceholder/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/auth\.register\.emailPlaceholder/)).toBeInTheDocument();
      // Hay dos campos de contraseña, ambos con placeholder ••••••••
      const passwordFields = screen.getAllByPlaceholderText('••••••••');
      expect(passwordFields).toHaveLength(2);
    });

    it('should render submit button', () => {
      render(<RegisterForm />);

      expect(screen.getByRole('button', { name: /auth\.register\.submit/ })).toBeInTheDocument();
    });

    it('should render password strength component', () => {
      render(<RegisterForm />);

      // Con el mock de i18n, se muestran las keys de traducción
      expect(screen.getByText(/auth\.passwordStrength\.label/)).toBeInTheDocument();
      // minLength es una requirement key
      expect(screen.getByText(/auth\.passwordStrength\.requirements\.minLength/)).toBeInTheDocument();
    });

    it('should have empty fields initially', () => {
      render(<RegisterForm />);

      expect(screen.getByPlaceholderText(/auth\.register\.namePlaceholder/)).toHaveValue('');
      expect(screen.getByPlaceholderText(/auth\.register\.emailPlaceholder/)).toHaveValue('');
      const passwordFields = screen.getAllByPlaceholderText('••••••••');
      passwordFields.forEach((field) => {
        expect(field).toHaveValue('');
      });
    });
  });

  describe('validation', () => {
    it('should show error for empty name', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.click(screen.getByRole('button', { name: /auth\.register\.submit/ }));

      await waitFor(() => {
        // Los mensajes de validación vienen del schema de Zod (hardcodeados en shared)
        expect(screen.getByText(/el nombre es requerido/i)).toBeInTheDocument();
      });
    });

    it('should show error for invalid email', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const passwordFields = screen.getAllByPlaceholderText('••••••••');

      await user.type(screen.getByPlaceholderText(/auth\.register\.namePlaceholder/), 'Test User');
      await user.type(screen.getByPlaceholderText(/auth\.register\.emailPlaceholder/), 'invalid-email');
      await user.type(passwordFields[0], 'Password1!');
      await user.type(passwordFields[1], 'Password1!');
      await user.click(screen.getByRole('button', { name: /auth\.register\.submit/ }));

      // Con email inválido, no debería llamarse a register
      await waitFor(() => {
        expect(mockRegister).not.toHaveBeenCalled();
      });
    });

    it('should show error for weak password', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const passwordFields = screen.getAllByPlaceholderText('••••••••');

      await user.type(screen.getByPlaceholderText(/auth\.register\.namePlaceholder/), 'Test User');
      await user.type(screen.getByPlaceholderText(/auth\.register\.emailPlaceholder/), 'test@example.com');
      await user.type(passwordFields[0], 'weak');
      await user.type(passwordFields[1], 'weak');
      await user.click(screen.getByRole('button', { name: /auth\.register\.submit/ }));

      await waitFor(() => {
        // El mensaje puede variar dependiendo de qué validación falle primero
        const errorMessages = screen.getAllByText(/requisitos|seguridad|caracteres/i);
        expect(errorMessages.length).toBeGreaterThan(0);
      });
    });

    it('should show error for non-matching passwords', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const passwordFields = screen.getAllByPlaceholderText('••••••••');

      await user.type(screen.getByPlaceholderText(/auth\.register\.namePlaceholder/), 'Test User');
      await user.type(screen.getByPlaceholderText(/auth\.register\.emailPlaceholder/), 'test@example.com');
      await user.type(passwordFields[0], 'Password1!');
      await user.type(passwordFields[1], 'DifferentPassword1!');
      await user.click(screen.getByRole('button', { name: /auth\.register\.submit/ }));

      // Verificamos que NO se llama a register porque las contraseñas no coinciden
      await waitFor(() => {
        expect(mockRegister).not.toHaveBeenCalled();
      });
      
      // Verificamos que se muestra el mensaje de error (viene del schema de Zod o traducción)
      await waitFor(() => {
        // Puede venir del schema shared o de traducciones
        const errorTexts = screen.queryAllByText(/contraseñas no coinciden|auth\.register\.passwordMismatch/i);
        expect(errorTexts.length).toBeGreaterThan(0);
      });
    });
  });

  describe('submission', () => {
    it('should call register with correct data on valid submission', async () => {
      const user = userEvent.setup();
      mockRegister.mockResolvedValue(undefined);
      render(<RegisterForm />);

      const passwordFields = screen.getAllByPlaceholderText('••••••••');

      await user.type(screen.getByPlaceholderText(/auth\.register\.namePlaceholder/), 'Test User');
      await user.type(screen.getByPlaceholderText(/auth\.register\.emailPlaceholder/), 'test@example.com');
      await user.type(passwordFields[0], 'Password1!');
      await user.type(passwordFields[1], 'Password1!');
      await user.click(screen.getByRole('button', { name: /auth\.register\.submit/ }));

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Test User',
            email: 'test@example.com',
            password: 'Password1!',
          })
        );
      });
    });

    it('should disable button while submitting', async () => {
      const user = userEvent.setup();
      // Make register hang to test loading state
      mockRegister.mockImplementation(() => new Promise(() => {}));
      render(<RegisterForm />);

      const passwordFields = screen.getAllByPlaceholderText('••••••••');

      await user.type(screen.getByPlaceholderText(/auth\.register\.namePlaceholder/), 'Test User');
      await user.type(screen.getByPlaceholderText(/auth\.register\.emailPlaceholder/), 'test@example.com');
      await user.type(passwordFields[0], 'Password1!');
      await user.type(passwordFields[1], 'Password1!');
      await user.click(screen.getByRole('button', { name: /auth\.register\.submit/ }));

      await waitFor(() => {
        // El botón en estado submitting muestra la key de traducción auth.register.submitting
        expect(screen.getByRole('button', { name: /auth\.register\.submitting/ })).toBeDisabled();
      });
    });

    it('should show error message on registration failure', async () => {
      const user = userEvent.setup();
      mockRegister.mockRejectedValue(new Error('El email ya está registrado'));
      render(<RegisterForm />);

      const passwordFields = screen.getAllByPlaceholderText('••••••••');

      await user.type(screen.getByPlaceholderText(/auth\.register\.namePlaceholder/), 'Test User');
      await user.type(screen.getByPlaceholderText(/auth\.register\.emailPlaceholder/), 'test@example.com');
      await user.type(passwordFields[0], 'Password1!');
      await user.type(passwordFields[1], 'Password1!');
      await user.click(screen.getByRole('button', { name: /auth\.register\.submit/ }));

      await waitFor(() => {
        expect(screen.getByText(/el email ya está registrado/i)).toBeInTheDocument();
      });
    });
  });

  describe('password strength indicator', () => {
    it('should update password strength as user types', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const passwordFields = screen.getAllByPlaceholderText('••••••••');

      // Initially weak - usa la key de traducción auth.passwordStrength.weak
      expect(screen.getByText(/auth\.passwordStrength\.weak/)).toBeInTheDocument();

      // Type a strong password
      await user.type(passwordFields[0], 'Password1!');

      await waitFor(() => {
        // "Muy Fuerte" es la traducción de veryStrong
        expect(screen.getByText(/auth\.passwordStrength\.veryStrong/)).toBeInTheDocument();
      });
    });
  });
});
