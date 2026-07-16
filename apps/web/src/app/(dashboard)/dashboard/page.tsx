'use client';

import {
  TotalExceptionsCard,
  TimeSeriesChart,
  PlatformPieChart,
  GroupedExceptionsList,
} from '@components/dashboard';

export default function DashboardPage() {
  return (
    <div className="p-8">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <TotalExceptionsCard />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 mb-8">
        {/* Time Series Chart */}
        <TimeSeriesChart />

        {/* Platform Pie Chart */}
        <PlatformPieChart />
      </div>

      {/* Grouped Exceptions List */}
      <GroupedExceptionsList />
    </div>
  );
}
