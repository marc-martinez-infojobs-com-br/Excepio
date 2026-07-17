import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CopyButton } from '@components/ui/copy-button';

describe('CopyButton', () => {
  it('debería renderizar el botón con icono de copiar', () => {
    render(<CopyButton text="test content" />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(screen.getByTestId('copy-icon')).toBeInTheDocument();
  });

  it('debería llamar a onCopy con el texto al hacer click', async () => {
    const user = userEvent.setup();
    const mockOnCopy = vi.fn().mockResolvedValue(undefined);
    const textToCopy = 'Stack trace content here';

    render(<CopyButton text={textToCopy} onCopy={mockOnCopy} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(mockOnCopy).toHaveBeenCalledWith(textToCopy);
  });

  it('debería mostrar icono de check después de copiar exitosamente', async () => {
    const user = userEvent.setup();
    const mockOnCopy = vi.fn().mockResolvedValue(undefined);

    render(<CopyButton text="test" onCopy={mockOnCopy} />);

    const button = screen.getByRole('button');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    });
  });

  it('debería aplicar className personalizado', () => {
    render(<CopyButton text="test" className="custom-class" />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('debería mostrar tooltip con label personalizado', () => {
    render(<CopyButton text="test" label="Copiar código" />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Copiar código');
  });

  it('debería mantener icono de copiar si onCopy falla', async () => {
    const user = userEvent.setup();
    const mockOnCopy = vi.fn().mockRejectedValue(new Error('Copy failed'));

    render(<CopyButton text="test" onCopy={mockOnCopy} />);

    const button = screen.getByRole('button');
    await user.click(button);

    // Debe seguir mostrando el icono de copiar porque falló
    expect(screen.getByTestId('copy-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('check-icon')).not.toBeInTheDocument();
  });
});
