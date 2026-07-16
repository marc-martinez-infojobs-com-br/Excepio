'use client';

import { TotalExceptionsCard } from '@components/dashboard';

export default function DashboardPage() {
  return (
    <div className="p-8">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <TotalExceptionsCard />
      </div>
    </div>
  );
}
