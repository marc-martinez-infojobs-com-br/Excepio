'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface ExceptionPaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

const VISIBLE_PAGES = 10;
const LIMIT_OPTIONS = [25, 50, 100];

export function ExceptionPagination({
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
}: ExceptionPaginationProps) {
  const t = useTranslations('exceptions.pagination');
  
  if (total === 0) {
    return null;
  }

  const totalPages = Math.ceil(total / limit);
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  const isFirstPage = page === 1;
  const isLastPage = page === totalPages;

  // Generar números de página visibles (siempre 10 números cuando sea posible)
  const getVisiblePages = (): (number | 'ellipsis-start' | 'ellipsis-end')[] => {
    const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = [];
    
    if (totalPages <= VISIBLE_PAGES) {
      // Mostrar todas las páginas si son 10 o menos
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }
    
    // Más de 10 páginas: necesitamos ellipsis
    // Reservamos 2 espacios para ellipsis (inicio y/o fin) + primera y última página
    // Eso nos deja 8 números para mostrar en el medio cuando hay 2 ellipsis
    // O 9 números cuando solo hay 1 ellipsis
    
    const showStartEllipsis = page > 5;
    const showEndEllipsis = page < totalPages - 4;
    
    if (!showStartEllipsis && showEndEllipsis) {
      // Cerca del inicio: 1 2 3 4 5 6 7 8 ... 52
      for (let i = 1; i <= 8; i++) {
        pages.push(i);
      }
      pages.push('ellipsis-end');
      pages.push(totalPages);
    } else if (showStartEllipsis && !showEndEllipsis) {
      // Cerca del final: 1 ... 45 46 47 48 49 50 51 52
      pages.push(1);
      pages.push('ellipsis-start');
      for (let i = totalPages - 7; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // En el medio: 1 ... 24 25 26 27 28 29 ... 52
      pages.push(1);
      pages.push('ellipsis-start');
      
      // Mostrar 6 páginas centradas en la actual
      const start = page - 2;
      const end = page + 3;
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      pages.push('ellipsis-end');
      pages.push(totalPages);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {/* Info text - hidden on mobile */}
      <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
        <span>
          {t('showing')} <span className="font-semibold text-foreground">{startItem} - {endItem}</span> {t('of')} {total.toLocaleString()} {t('issues')}
        </span>
        {onLimitChange && (
          <>
            <span>·</span>
            <Select
              value={limit.toString()}
              onValueChange={(value) => onLimitChange(parseInt(value, 10))}
            >
              <SelectTrigger className="h-8 w-[70px] bg-transparent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LIMIT_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option.toString()}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>{t('perPage')}</span>
          </>
        )}
      </div>

      {/* Mobile pagination: Prev / Page X of Y / Next */}
      <div className="flex md:hidden items-center justify-between w-full">
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={() => onPageChange(page - 1)}
          disabled={isFirstPage}
        >
          <ChevronLeft className="h-4 w-4" />
          {t('previous')}
        </Button>
        
        <span className="text-sm text-muted-foreground">
          {t('page')} <span className="font-semibold text-foreground">{page}</span> {t('of')} {totalPages}
        </span>
        
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={() => onPageChange(page + 1)}
          disabled={isLastPage}
        >
          {t('next')}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Desktop pagination: Full page numbers */}
      <div className="hidden md:flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9"
          onClick={() => onPageChange(page - 1)}
          disabled={isFirstPage}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {visiblePages.map((pageNum, index) => (
          pageNum === 'ellipsis-start' || pageNum === 'ellipsis-end' ? (
            <span key={pageNum} className="w-9 text-center text-muted-foreground">
              ...
            </span>
          ) : (
            <Button
              key={pageNum}
              variant={pageNum === page ? 'default' : 'ghost'}
              size="icon"
              className={cn(
                'h-9 w-9',
                pageNum === page && 'pointer-events-none'
              )}
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum}
            </Button>
          )
        ))}

        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9"
          onClick={() => onPageChange(page + 1)}
          disabled={isLastPage}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
