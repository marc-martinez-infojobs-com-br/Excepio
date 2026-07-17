'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@lib/utils';

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
  onCopy?: (text: string) => Promise<void>;
}

export function CopyButton({ text, label = 'Copy', className, onCopy }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (onCopy) {
        await onCopy(text);
      } else {
        await navigator.clipboard.writeText(text);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Silently fail - clipboard might not be available
      console.error('Failed to copy to clipboard:', error);
    }
  };

  return (
    <button
      onClick={handleCopy}
      title={label}
      className={cn(
        'p-1.5 rounded-md transition-colors',
        'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700',
        className
      )}
    >
      {copied ? (
        <Check className="h-4 w-4" data-testid="check-icon" />
      ) : (
        <Copy className="h-4 w-4" data-testid="copy-icon" />
      )}
    </button>
  );
}
