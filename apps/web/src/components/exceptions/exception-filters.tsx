'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon, Search, X } from 'lucide-react';
import { format, startOfDay, endOfDay } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import type { ExceptionFilterDto } from '@excepio/shared';
import { useTranslations } from 'next-intl';

interface Platform {
  id: number;
  name: string;
}

interface Level {
  id: number;
  name: string;
}

interface ExceptionFiltersProps {
  filters: ExceptionFilterDto;
  platforms: Platform[];
  levels: Level[];
  onFilterChange: (filters: ExceptionFilterDto) => void;
}

// Mapeo de levelId a nombre de display
const LEVEL_DISPLAY: Record<number, string> = {
  5: 'CRITICAL',
  4: 'ERROR',
  3: 'WARNING',
  2: 'INFO',
  1: 'DEBUG',
};

// Colores del texto de level
const LEVEL_TEXT_STYLES: Record<number, { base: string; active: string }> = {
  5: {
    base: 'text-rose-600 dark:text-rose-400',
    active: 'bg-rose-500/15 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
  },
  4: {
    base: 'text-red-600 dark:text-red-400',
    active: 'bg-red-500/15 text-red-700 dark:bg-red-500/20 dark:text-red-300',
  },
  3: {
    base: 'text-amber-600 dark:text-amber-400',
    active: 'bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  },
  2: {
    base: 'text-blue-600 dark:text-blue-400',
    active: 'bg-blue-500/15 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  },
  1: {
    base: 'text-gray-600 dark:text-gray-400',
    active: 'bg-gray-500/15 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300',
  },
};

// Opciones predefinidas de rango de fechas
const DATE_PRESET_KEYS = ['last1h', 'last24h', 'last7d', 'last30d'] as const;
const DATE_PRESET_HOURS: Record<typeof DATE_PRESET_KEYS[number], number> = {
  last1h: 1,
  last24h: 24,
  last7d: 24 * 7,
  last30d: 24 * 30,
};

// Campos de texto sobre los que se puede buscar
const SEARCH_FIELD_KEYS = ['message', 'stackTrace', 'userId', 'userAgent', 'appVersion', 'url', 'metadata'] as const;
const SEARCH_FIELD_FILTERS: Record<typeof SEARCH_FIELD_KEYS[number], string> = {
  message: 'messageSearch',
  stackTrace: 'stackTraceSearch',
  userId: 'userId',
  userAgent: 'userAgentSearch',
  appVersion: 'appVersionSearch',
  url: 'urlSearch',
  metadata: 'metadataSearch',
};

export function ExceptionFilters({
  filters,
  platforms,
  levels,
  onFilterChange,
}: ExceptionFiltersProps) {
  const t = useTranslations('exceptions.filters');
  const tCommon = useTranslations('common.buttons');
  const [dateLabel, setDateLabel] = useState<string>(t('datePresets.last24h'));
  const [searchField, setSearchField] = useState<typeof SEARCH_FIELD_KEYS[number]>('message');
  const [searchText, setSearchText] = useState<string>('');
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  
  // Estado para los dialogs de calendario
  const [dayDialogOpen, setDayDialogOpen] = useState(false);
  const [rangeDialogOpen, setRangeDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined);
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(undefined);

  const today = new Date();

  const handlePlatformChange = (value: string) => {
    const platformId = value === 'all' ? undefined : parseInt(value, 10);
    onFilterChange({ ...filters, platformId });
  };

  const handleLevelToggle = (levelId: number) => {
    const newLevelId = filters.levelId === levelId ? undefined : levelId;
    onFilterChange({ ...filters, levelId: newLevelId });
  };

  const handleDatePresetChange = (presetKey: typeof DATE_PRESET_KEYS[number]) => {
    setDateLabel(t(`datePresets.${presetKey}`));
    setDatePopoverOpen(false);
    const hours = DATE_PRESET_HOURS[presetKey];
    const now = new Date();
    const startDate = new Date(now.getTime() - hours * 60 * 60 * 1000);
    onFilterChange({
      ...filters,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
    });
  };

  const handleOpenDayDialog = () => {
    setDatePopoverOpen(false);
    setSelectedDay(undefined);
    setDayDialogOpen(true);
  };

  const handleOpenRangeDialog = () => {
    setDatePopoverOpen(false);
    setSelectedRange(undefined);
    setRangeDialogOpen(true);
  };

  const handleApplyDay = () => {
    if (selectedDay) {
      const start = startOfDay(selectedDay);
      const end = endOfDay(selectedDay);
      setDateLabel(format(selectedDay, 'MMM d, yyyy'));
      onFilterChange({
        ...filters,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      });
    }
    setDayDialogOpen(false);
  };

  const handleApplyRange = () => {
    if (selectedRange?.from) {
      const start = startOfDay(selectedRange.from);
      const end = selectedRange.to ? endOfDay(selectedRange.to) : endOfDay(selectedRange.from);
      
      if (selectedRange.to) {
        setDateLabel(`${format(selectedRange.from, 'MMM d')} - ${format(selectedRange.to, 'MMM d')}`);
      } else {
        setDateLabel(format(selectedRange.from, 'MMM d, yyyy'));
      }
      
      onFilterChange({
        ...filters,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      });
    }
    setRangeDialogOpen(false);
  };

  const handleSearch = () => {
    if (!searchText.trim()) return;

    // Limpiar todos los filtros de búsqueda previos
    const clearedFilters: Partial<ExceptionFilterDto> = {
      messageSearch: undefined,
      stackTraceSearch: undefined,
      userId: undefined,
      userAgentSearch: undefined,
      appVersionSearch: undefined,
      urlSearch: undefined,
      metadataSearch: undefined,
    };

    // Aplicar el filtro seleccionado
    const filterKey = SEARCH_FIELD_FILTERS[searchField];
    if (filterKey) {
      (clearedFilters as Record<string, string | undefined>)[filterKey] = searchText.trim();
    }

    onFilterChange({
      ...filters,
      ...clearedFilters,
    });
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (searchText.trim()) {
        handleSearch();
      } else {
        // Si el texto está vacío y pulsa Enter, limpiar filtros
        handleClearSearch();
      }
    }
  };

  const handleClearSearch = () => {
    setSearchText('');
    onFilterChange({
      ...filters,
      messageSearch: undefined,
      stackTraceSearch: undefined,
      userId: undefined,
      userAgentSearch: undefined,
      appVersionSearch: undefined,
      urlSearch: undefined,
      metadataSearch: undefined,
    });
  };

  // Verificar si hay algún filtro de búsqueda activo
  const hasActiveSearch = [
    filters.messageSearch,
    filters.stackTraceSearch,
    filters.userId,
    filters.userAgentSearch,
    filters.appVersionSearch,
    filters.urlSearch,
    filters.metadataSearch,
  ].some(Boolean);

  return (
    <>
      <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 md:overflow-visible md:flex-wrap md:justify-end">
        {/* Search Field Select + Input */}
        <div className="flex items-center flex-shrink-0">
          <Select
            value={searchField}
            onValueChange={(value: typeof SEARCH_FIELD_KEYS[number]) => {
              setSearchField(value);
              // Si hay texto de búsqueda, disparar búsqueda con el nuevo campo
              if (searchText.trim()) {
                const clearedFilters: Partial<ExceptionFilterDto> = {
                  messageSearch: undefined,
                  stackTraceSearch: undefined,
                  userId: undefined,
                  userAgentSearch: undefined,
                  appVersionSearch: undefined,
                  urlSearch: undefined,
                  metadataSearch: undefined,
                };
                const filterKey = SEARCH_FIELD_FILTERS[value];
                if (filterKey) {
                  (clearedFilters as Record<string, string | undefined>)[filterKey] = searchText.trim();
                }
                onFilterChange({ ...filters, ...clearedFilters });
              }
            }}
          >
            <SelectTrigger className="w-[120px] h-10 rounded-r-none border-r-0 bg-transparent">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SEARCH_FIELD_KEYS.map((fieldKey) => (
                <SelectItem key={fieldKey} value={fieldKey}>
                  {t(`searchFields.${fieldKey}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative">
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="h-10 w-40 rounded-l-none pr-8 bg-transparent"
            />
            {searchText ? (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-10 w-8 hover:bg-transparent"
                onClick={handleClearSearch}
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </Button>
            ) : (
              <div className="absolute right-0 top-0 h-10 w-8 flex items-center justify-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        {/* Platform Select */}
        <Select
          value={filters.platformId?.toString() || 'all'}
          onValueChange={handlePlatformChange}
        >
          <SelectTrigger className="w-[160px] h-10 bg-transparent border-input flex-shrink-0">
            <SelectValue placeholder={t('platformAll')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('platformAll')}</SelectItem>
            {platforms.map((platform) => (
              <SelectItem key={platform.id} value={platform.id.toString()}>
                {platform.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Level Buttons */}
        <div className="flex items-center border border-input rounded-md h-10 flex-shrink-0">
          {[5, 4, 3, 2, 1].map((levelId, index) => {
            const isActive = filters.levelId === levelId;
            const styles = LEVEL_TEXT_STYLES[levelId];
            return (
              <Button
                key={levelId}
                variant="ghost"
                size="sm"
                data-active={isActive}
                className={cn(
                  'rounded-none h-full px-3 font-bold',
                  index === 0 && 'rounded-l-md',
                  index === 4 && 'rounded-r-md',
                  index < 4 && 'border-r border-input',
                  styles.base,
                  isActive && styles.active
                )}
                onClick={() => handleLevelToggle(levelId)}
              >
                {LEVEL_DISPLAY[levelId]}
              </Button>
            );
          })}
        </div>

        {/* Date Preset Select */}
        <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 h-10 border border-input flex-shrink-0">
              <CalendarIcon className="h-4 w-4" />
              {dateLabel}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-44 p-1" align="end">
            {DATE_PRESET_KEYS.map((presetKey) => (
              <Button
                key={presetKey}
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleDatePresetChange(presetKey)}
              >
                {t(`datePresets.${presetKey}`)}
              </Button>
            ))}
            <div className="my-1 border-t border-border" />
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={handleOpenDayDialog}
            >
              {t('specificDay')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={handleOpenRangeDialog}
            >
              {t('customRange')}
            </Button>
          </PopoverContent>
        </Popover>
      </div>

      {/* Dialog para selección de día específico */}
      <Dialog open={dayDialogOpen} onOpenChange={setDayDialogOpen}>
        <DialogContent className="sm:max-w-fit p-0 gap-0">
          <div className="p-4 pt-10">
            <Calendar
              mode="single"
              selected={selectedDay}
              onSelect={setSelectedDay}
              disabled={{ after: today }}
              className="[--cell-size:2.5rem]"
              classNames={{
                month_caption: "flex h-10 w-full items-center justify-center",
                caption_label: "text-base font-semibold text-foreground",
                weekday: "text-muted-foreground font-medium text-sm w-10",
                day: "h-10 w-10 text-sm font-medium",
                today: "bg-primary/10 text-primary font-bold rounded-md",
                selected: "bg-primary text-primary-foreground",
                outside: "text-muted-foreground/50",
                disabled: "text-muted-foreground/30",
              }}
            />
          </div>
          <div className="flex justify-end gap-2 border-t border-border px-4 py-3 bg-muted/30">
            <Button variant="ghost" size="sm" onClick={() => setDayDialogOpen(false)}>
              {tCommon('cancel')}
            </Button>
            <Button size="sm" onClick={handleApplyDay} disabled={!selectedDay}>
              {tCommon('apply')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para selección de rango personalizado */}
      <Dialog open={rangeDialogOpen} onOpenChange={setRangeDialogOpen}>
        <DialogContent className="sm:max-w-fit p-0 gap-0">
          <div className="p-4 pt-10">
            <Calendar
              mode="range"
              selected={selectedRange}
              onSelect={setSelectedRange}
              disabled={{ after: today }}
              className="[--cell-size:2.5rem]"
              classNames={{
                month_caption: "flex h-10 w-full items-center justify-center",
                caption_label: "text-base font-semibold text-foreground",
                weekday: "text-muted-foreground font-medium text-sm w-10",
                day: "h-10 w-10 text-sm font-medium",
                today: "bg-primary/10 text-primary font-bold rounded-md data-[selected=true]:rounded-none",
                range_start: "bg-primary text-primary-foreground rounded-l-md",
                range_end: "bg-primary text-primary-foreground rounded-r-md",
                range_middle: "bg-primary/20 text-foreground rounded-none",
                outside: "text-muted-foreground/50",
                disabled: "text-muted-foreground/30",
              }}
            />
          </div>
          <div className="flex justify-end gap-2 border-t border-border px-4 py-3 bg-muted/30">
            <Button variant="ghost" size="sm" onClick={() => setRangeDialogOpen(false)}>
              {tCommon('cancel')}
            </Button>
            <Button size="sm" onClick={handleApplyRange} disabled={!selectedRange?.from}>
              {tCommon('apply')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
