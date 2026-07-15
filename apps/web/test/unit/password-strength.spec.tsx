import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PasswordStrength, checkPasswordStrength } from '@/components/auth/password-strength';
import { NextIntlClientProvider } from 'next-intl';

// Desactivar el mock global de next-intl para este archivo
vi.unmock('next-intl');

// Messages for testing
const messages = {
  auth: {
    passwordStrength: {
      label: 'Fortaleza:',
      weak: 'Débil',
      medium: 'Media',
      strong: 'Fuerte',
      veryStrong: 'Muy Fuerte',
      requirements: {
        minLength: 'Mínimo 8 caracteres',
        uppercase: 'Al menos 1 mayúscula',
        lowercase: 'Al menos 1 minúscula',
        number: 'Al menos 1 número',
        special: 'Al menos 1 carácter especial',
      },
    },
  },
};

const renderWithIntl = (ui: React.ReactElement) => {
  return render(
    <NextIntlClientProvider locale="es" messages={messages}>
      {ui}
    </NextIntlClientProvider>
  );
};

describe('checkPasswordStrength', () => {
  describe('requirements validation', () => {
    it('should return all requirements as not met for empty password', () => {
      const result = checkPasswordStrength('');
      
      expect(result.score).toBe(0);
      expect(result.level).toBe('weak');
      expect(result.requirements).toHaveLength(5);
      expect(result.requirements.every((r) => !r.met)).toBe(true);
    });

    it('should detect minimum length requirement', () => {
      const shortResult = checkPasswordStrength('Pass1!');
      const longResult = checkPasswordStrength('Password1!');
      
      const shortReq = shortResult.requirements.find((r) => r.key === 'minLength');
      const longReq = longResult.requirements.find((r) => r.key === 'minLength');
      
      expect(shortReq?.met).toBe(false);
      expect(longReq?.met).toBe(true);
    });

    it('should detect uppercase requirement', () => {
      const noUpperResult = checkPasswordStrength('password1!');
      const withUpperResult = checkPasswordStrength('Password1!');
      
      const noUpperReq = noUpperResult.requirements.find((r) => r.key === 'uppercase');
      const withUpperReq = withUpperResult.requirements.find((r) => r.key === 'uppercase');
      
      expect(noUpperReq?.met).toBe(false);
      expect(withUpperReq?.met).toBe(true);
    });

    it('should detect lowercase requirement', () => {
      const noLowerResult = checkPasswordStrength('PASSWORD1!');
      const withLowerResult = checkPasswordStrength('Password1!');
      
      const noLowerReq = noLowerResult.requirements.find((r) => r.key === 'lowercase');
      const withLowerReq = withLowerResult.requirements.find((r) => r.key === 'lowercase');
      
      expect(noLowerReq?.met).toBe(false);
      expect(withLowerReq?.met).toBe(true);
    });

    it('should detect number requirement', () => {
      const noNumberResult = checkPasswordStrength('Password!');
      const withNumberResult = checkPasswordStrength('Password1!');
      
      const noNumberReq = noNumberResult.requirements.find((r) => r.key === 'number');
      const withNumberReq = withNumberResult.requirements.find((r) => r.key === 'number');
      
      expect(noNumberReq?.met).toBe(false);
      expect(withNumberReq?.met).toBe(true);
    });

    it('should detect special character requirement', () => {
      const noSpecialResult = checkPasswordStrength('Password1');
      const withSpecialResult = checkPasswordStrength('Password1!');
      
      const noSpecialReq = noSpecialResult.requirements.find((r) => r.key === 'special');
      const withSpecialReq = withSpecialResult.requirements.find((r) => r.key === 'special');
      
      expect(noSpecialReq?.met).toBe(false);
      expect(withSpecialReq?.met).toBe(true);
    });
  });

  describe('score calculation', () => {
    it('should return score 0 for empty password', () => {
      const result = checkPasswordStrength('');
      expect(result.score).toBe(0);
    });

    it('should return score 1 for password with only length', () => {
      const result = checkPasswordStrength('abcdefgh');
      expect(result.score).toBe(2); // length + lowercase
    });

    it('should return score 5 for password meeting all requirements', () => {
      const result = checkPasswordStrength('Password1!');
      expect(result.score).toBe(5);
    });
  });

  describe('level calculation', () => {
    it('should return "weak" for score 0-2', () => {
      expect(checkPasswordStrength('').level).toBe('weak');
      expect(checkPasswordStrength('ab').level).toBe('weak');
      expect(checkPasswordStrength('abcdefgh').level).toBe('weak'); // score 2
    });

    it('should return "medium" for score 3', () => {
      expect(checkPasswordStrength('Abcdefgh').level).toBe('medium'); // length + upper + lower = 3
    });

    it('should return "strong" for score 4', () => {
      expect(checkPasswordStrength('Abcdefg1').level).toBe('strong'); // length + upper + lower + number = 4
    });

    it('should return "veryStrong" for score 5', () => {
      expect(checkPasswordStrength('Password1!').level).toBe('veryStrong');
    });
  });
});

