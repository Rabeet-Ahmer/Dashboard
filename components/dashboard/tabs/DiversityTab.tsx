'use client';

import React, { useState, useEffect } from 'react';
import { EmployeeRecord } from '@/types/hr';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollableChartContainer } from '@/components/dashboard/ScrollableChartContainer';
import {
  getGenderByGrade,
  getAgeCohortsDistribution,
  getTenureBracketsDistribution
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
  LabelList,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DiversityTabProps {
  records: EmployeeRecord[];
}

// Sophisticated palette for Single-Year Age Cohorts (20 - 32+) - Option 3
const AGE_COHORT_PALETTE = [
  '#14b8a6', // 20 yrs (Teal)
  '#06b6d4', // 21 yrs (Cyan)
  '#0284c7', // 22 yrs (Sky Blue)
  '#3b82f6', // 23 yrs (Classic Azure)
  '#6366f1', // 24 yrs (Indigo)
  '#8b5cf6', // 25 yrs (Iris Violet)
  '#a855f7', // 26 yrs (Bright Purple)
  '#d946ef', // 27 yrs (Fuchsia)
  '#ec4899', // 28 yrs (Electric Rose)
  '#f43f5e', // 29 yrs (Coral Rose)
  '#f59e0b', // 30 yrs (Topaz Amber)
  '#eab308', // 31 yrs (Golden Yellow)
  '#10b981', // 32 yrs (Emerald Green)
  '#64748b', // 33+ yrs (Slate)
  '#94a3b8'  // < 20 yrs (Light Slate)
];

// Soft, comforting palette for Marital Status Profile - Option 3
const MARITAL_COLORS: Record<string, string> = {
  Married: '#f59e0b',     // Topaz Amber
  Single: '#8b5cf6',      // Iris Violet
  Divorced: '#14b8a6',    // Vibrant Teal
  Separated: '#3b82f6',   // Azure Blue
  Widowed: '#64748b',     // Slate
  Unassigned: '#94a3b8',  // Soft Slate
  'N/A': '#94a3b8'
};

const MARITAL_PALETTE = ['#f59e0b', '#8b5cf6', '#14b8a6', '#3b82f6', '#64748b', '#94a3b8'];

export function DiversityTab({ records }: DiversityTabProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const genderGradeData = React.useMemo(() => getGenderByGrade(records), [records]);
  const ageData = React.useMemo(() => getAgeCohortsDistribution(records), [records]);
  const tenureData = React.useMemo(() => getTenureBracketsDistribution(records), [records]);

  // Marital status breakdown
  const maritalData = React.useMemo(() => {
    const map: Record<string, { status: string; count: number }> = {};
    for (const r of records) {
      const st = r.maritalStatus && r.maritalStatus !== 'N/A' ? r.maritalStatus : 'Unassigned';
      if (!map[st]) map[st] = { status: st, count: 0 };
      map[st].count++;
    }
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [records]);

  if (!mounted) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Skeleton className="h-[300px] rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Skeleton className="h-[280px] rounded-lg" />
          <Skeleton className="h-[280px] rounded-lg" />
          <Skeleton className="h-[280px] rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. Top Full-Width Card: Single-Year Age Cohorts (20 - 32 yrs) - No Scroll */}
      <Card className="border border-border bg-card shadow-2xs">
        <CardHeader className="p-3.5 sm:p-4 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-xs sm:text-sm font-semibold text-foreground">
                Age Demographic Cohorts
              </CardTitle>
              {ageData.length > 0 && (
                <Badge variant="secondary" className="text-[10px] font-normal text-muted-foreground">
                  {ageData.length} Cohorts
                </Badge>
              )}
            </div>
            <CardDescription className="text-[11px] sm:text-xs mt-0.5">
              Single-year age distribution profile across early to experienced career stages
            </CardDescription>
          </div>
          <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground px-1.5 py-0.5 rounded bg-muted">
            DATE_OF_BIRTH
          </span>
        </CardHeader>
        <CardContent className="p-2 sm:p-4 pt-4">
          <div className="h-[250px] sm:h-[280px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={ageData} margin={{ top: 22, right: 15, left: -20, bottom: 25 }} barCategoryGap="16%">
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis
                  dataKey="ageGroup"
                  tick={{ fontSize: 9 }}
                  interval={0}
                  height={30}
                />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    const val = payload[0]?.value || 0;
                    const totalCount = records.length || 1;
                    const pct = ((Number(val) / totalCount) * 100).toFixed(1);
                    return (
                      <div className="rounded-lg border border-border bg-popover p-2.5 shadow-md text-xs space-y-1">
                        <p className="font-semibold text-foreground border-b border-border pb-1">Age: {label}</p>
                        <p className="text-teal-600 dark:text-teal-400">
                          Headcount: <strong className="font-mono font-bold">{val}</strong> staff ({pct}%)
                        </p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="count" name="Employees" radius={[2, 2, 0, 0]} maxBarSize={38}>
                  {ageData.map((entry, index) => (
                    <Cell
                      key={`age-cell-${index}`}
                      fill={AGE_COHORT_PALETTE[index % AGE_COHORT_PALETTE.length]}
                    />
                  ))}
                  <LabelList
                    dataKey="count"
                    position="top"
                    offset={5}
                    className="fill-foreground font-mono text-[9px] sm:text-[10px] font-bold"
                    formatter={(val: unknown) => (typeof val === 'number' && val > 0 ? String(val) : '')}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 2. Bottom Row: 3-Card Grid for Gender Balance, Tenure Brackets & Marital Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* 1. Gender Diversity Across Grades (Scrollable if >6 grades) */}
        <Card className="border border-border bg-card shadow-2xs">
          <CardHeader className="p-3.5 sm:p-4 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xs sm:text-sm font-semibold text-foreground">
                Gender Balance by Grade
              </CardTitle>
              <CardDescription className="text-[11px] sm:text-xs">
                Male & female representation
              </CardDescription>
            </div>
            <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground">
              GENDER
            </span>
          </CardHeader>
          <CardContent className="p-2 sm:p-3 pt-3">
            <ScrollableChartContainer
              dataLength={genderGradeData.length}
              itemHeight={38}
              minHeight={240}
              maxViewportHeight={260}
              threshold={6}
              itemName="grades"
            >
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={genderGradeData} margin={{ top: 12, right: 15, left: -20, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                  <XAxis dataKey="grade" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} />
                  <Bar dataKey="male" name="Male (♂)" fill="#0284c7" stackId="a">
                    <LabelList
                      dataKey="male"
                      position="center"
                      className="fill-white font-mono text-[8px] font-medium"
                      formatter={(val: unknown) => (typeof val === 'number' && val > 0 ? String(val) : '')}
                    />
                  </Bar>
                  <Bar dataKey="female" name="Female (♀)" fill="#ec4899" stackId="a" radius={[2, 2, 0, 0]}>
                    <LabelList
                      dataKey="female"
                      position="center"
                      className="fill-white font-mono text-[8px] font-medium"
                      formatter={(val: unknown) => (typeof val === 'number' && val > 0 ? String(val) : '')}
                    />
                    <LabelList
                      dataKey="total"
                      position="top"
                      offset={5}
                      className="fill-foreground font-mono text-[9px] font-bold"
                      formatter={(val: unknown) => (typeof val === 'number' && val > 0 ? String(val) : '')}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ScrollableChartContainer>
          </CardContent>
        </Card>

        {/* 2. Tenure & Retention Brackets */}
        <Card className="border border-border bg-card shadow-2xs">
          <CardHeader className="p-3.5 sm:p-4 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xs sm:text-sm font-semibold text-foreground">
                Tenure & Retention
              </CardTitle>
              <CardDescription className="text-[11px] sm:text-xs">
                Service longevity cohorts
              </CardDescription>
            </div>
            <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground">
              HIRE_DATE
            </span>
          </CardHeader>
          <CardContent className="p-2 sm:p-3 pt-3">
            <div className="h-[240px] sm:h-[260px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={tenureData} margin={{ top: 20, right: 15, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                  <XAxis
                    dataKey="tenureGroup"
                    tick={{ fontSize: 9 }}
                    angle={-18}
                    textAnchor="end"
                    interval={0}
                    height={32}
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload || !payload.length) return null;
                      const val = payload[0]?.value || 0;
                      return (
                        <div className="rounded-lg border border-border bg-popover p-2.5 shadow-md text-xs space-y-1">
                          <p className="font-semibold text-foreground border-b border-border pb-1">Tenure Bracket: {label}</p>
                          <p className="text-blue-600 dark:text-blue-400">
                            Employees: <strong className="font-mono font-bold">{val}</strong>
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="count" name="Employees" fill="#0284c7" radius={[2, 2, 0, 0]} maxBarSize={32}>
                    <LabelList
                      dataKey="count"
                      position="top"
                      offset={5}
                      className="fill-foreground font-mono text-[9px] font-bold"
                      formatter={(val: unknown) => (typeof val === 'number' && val > 0 ? String(val) : '')}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 3. Marital Status Profile */}
        <Card className="border border-border bg-card shadow-2xs md:col-span-2 lg:col-span-1">
          <CardHeader className="p-3.5 sm:p-4 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xs sm:text-sm font-semibold text-foreground">
                Marital Status Profile
              </CardTitle>
              <CardDescription className="text-[11px] sm:text-xs">
                Civil status breakdown
              </CardDescription>
            </div>
            <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground">
              MARITAL_STATUS
            </span>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center">
            <div className="h-[170px] sm:h-[180px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const data = payload[0];
                      const val = Number(data.value) || 0;
                      const total = maritalData.reduce((acc, curr) => acc + curr.count, 0) || 1;
                      const pct = ((val / total) * 100).toFixed(1);
                      return (
                        <div className="rounded-lg border border-border bg-popover p-2.5 shadow-md text-xs space-y-1">
                          <p className="font-semibold text-foreground border-b border-border pb-1">{data.name}</p>
                          <p className="text-primary">
                            Headcount: <strong className="font-mono font-bold">{val}</strong> staff ({pct}%)
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Pie
                    data={maritalData}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    stroke="var(--card)"
                    strokeWidth={2}
                  >
                    {maritalData.map((entry, index) => (
                      <Cell
                        key={`marital-cell-${index}`}
                        fill={MARITAL_COLORS[entry.status] || MARITAL_PALETTE[index % MARITAL_PALETTE.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Soft Comforting Legend Pills */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
              {maritalData.map((item, idx) => (
                <div
                  key={`marital-pill-${item.status}-${idx}`}
                  className="flex items-center gap-1 text-[10px] text-muted-foreground px-2 py-0.5 rounded bg-muted/60 border border-border"
                >
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{
                      backgroundColor: MARITAL_COLORS[item.status] || MARITAL_PALETTE[idx % MARITAL_PALETTE.length]
                    }}
                  />
                  <span className="truncate">
                    {item.status}: <strong className="text-foreground font-mono">{item.count}</strong>
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
