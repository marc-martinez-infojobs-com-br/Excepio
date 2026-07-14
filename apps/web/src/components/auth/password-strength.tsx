'use client';

import { Check, X } from 'lucide-react';

interface PasswordRequirement {
  key: string;
  text: string;
  met: boolean;
}

interface PasswordStrengthResult {
  score: number;
  level: 'Débil' | 'Media' | 'Fuerte' | 'Muy Fuerte';
  requirements: PasswordRequirement[];
}

/**
 * Valida la fortaleza de una contraseña
 * Retorna el score (0-5), el nivel y los requisitos cumplidos
 */
export function checkPasswordStrength(password: string): PasswordStrengthResult {
  const requirements: PasswordRequirement[] = [
    {
      key: 'minLength',
      text: 'Mínimo 8 caracteres',
      met: password.length >= 8,
    },
    {
      key: 'uppercase',
      text: 'Al menos 1 mayúscula',
      met: /[A-Z]/.test(password),
    },
    {
      key: 'lowercase',
      text: 'Al menos 1 minúscula',
      met: /[a-z]/.test(password),
    },
    {
      key: 'number',
      text: 'Al menos 1 número',
      met: /[0-9]/.test(password),
    },
    {
      key: 'special',
      text: 'Al menos 1 carácter especial',
      met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    },
  ];

  const score = requirements.filter((r) => r.met).length;

  let level: PasswordStrengthResult['level'];
  if (score <= 2) {
    level = 'Débil';
  } else if (score === 3) {
    level = 'Media';
  } else if (score === 4) {
    level = 'Fuerte';
  } else {
    level = 'Muy Fuerte';
  }

  return { score, level, requirements };
}

interface PasswordStrengthProps {
  password: string;
}

/**
 * Componente que muestra la fortaleza de una contraseña
 * Incluye barra de progreso y lista de requisitos
 */
export function PasswordStrength({ password }: PasswordStrengthProps) {
  const { score, level, requirements } = checkPasswordStrength(password);

  // Colores según el nivel
  const getColorClass = () => {
    switch (level) {
      case 'Débil':
        return 'bg-red-500';
      case 'Media':
        return 'bg-yellow-500';
      case 'Fuerte':
        return 'bg-green-400';
      case 'Muy Fuerte':
        return 'bg-green-600';
      default:
        return 'bg-gray-300';
    }
  };

  const getLevelColorClass = () => {
    switch (level) {
      case 'Débil':
        return 'text-red-500';
      case 'Media':
        return 'text-yellow-500';
      case 'Fuerte':
        return 'text-green-400';
      case 'Muy Fuerte':
        return 'text-green-600';
      default:
        return 'text-muted-foreground';
    }
  };

  // Porcentaje de la barra
  const percentage = (score / 5) * 100;

  return (
    <div className="space-y-2 mt-2">
      {/* Barra de progreso */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-muted-foreground">Fortaleza:</span>
          <span className={`font-medium ${getLevelColorClass()}`}>{level}</span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={5}
          className="h-1 w-full bg-muted rounded-full overflow-hidden"
        >
          <div
            className={`h-full transition-all duration-300 ${getColorClass()}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Lista de requisitos - más compacta */}
      <ul className="grid grid-cols-2 gap-x-2 gap-y-0.5">
        {requirements.map((req) => (
          <li
            key={req.key}
            className={`flex items-center gap-1 text-[10px] ${
              req.key === 'special' ? 'col-span-2' : ''
            } ${
              req.met ? 'text-green-600' : 'text-muted-foreground'
            }`}
          >
            {req.met ? (
              <Check className="h-3 w-3 flex-shrink-0" data-testid="check-icon" />
            ) : (
              <X className="h-3 w-3 flex-shrink-0" data-testid="x-icon" />
            )}
            <span className="truncate">{req.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
