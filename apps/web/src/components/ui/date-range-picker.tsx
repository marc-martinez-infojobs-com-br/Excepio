'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfDay, endOfDay } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Button } from '@components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@components/ui/popover';
import { Dialog, DialogContent } from '@components/ui/dialog';
import { Calendar } from '@components/ui/calendar';
import { useTranslations } from 'next-intl';

interface DateRangePickerProps {
  onDateChange: (startDate: string, endDate: string) => void;
  defaultLabel?: string;
  className?: string;
}

// Opciones predefinidas de rango de fechas
const DATE_PRESET_KEYS = ['last1h', 'last24h', 'last7d', 'last30d'] as const;
const DATE_PRESET_HOURS: Record<(typeof DATE_PRESET_KEYS)[number], number> = {
  last1h: 1,
  last24h: 24,
  last7d: 24 * 7,
  last30d: 24 * 30,
};

/**
 * Componente reutilizable de selector de rango de fechas.
 * Incluye presets (1h, 24h, 7d, 30d), día específico y rango personalizado.
 */
export function DateRangePicker({
  onDateChange,
  defaultLabel,
  className,
}: DateRangePickerProps) {
  const t = useTranslations('exceptions.filters');
  const tCommon = useTranslations('common.buttons');
  const [dateLabel, setDateLabel] = useState<string>(
    defaultLabel ?? t('datePresets.last24h')
  );
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);

  // Estado para los dialogs de calendario
  const [dayDialogOpen, setDayDialogOpen] = useState(false);
  const [rangeDialogOpen, setRangeDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined);
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(
    undefined
  );

  const today = new Date();

  const handleDatePresetChange = (
    presetKey: (typeof DATE_PRESET_KEYS)[number]
  ) => {
    setDateLabel(t(`datePresets.${presetKey}`));
    setDatePopoverOpen(false);
    const hours = DATE_PRESET_HOURS[presetKey];
    const now = new Date();
    const startDate = new Date(now.getTime() - hours * 60 * 60 * 1000);
    onDateChange(startDate.toISOString(), now.toISOString());
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
      onDateChange(start.toISOString(), end.toISOString());
    }
    setDayDialogOpen(false);
  };

  const handleApplyRange = () => {
    if (selectedRange?.from) {
      const start = startOfDay(selectedRange.from);
      const end = selectedRange.to
        ? endOfDay(selectedRange.to)
        : endOfDay(selectedRange.from);

      if (selectedRange.to) {
        setDateLabel(
          `${format(selectedRange.from, 'MMM d')} - ${format(selectedRange.to, 'MMM d')}`
        );
      } else {
        setDateLabel(format(selectedRange.from, 'MMM d, yyyy'));
      }

      onDateChange(start.toISOString(), end.toISOString());
    }
    setRangeDialogOpen(false);
  };

  return (
    <>
      <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`gap-2 h-10 border border-input flex-shrink-0 ${className ?? ''}`}
          >
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
                month_caption: 'flex h-10 w-full items-center justify-center',
                caption_label: 'text-base font-semibold text-foreground',
                weekday: 'text-muted-foreground font-medium text-sm w-10',
                day: 'h-10 w-10 text-sm font-medium',
                today: 'bg-primary/10 text-primary font-bold rounded-md',
                selected: 'bg-primary text-primary-foreground',
                outside: 'text-muted-foreground/50',
                disabled: 'text-muted-foreground/30',
              }}
            />
          </div>
          <div className="flex justify-end gap-2 border-t border-border px-4 py-3 bg-muted/30">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDayDialogOpen(false)}
            >
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
                month_caption: 'flex h-10 w-full items-center justify-center',
                caption_label: 'text-base font-semibold text-foreground',
                weekday: 'text-muted-foreground font-medium text-sm w-10',
                day: 'h-10 w-10 text-sm font-medium',
                today:
                  'bg-primary/10 text-primary font-bold rounded-md data-[selected=true]:rounded-none',
                range_start: 'bg-primary text-primary-foreground rounded-l-md',
                range_end: 'bg-primary text-primary-foreground rounded-r-md',
                range_middle: 'bg-primary/20 text-foreground rounded-none',
                outside: 'text-muted-foreground/50',
                disabled: 'text-muted-foreground/30',
              }}
            />
          </div>
          <div className="flex justify-end gap-2 border-t border-border px-4 py-3 bg-muted/30">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRangeDialogOpen(false)}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              size="sm"
              onClick={handleApplyRange}
              disabled={!selectedRange?.from}
            >
              {tCommon('apply')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