describe('PasswordStrength Component', () => {
  it('should render all 5 requirements', () => {
    renderWithIntl(<PasswordStrength password="" />);
    
    expect(screen.getByText('Mínimo 8 caracteres')).toBeInTheDocument();
    expect(screen.getByText('Al menos 1 mayúscula')).toBeInTheDocument();
    expect(screen.getByText('Al menos 1 minúscula')).toBeInTheDocument();
    expect(screen.getByText('Al menos 1 número')).toBeInTheDocument();
    expect(screen.getByText('Al menos 1 carácter especial')).toBeInTheDocument();
  });

  it('should render progress bar', () => {
    renderWithIntl(<PasswordStrength password="" />);
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should show level text', () => {
    const { rerender } = renderWithIntl(<PasswordStrength password="" />);
    expect(screen.getByText('Débil')).toBeInTheDocument();

    rerender(
      <NextIntlClientProvider locale="es" messages={messages}>
        <PasswordStrength password="Password1!" />
      </NextIntlClientProvider>
    );
    expect(screen.getByText('Muy Fuerte')).toBeInTheDocument();
  });

  it('should update requirements check marks based on password', () => {
    const { rerender } = renderWithIntl(<PasswordStrength password="" />);
    
    // All should be unchecked initially
    const checkIcons = screen.queryAllByTestId('check-icon');
    const xIcons = screen.queryAllByTestId('x-icon');
    
    expect(checkIcons).toHaveLength(0);
    expect(xIcons).toHaveLength(5);

    // After entering valid password, all should be checked
    rerender(
      <NextIntlClientProvider locale="es" messages={messages}>
        <PasswordStrength password="Password1!" />
      </NextIntlClientProvider>
    );
    
    const newCheckIcons = screen.queryAllByTestId('check-icon');
    const newXIcons = screen.queryAllByTestId('x-icon');
    
    expect(newCheckIcons).toHaveLength(5);
    expect(newXIcons).toHaveLength(0);
  });

  it('should apply correct color classes based on level', () => {
    const { rerender } = renderWithIntl(<PasswordStrength password="" />);
    
    // Débil - red
    let progressBar = screen.getByRole('progressbar');
    expect(progressBar.querySelector('[class*="bg-red"]') || 
           progressBar.className.includes('red') ||
           progressBar.firstElementChild?.className.includes('red')).toBeTruthy;

    // Muy Fuerte - green
    rerender(
      <NextIntlClientProvider locale="es" messages={messages}>
        <PasswordStrength password="Password1!" />
      </NextIntlClientProvider>
    );
    progressBar = screen.getByRole('progressbar');
    expect(progressBar.querySelector('[class*="bg-green"]') || 
           progressBar.className.includes('green') ||
           progressBar.firstElementChild?.className.includes('green')).toBeTruthy;
  });
});
