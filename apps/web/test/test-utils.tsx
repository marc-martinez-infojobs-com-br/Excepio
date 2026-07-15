import { render, RenderOptions } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { ReactElement, ReactNode } from 'react';
import esMessages from '../messages/es.json';

interface WrapperProps {
  children: ReactNode;
}

function IntlWrapper({ children }: WrapperProps) {
  return (
    <NextIntlClientProvider locale="es" messages={esMessages}>
      {children}
    </NextIntlClientProvider>
  );
}

export function renderWithIntl(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: IntlWrapper, ...options });
}

export * from '@testing-library/react';
export { renderWithIntl as render };
