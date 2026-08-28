'use client';

import React, { useState, useEffect } from 'react';
import { EmployeeRecord } from '@/types/hr';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollableChartContainer } from '@/components/dashboard/ScrollableChartContainer';
import {
  getCadreDistribution,
  getGradeDistribution,
  getEmploymentTypeDistribution,
  getTopPositions,
  getSupervisorSpan
} from '@/lib/analytics';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface HierarchyTabProps {
  records: EmployeeRecord[];
}

const EMPL_COLORS: Record<string, string> = {
  Permanent: '#2563eb',
  Contractual: '#d97706',
  Probationary: '#7c3aed',
  Intern: '#059669',
  Temporary: '#71717a',
  'N/A': '#9ca3af'
};

const PIE_COLORS = ['#2563eb', '#d97706', '#7c3aed', '#059669', '#e11d48', '#64748b'];

export function HierarchyTab({ records }: HierarchyTabProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const cadreData = React.useMemo(() => getCadreDistribution(records), [records]);
  const gradeData = React.useMemo(() => getGradeDistribution(records), [records]);
  const emplData = React.useMemo(() => getEmploymentTypeDistribution(records), [records]);
  const topPositions = React.useMemo(() => getTopPositions(records, 15), [records]);
  const supervisorData = React.useMemo(() => getSupervisorSpan(records, 6), [records]);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Skeleton className="h-[280px] sm:h-[340px] rounded-lg" />
        <Skeleton className="h-[280px] sm:h-[340px] rounded-lg" />
        <Skeleton className="h-[200px] sm:h-[220px] rounded-lg lg:col-span-2" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Row 1: Cadre Breakdown & Grade Pyramid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* 1. Cadre & Gender Distribution */}
        <Card className="border border-border bg-card shadow-2xs">
          <CardHeader className="p-3.5 sm:p-4 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xs sm:text-sm font-semibold text-foreground">
                Cadre & Staff Level Distribution
              </CardTitle>
              <CardDescription className="text-[11px] sm:text-xs">
                Executive, Management, Officer, and Support staff
              </CardDescription>
            </div>
            <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground">
              CADRE
            </span>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 pt-3 sm:pt-4">
            <div className="h-[240px] sm:h-[280px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={cadreData} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                  <XAxis dataKey="cadre" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '6px' }} />
                  <Bar dataKey="male" name="Male (♂)" fill="#2563eb" stackId="a" />
                  <Bar dataKey="female" name="Female (♀)" fill="#e11d48" stackId="a" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 2. Grade Distribution (Scrollable) */}
        <Card className="border border-border bg-card shadow-2xs">
          <CardHeader className="p-3.5 sm:p-4 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xs sm:text-sm font-semibold text-foreground">
                Job Grade Breakdown
              </CardTitle>
              <CardDescription className="text-[11px] sm:text-xs">
                Hierarchy and pay grade distribution ({gradeData.length} Grades)
              </CardDescription>
            </div>
            <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground">
              Grade
            </span>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 pt-3 sm:pt-4">
            <ScrollableChartContainer
              dataLength={gradeData.length}
              itemHeight={38}
              minHeight={260}
              maxViewportHeight={280}
              threshold={6}
              itemName="grades"
            >
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={gradeData} layout="vertical" margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="grade" tick={{ fontSize: 9 }} width={120} interval={0} />
                  <Tooltip />
                  <Bar dataKey="count" name="Employees" fill="#4f46e5" radius={[0, 2, 2, 0]} maxBarSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </ScrollableChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Top Positions & Employment Type */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* 3. Top Positions (Scrollable) */}
        <Card className="border border-border bg-card shadow-2xs lg:col-span-2">
          <CardHeader className="p-3.5 sm:p-4 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xs sm:text-sm font-semibold text-foreground">
                Top Designations & Positions
              </CardTitle>
              <CardDescription className="text-[11px] sm:text-xs">
                Most populated roles across the organization
              </CardDescription>
            </div>
            <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground">
              Pos_name
            </span>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 pt-3 sm:pt-4">
            <ScrollableChartContainer
              dataLength={topPositions.length}
              itemHeight={36}
              minHeight={250}
              maxViewportHeight={270}
              threshold={6}
              itemName="positions"
            >
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={topPositions} layout="vertical" margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="position" tick={{ fontSize: 9 }} width={140} interval={0} />
                  <Tooltip />
                  <Bar dataKey="count" name="Staff Count" fill="#0284c7" radius={[0, 2, 2, 0]} maxBarSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </ScrollableChartContainer>
          </CardContent>
        </Card>

        {/* 4. Employment Type Donut */}
        <Card className="border border-border bg-card shadow-2xs">
          <CardHeader className="p-3.5 sm:p-4 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xs sm:text-sm font-semibold text-foreground">
                Employment Category
              </CardTitle>
              <CardDescription className="text-[11px] sm:text-xs">
                Permanent vs Contractual mix
              </CardDescription>
            </div>
            <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground">
              EMPLOYMENT_CATEGORY
            </span>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center">
            <div className="h-[170px] sm:h-[180px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie
                    data={emplData}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={2}
                  >
                    {emplData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={EMPL_COLORS[entry.type] || PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
              {emplData.map((item, idx) => (
                <div key={`empl-${item.type}-${idx}`} className="flex items-center gap-1 text-[11px] text-muted-foreground px-2 py-0.5 rounded bg-muted/60 border border-border">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{
                      backgroundColor: EMPL_COLORS[item.type] || PIE_COLORS[idx % PIE_COLORS.length]
                    }}
                  />
                  <span className="truncate">
                    {item.type}: <strong className="text-foreground font-mono">{item.count}</strong>
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Supervisor Span of Control */}
      <Card className="border border-border bg-card shadow-2xs">
        <CardHeader className="p-3.5 sm:p-4 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xs sm:text-sm font-semibold text-foreground">
              Supervisor Span of Control
            </CardTitle>
            <CardDescription className="text-[11px] sm:text-xs">
              Direct reports per manager
            </CardDescription>
          </div>
          <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground">
            SUPERVISOR
          </span>
        </CardHeader>
        <CardContent className="p-3.5 sm:p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3">
            {supervisorData.map((sup, idx) => (
              <div
                key={`sup-${sup.supervisor}-${idx}`}
                className="border border-border rounded-lg p-2.5 sm:p-3 bg-muted/20 space-y-1"
              >
                <p className="text-[11px] sm:text-xs font-medium text-foreground truncate" title={sup.supervisor}>
                  {sup.supervisor}
                </p>
                <div className="flex items-baseline justify-between pt-1 border-t border-border">
                  <span className="text-lg sm:text-xl font-bold font-mono text-foreground">
                    {sup.directReports}
                  </span>
                  <span className="text-[9px] sm:text-[10px] uppercase text-muted-foreground font-medium">
                    Reports
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
