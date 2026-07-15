import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExceptionPagination } from '@/components/exceptions/exception-pagination';

describe('ExceptionPagination', () => {
  it('debería renderizar información de paginación', () => {
    const onPageChange = vi.fn();

    render(
      <ExceptionPagination
        page={1}
        limit={20}
        total={100}
        onPageChange={onPageChange}
      />
    );

    // Mostrar rango actual y total
    expect(screen.getByText(/1 - 20/)).toBeInTheDocument();
    expect(screen.getByText(/100/)).toBeInTheDocument();
  });

  it('debería renderizar botones de navegación', () => {
    const onPageChange = vi.fn();

    render(
      <ExceptionPagination
        page={2}
        limit={20}
        total={100}
        onPageChange={onPageChange}
      />
    );

    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('debería deshabilitar botón "Previous" en la primera página', () => {
    const onPageChange = vi.fn();

    render(
      <ExceptionPagination
        page={1}
        limit={20}
        total={100}
        onPageChange={onPageChange}
      />
    );

    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
  });

  it('debería deshabilitar botón "Next" en la última página', () => {
    const onPageChange = vi.fn();

    render(
      <ExceptionPagination
        page={5}
        limit={20}
        total={100}
        onPageChange={onPageChange}
      />
    );

    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });

  it('debería llamar onPageChange al hacer click en "Next"', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(
      <ExceptionPagination
        page={1}
        limit={20}
        total={100}
        onPageChange={onPageChange}
      />
    );

    await user.click(screen.getByRole('button', { name: /next/i }));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('debería llamar onPageChange al hacer click en "Previous"', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(
      <ExceptionPagination
        page={3}
        limit={20}
        total={100}
        onPageChange={onPageChange}
      />
    );

    await user.click(screen.getByRole('button', { name: /previous/i }));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('debería mostrar el rango correcto para páginas intermedias', () => {
    const onPageChange = vi.fn();

    render(
      <ExceptionPagination
        page={3}
        limit={20}
        total={100}
        onPageChange={onPageChange}
      />
    );

    expect(screen.getByText(/41 - 60/)).toBeInTheDocument();
  });

  it('debería mostrar el rango correcto para la última página parcial', () => {
    const onPageChange = vi.fn();

    render(
      <ExceptionPagination
        page={3}
        limit={20}
        total={55}
        onPageChange={onPageChange}
      />
    );

    // Página 3 con limit 20, total 55 → 41-55
    expect(screen.getByText(/41 - 55/)).toBeInTheDocument();
  });

  it('debería mostrar números de página clickeables', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(
      <ExceptionPagination
        page={1}
        limit={20}
        total={100}
        onPageChange={onPageChange}
      />
    );

    // Debería mostrar página 2
    const page2Button = screen.getByRole('button', { name: '2' });
    expect(page2Button).toBeInTheDocument();
    
    await user.click(page2Button);
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('no debería mostrar paginación si total es 0', () => {
    const onPageChange = vi.fn();

    const { container } = render(
      <ExceptionPagination
        page={1}
        limit={20}
        total={0}
        onPageChange={onPageChange}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('debería mostrar ellipsis cuando hay muchas páginas', () => {
    const onPageChange = vi.fn();

    render(
      <ExceptionPagination
        page={1}
        limit={20}
        total={1000}
        onPageChange={onPageChange}
      />
    );

    // Con 50 páginas, debería mostrar ellipsis
    expect(screen.getByText('...')).toBeInTheDocument();
    // Y la última página
    expect(screen.getByRole('button', { name: '50' })).toBeInTheDocument();
  });
});
