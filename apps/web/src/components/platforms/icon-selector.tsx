'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@lib/utils';
import { Button } from '@components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@components/ui/popover';
import { PlatformIcon, availableIcons } from '@components/platforms/platform-icon';
import { ChevronDown } from 'lucide-react';

interface IconSelectorProps {
  value?: string | null;
  onChange: (iconName: string) => void;
  disabled?: boolean;
}

export function IconSelector({ value, onChange, disabled }: IconSelectorProps) {
  const t = useTranslations('platforms.form');
  const [open, setOpen] = useState(false);

  const selectedIcon = availableIcons.find((icon) => icon.name === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          <span className="flex items-center gap-2">
            {value ? (
              <>
                <PlatformIcon iconName={value} className="h-4 w-4" />
                <span>{selectedIcon?.label || value}</span>
              </>
            ) : (
              <span className="text-muted-foreground">
                {t('iconPlaceholder')}
              </span>
            )}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <div className="grid grid-cols-4 gap-2">
          {availableIcons.map((icon) => (
            <Button
              key={icon.name}
              variant="ghost"
              className={cn(
                'h-12 w-full flex flex-col items-center justify-center gap-1 p-2',
                value === icon.name && 'bg-accent'
              )}
              onClick={() => {
                onChange(icon.name);
                setOpen(false);
              }}
              title={icon.label}
            >
              <PlatformIcon iconName={icon.name} className="h-5 w-5" />
              <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                {icon.label}
              </span>
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
