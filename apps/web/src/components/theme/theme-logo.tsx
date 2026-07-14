'use client';

import { useTheme } from 'next-themes';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface ThemeLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export function ThemeLogo({ width = 40, height = 40, className }: ThemeLogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Evitar hydration mismatch
  if (!mounted) {
    return <div style={{ width, height }} className={className} />;
  }

  const logoSrc = resolvedTheme === 'dark' ? '/logo-dark.svg' : '/logo-light.svg';

  return (
    <Image
      src={logoSrc}
      alt="Excepio"
      width={width}
      height={height}
      className={className}
      priority
    />
  );
}
