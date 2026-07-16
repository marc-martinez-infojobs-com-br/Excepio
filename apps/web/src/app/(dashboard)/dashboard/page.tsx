'use client';

import { useState } from 'react';
import {
  TotalExceptionsCard,
  TimeSeriesChart,
  PlatformPieChart,
  GroupedExceptionsList,
} from '@components/dashboard';
import { DateRangePicker } from '@components/ui/date-range-picker';
import type { StatsFilterDto } from '@excepio/shared';
import { useTranslations } from 'next-intl';

// Calcula los filtros por defecto (últimos 7 días)
function getDefaultFilters(): StatsFilterDto {
  const now = new Date();
  const startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return {
    startDate: startDate.toISOString(),
    endDate: now.toISOString(),
  };
}

export default function DashboardPage() {
  const t = useTranslations('exceptions.filters');
  const [filters, setFilters] = useState<StatsFilterDto>(getDefaultFilters);

  const handleDateChange = (startDate: string, endDate: string) => {
    setFilters({ ...filters, startDate, endDate });
  };

  return (
    <div className="p-8">
      {/* Header with Date Filter */}
      <div className="flex justify-end mb-6">
        <DateRangePicker 
          onDateChange={handleDateChange} 
          defaultLabel={t('datePresets.last7d')}
        />
      </div>

      {/* Stats Row: Total + Time Series + Platform Distribution */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-[280px_1fr_280px] mb-8">
        <TotalExceptionsCard filters={filters} />
        <TimeSeriesChart filters={filters} />
        <PlatformPieChart filters={filters} />
      </div>

      {/* Grouped Exceptions List */}
      <GroupedExceptionsList filters={filters} />
    </div>
  );
}
