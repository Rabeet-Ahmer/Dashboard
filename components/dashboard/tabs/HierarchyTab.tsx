'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { EmployeeRecord } from '@/types/hr';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  getCadreDistribution,
  getGradeDistribution,
  getEmploymentTypeDistribution
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

interface HierarchyTabProps {
  records: EmployeeRecord[];
}

const EMPL_COLORS: Record<string, string> = {
  Permanent: '#3b82f6',
  Contractual: '#f59e0b',
  Probationary: '#a855f7',
  Intern: '#10b981',
  Temporary: '#64748b',
  'N/A': '#94a3b8'
};

const PIE_COLORS = ['#3b82f6', '#f59e0b', '#a855f7', '#10b981', '#ec4899', '#64748b'];

export function HierarchyTab({ records }: HierarchyTabProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const cadreData = useMemo(() => getCadreDistribution(records), [records]);
  const gradeData = useMemo(() => getGradeDistribution(records), [records]);
  const emplData = useMemo(() => getEmploymentTypeDistribution(records), [records]);

  // Log-scaled vertical representation for heavily skewed grade data (365 vs 1)
  const logGradeData = useMemo(() => {
    const total = gradeData.reduce((acc, curr) => acc + curr.count, 0) || 1;
    return gradeData.map((item) => ({
      ...item,
      logCount: Math.log10(item.count + 1),
      displayCount: item.count,
      percent: ((item.count / total) * 100).toFixed(1)
    }));
  }, [gradeData]);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Skeleton className="h-[340px] rounded-xl" />
        <Skeleton className="h-[340px] rounded-xl" />
        <Skeleton className="h-[340px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 3-Card Balanced Row: Cadre Levels, Job Grades & Employment Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* 1. Cadre & Gender Distribution */}
        <Card className="border border-border bg-card shadow-2xs">
          <CardHeader className="p-3.5 sm:p-4 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <CardTitle className="text-xs sm:text-sm font-semibold text-foreground">
                  Cadre & Staff Levels
                </CardTitle>
                {cadreData.length > 0 && (
                  <Badge variant="secondary" className="text-[10px] font-normal text-muted-foreground">
                    {cadreData.length} Tiers
                  </Badge>
                )}
              </div>
              <CardDescription className="text-[11px] sm:text-xs mt-0.5">
                Staff tier & gender distribution
              </CardDescription>
            </div>
            <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground">
              CADRE
            </span>
          </CardHeader>
          <CardContent className="p-2 sm:p-3 pt-4">
            <div className="h-[260px] sm:h-[290px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={cadreData} margin={{ top: 18, right: 15, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                  <XAxis dataKey="cadre" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '6px' }} />
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

        {/* 2. Job Grade Breakdown (Vertical Standing Log-Scaled Chart) */}
        <Card className="border border-border bg-card shadow-2xs">
          <CardHeader className="p-3.5 sm:p-4 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <CardTitle className="text-xs sm:text-sm font-semibold text-foreground">
                  Job Grade Breakdown
                </CardTitle>
                {gradeData.length > 0 && (
                  <Badge variant="secondary" className="text-[10px] font-normal text-muted-foreground">
                    {gradeData.length} Grades
                  </Badge>
                )}
              </div>
              <CardDescription className="text-[11px] sm:text-xs mt-0.5">
                Hierarchy tiers & relative representation
              </CardDescription>
            </div>
            <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground">
              Grade
            </span>
          </CardHeader>
          <CardContent className="p-2 sm:p-3 pt-4">
            <div className="h-[260px] sm:h-[290px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={logGradeData} margin={{ top: 22, right: 15, left: -25, bottom: 25 }} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                  <XAxis
                    dataKey="grade"
                    tick={{ fontSize: 9 }}
                    interval={0}
                    height={30}
                  />
                  <YAxis
                    type="number"
                    tick={false}
                    axisLine={{ stroke: 'var(--border)' }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload || !payload.length) return null;
                      const d = payload[0]?.payload;
                      return (
                        <div className="rounded-lg border border-border bg-popover p-2.5 shadow-md text-xs space-y-1">
                          <p className="font-semibold text-foreground border-b border-border pb-1">Grade: {label}</p>
                          <p className="text-teal-600 dark:text-teal-400">
                            Staff Count: <strong className="font-mono font-bold">{d?.displayCount}</strong> ({d?.percent}%)
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="logCount" name="Employees" fill="#14b8a6" radius={[2, 2, 0, 0]} maxBarSize={34}>
                    <LabelList
                      dataKey="displayCount"
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

        {/* 3. Employment Category Complete Solid Pie Chart */}
        <Card className="border border-border bg-card shadow-2xs md:col-span-2 lg:col-span-1">
          <CardHeader className="p-3.5 sm:p-4 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xs sm:text-sm font-semibold text-foreground">
                Employment Category
              </CardTitle>
              <CardDescription className="text-[11px] sm:text-xs mt-0.5">
                Permanent vs Contractual mix
              </CardDescription>
            </div>
            <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground">
              CATEGORY
            </span>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center">
            <div className="h-[180px] sm:h-[200px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const data = payload[0];
                      const val = Number(data.value) || 0;
                      const total = emplData.reduce((acc, curr) => acc + curr.count, 0) || 1;
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
                    data={emplData}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    stroke="var(--card)"
                    strokeWidth={2}
                  >
                    {emplData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={EMPL_COLORS[entry.type] || PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
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
    </div>
  );
}
