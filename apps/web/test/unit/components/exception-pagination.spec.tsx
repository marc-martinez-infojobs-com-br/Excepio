import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExceptionPagination } from '@components/exceptions/exception-pagination';

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

    // Mostrar rango actual y total (desktop)
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

    // Hay 2 botones previous y 2 next (móvil y desktop)
    expect(screen.getAllByRole('button', { name: /prev/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('button', { name: /next/i }).length).toBeGreaterThanOrEqual(1);
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

    // Todos los botones previous deberían estar deshabilitados
    const prevButtons = screen.getAllByRole('button', { name: /prev/i });
    prevButtons.forEach(btn => expect(btn).toBeDisabled());
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

    // Todos los botones next deberían estar deshabilitados
    const nextButtons = screen.getAllByRole('button', { name: /next/i });
    nextButtons.forEach(btn => expect(btn).toBeDisabled());
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

    // Click en el primer botón next (móvil)
    const nextButtons = screen.getAllByRole('button', { name: /next/i });
    await user.click(nextButtons[0]);

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

    // Click en el primer botón prev (móvil)
    const prevButtons = screen.getAllByRole('button', { name: /prev/i });
    await user.click(prevButtons[0]);

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

  it('debería mostrar números de página clickeables en desktop', async () => {
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

    // Debería mostrar página 2 (desktop)
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

    // Con 50 páginas, debería mostrar ellipsis (desktop)
    expect(screen.getByText('...')).toBeInTheDocument();
    // Y la última página
    expect(screen.getByRole('button', { name: '50' })).toBeInTheDocument();
  });

  it('debería mostrar Page X of Y en móvil', () => {
    const onPageChange = vi.fn();

    render(
      <ExceptionPagination
        page={2}
        limit={20}
        total={100}
        onPageChange={onPageChange}
      />
    );

    // Mobile muestra "Page X of Y" - con mock devuelve la key de traducción
    // El componente usa t('page') que con el mock devuelve "exceptions.pagination.page"
    expect(screen.getByText(/exceptions\.pagination\.page/)).toBeInTheDocument();
    // "of" aparece múltiples veces (mobile y desktop)
    expect(screen.getAllByText(/exceptions\.pagination\.of/).length).toBeGreaterThanOrEqual(1);
  });
});
