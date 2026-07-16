'use client';

import { type ComponentType } from 'react';
import { cn } from '@lib/utils';

// Lucide icons (prefijo Lu)
import {
  LuMonitor,
  LuSmartphone,
  LuServer,
  LuCpu,
  LuGlobe,
  LuTerminal,
  LuCloud,
  LuDatabase,
} from 'react-icons/lu';

// Ionicons (prefijo Io)
import { IoLogoAndroid, IoLogoApple } from 'react-icons/io5';

// Font Awesome (prefijo Fa)
import { FaWindows, FaLinux } from 'react-icons/fa';

// Registro de iconos disponibles
const iconRegistry: Record<string, ComponentType<{ className?: string }>> = {
  // Lucide
  LuMonitor,
  LuSmartphone,
  LuServer,
  LuCpu,
  LuGlobe,
  LuTerminal,
  LuCloud,
  LuDatabase,
  // Ionicons
  IoLogoAndroid,
  IoLogoApple,
  // Font Awesome
  FaWindows,
  FaLinux,
};

// Lista de iconos disponibles para el selector
export const availableIcons = [
  { name: 'LuMonitor', label: 'Monitor' },
  { name: 'LuSmartphone', label: 'Smartphone' },
  { name: 'LuServer', label: 'Server' },
  { name: 'LuCpu', label: 'CPU' },
  { name: 'LuGlobe', label: 'Globe' },
  { name: 'LuTerminal', label: 'Terminal' },
  { name: 'LuCloud', label: 'Cloud' },
  { name: 'LuDatabase', label: 'Database' },
  { name: 'IoLogoAndroid', label: 'Android' },
  { name: 'IoLogoApple', label: 'Apple/iOS' },
  { name: 'FaWindows', label: 'Windows' },
  { name: 'FaLinux', label: 'Linux' },
];

interface PlatformIconProps {
  /** Nombre del icono (ej: 'LuMonitor', 'IoLogoAndroid') */
  iconName?: string | null;
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * Componente que renderiza un icono de plataforma dinámicamente.
 * Soporta iconos de Lucide (Lu*), Ionicons (Io*) y Font Awesome (Fa*).
 */
export function PlatformIcon({ iconName, className }: PlatformIconProps) {
  const iconClass = cn('h-5 w-5', className);

  if (!iconName) {
    // Icono por defecto si no hay ninguno definido
    return <LuCpu className={iconClass} />;
  }

  const IconComponent = iconRegistry[iconName];

  if (!IconComponent) {
    // Fallback si el icono no existe en el registro
    console.warn(`Icon "${iconName}" not found in registry`);
    return <LuCpu className={iconClass} />;
  }

  return <IconComponent className={iconClass} />;
}
