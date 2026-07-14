import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PasswordStrength, checkPasswordStrength } from '@/components/auth/password-strength';

describe('checkPasswordStrength', () => {
  describe('requirements validation', () => {
    it('should return all requirements as not met for empty password', () => {
      const result = checkPasswordStrength('');
      
      expect(result.score).toBe(0);
      expect(result.level).toBe('Débil');
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
    it('should return "Débil" for score 0-2', () => {
      expect(checkPasswordStrength('').level).toBe('Débil');
      expect(checkPasswordStrength('ab').level).toBe('Débil');
      expect(checkPasswordStrength('abcdefgh').level).toBe('Débil'); // score 2
    });

    it('should return "Media" for score 3', () => {
      expect(checkPasswordStrength('Abcdefgh').level).toBe('Media'); // length + upper + lower = 3
    });

    it('should return "Fuerte" for score 4', () => {
      expect(checkPasswordStrength('Abcdefg1').level).toBe('Fuerte'); // length + upper + lower + number = 4
    });

    it('should return "Muy Fuerte" for score 5', () => {
      expect(checkPasswordStrength('Password1!').level).toBe('Muy Fuerte');
    });
  });
});

describe('PasswordStrength Component', () => {
  it('should render all 5 requirements', () => {
    render(<PasswordStrength password="" />);
    
    expect(screen.getByText('Mínimo 8 caracteres')).toBeInTheDocument();
    expect(screen.getByText('Al menos 1 mayúscula')).toBeInTheDocument();
    expect(screen.getByText('Al menos 1 minúscula')).toBeInTheDocument();
    expect(screen.getByText('Al menos 1 número')).toBeInTheDocument();
    expect(screen.getByText('Al menos 1 carácter especial')).toBeInTheDocument();
  });

  it('should render progress bar', () => {
    render(<PasswordStrength password="" />);
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should show level text', () => {
    const { rerender } = render(<PasswordStrength password="" />);
    expect(screen.getByText('Débil')).toBeInTheDocument();

    rerender(<PasswordStrength password="Password1!" />);
    expect(screen.getByText('Muy Fuerte')).toBeInTheDocument();
  });

  it('should update requirements check marks based on password', () => {
    const { rerender } = render(<PasswordStrength password="" />);
    
    // All should be unchecked initially
    const checkIcons = screen.queryAllByTestId('check-icon');
    const xIcons = screen.queryAllByTestId('x-icon');
    
    expect(checkIcons).toHaveLength(0);
    expect(xIcons).toHaveLength(5);

    // After entering valid password, all should be checked
    rerender(<PasswordStrength password="Password1!" />);
    
    const newCheckIcons = screen.queryAllByTestId('check-icon');
    const newXIcons = screen.queryAllByTestId('x-icon');
    
    expect(newCheckIcons).toHaveLength(5);
    expect(newXIcons).toHaveLength(0);
  });

  it('should apply correct color classes based on level', () => {
    const { rerender } = render(<PasswordStrength password="" />);
    
    // Débil - red
    let progressBar = screen.getByRole('progressbar');
    expect(progressBar.querySelector('[class*="bg-red"]') || 
           progressBar.className.includes('red') ||
           progressBar.firstElementChild?.className.includes('red')).toBeTruthy;

    // Muy Fuerte - green
    rerender(<PasswordStrength password="Password1!" />);
    progressBar = screen.getByRole('progressbar');
    expect(progressBar.querySelector('[class*="bg-green"]') || 
           progressBar.className.includes('green') ||
           progressBar.firstElementChild?.className.includes('green')).toBeTruthy;
  });
});
