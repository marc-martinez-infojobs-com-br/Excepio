'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ThemeAvatarProps {
  name: string;
  src?: string;
  className?: string;
}

export function ThemeAvatar({ name, src, className }: ThemeAvatarProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Colores según el tema (igual que el logo)
  const bgColor = mounted && resolvedTheme === 'dark' ? '#2a2b33' : '#3b82f6';
  const textColor = mounted && resolvedTheme === 'dark' ? '#abc3ff' : '#ffffff';

  return (
    <Avatar className={className}>
      <AvatarImage src={src} alt={name} />
      <AvatarFallback 
        className="text-xs font-medium"
        style={{ backgroundColor: bgColor, color: textColor }}
      >
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
