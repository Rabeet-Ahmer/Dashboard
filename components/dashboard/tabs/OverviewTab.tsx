'use client';

import React, { useState, useEffect } from 'react';
import { EmployeeRecord } from '@/types/hr';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollableChartContainer } from '@/components/dashboard/ScrollableChartContainer';
import {
  getRegionalDistribution,
  getGroupDistribution,
  getBatchOnboardingDistribution,
  getUserStatusDistribution
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

interface OverviewTabProps {
  records: EmployeeRecord[];
}

const STATUS_COLORS: Record<string, string> = {
  Active: '#10b981',
  Resigned: '#f43f5e',
  'On Leave': '#f59e0b',
  Inactive: '#64748b',
  'N/A': '#94a3b8',
  Unknown: '#94a3b8'
};

const PIE_COLORS = ['#0d9488', '#0284c7', '#6366f1', '#10b981', '#f59e0b', '#f43f5e'];

export function OverviewTab({ records }: OverviewTabProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const regionalData = React.useMemo(() => getRegionalDistribution(records), [records]);
  const groupData = React.useMemo(() => getGroupDistribution(records), [records]);
  const batchData = React.useMemo(() => getBatchOnboardingDistribution(records), [records]);
  const statusData = React.useMemo(() => getUserStatusDistribution(records), [records]);

  if (!mounted) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Skeleton className="h-[380px] rounded-xl" />
          <Skeleton className="h-[380px] rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <Skeleton className="h-[280px] rounded-xl lg:col-span-2" />
          <Skeleton className="h-[280px] rounded-xl" />
        </div>
      </div>
    );
  }

  // Calculate dynamic width for batch chart horizontal scroll if many batches exist
  const batchChartMinWidth = Math.max(100, batchData.length * 52);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* 1. Top Row: Realigned Side-by-Side (Both Scrollable & Visible Numbers) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Regional Workforce Strength (Side-by-Side Scrollable) */}
        <Card className="border border-border bg-card shadow-2xs">
          <CardHeader className="p-4 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xs sm:text-sm font-semibold text-foreground">
                  Regional Workforce Strength
                </CardTitle>
                {regionalData.length > 7 && (
                  <Badge variant="secondary" className="text-[10px] font-normal text-muted-foreground">
                    {regionalData.length} Regions
                  </Badge>
                )}
              </div>
              <CardDescription className="text-[11px] sm:text-xs mt-0.5">
                Active vs total staff distribution
              </CardDescription>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground px-1.5 py-0.5 rounded bg-muted">
              REGION
            </span>
          </CardHeader>
          <CardContent className="p-2 sm:p-3">
            <ScrollableChartContainer
              dataLength={regionalData.length}
              itemHeight={44}
              minHeight={280}
              maxViewportHeight={340}
              threshold={7}
              itemName="regions"
            >
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart
                  data={regionalData}
                  layout="vertical"
                  margin={{ top: 5, right: 35, left: 0, bottom: 5 }}
                  barCategoryGap="20%"
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={{ stroke: 'var(--border)' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="region"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={{ stroke: 'var(--border)' }}
                    width={160}
                    interval={0}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload || !payload.length) return null;
                      const activeVal = payload.find(p => p.dataKey === 'active')?.value || 0;
                      const totalVal = payload.find(p => p.dataKey === 'count')?.value || 0;
                      return (
                        <div className="rounded-lg border border-border bg-popover p-2.5 shadow-md text-xs space-y-1">
                          <p className="font-semibold text-foreground">{label}</p>
                          <p className="text-blue-600 dark:text-blue-400">
                            Active Staff: <strong className="font-mono font-bold">{activeVal}</strong>
                          </p>
                          <p className="text-muted-foreground">
                            Total Headcount: <strong className="font-mono font-bold text-foreground">{totalVal}</strong>
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '10px', paddingTop: '6px' }}
                    iconType="circle"
                    iconSize={7}
                  />
                  <Bar dataKey="active" name="Active Staff" fill="#0d9488" radius={[0, 2, 2, 0]} maxBarSize={14}>
                    <LabelList
                      dataKey="active"
                      position="insideRight"
                      className="fill-white font-mono text-[8px] font-medium"
                      formatter={(val: unknown) => (typeof val === 'number' && val > 0 ? String(val) : '')}
                    />
                  </Bar>
                  <Bar dataKey="count" name="Total Headcount" fill="#2dd4bf" radius={[0, 2, 2, 0]} maxBarSize={14}>
                    <LabelList
                      dataKey="count"
                      position="right"
                      offset={5}
                      className="fill-foreground font-mono text-[9px] font-bold"
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ScrollableChartContainer>
          </CardContent>
        </Card>

        {/* Business Group Headcount (Side-by-Side Scrollable) */}
        <Card className="border border-border bg-card shadow-2xs">
          <CardHeader className="p-4 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xs sm:text-sm font-semibold text-foreground">
                  Business Group Headcount
                </CardTitle>
                {groupData.length > 7 && (
                  <Badge variant="secondary" className="text-[10px] font-normal text-muted-foreground">
                    {groupData.length} Groups
                  </Badge>
                )}
              </div>
              <CardDescription className="text-[11px] sm:text-xs mt-0.5">
                Staff strength across main business divisions
              </CardDescription>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground px-1.5 py-0.5 rounded bg-muted">
              GROUP
            </span>
          </CardHeader>
          <CardContent className="p-2 sm:p-3">
            <ScrollableChartContainer
              dataLength={groupData.length}
              itemHeight={40}
              minHeight={280}
              maxViewportHeight={340}
              threshold={7}
              itemName="groups"
            >
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart
                  data={groupData}
                  layout="vertical"
                  margin={{ top: 5, right: 35, left: 0, bottom: 5 }}
                  barCategoryGap="18%"
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={{ stroke: 'var(--border)' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="group"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={{ stroke: 'var(--border)' }}
                    width={170}
                    interval={0}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload || !payload.length) return null;
                      const val = payload[0]?.value || 0;
                      return (
                        <div className="rounded-lg border border-border bg-popover p-2.5 shadow-md text-xs space-y-1">
                          <p className="font-semibold text-foreground">{label}</p>
                          <p className="text-indigo-600 dark:text-indigo-400">
                            Headcount: <strong className="font-mono font-bold">{val}</strong> staff
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Bar
                    dataKey="count"
                    name="Employees"
                    fill="#6366f1"
                    radius={[0, 2, 2, 0]}
                    maxBarSize={14}
                  >
                    <LabelList
                      dataKey="count"
                      position="right"
                      offset={5}
                      className="fill-foreground font-mono text-[9px] font-bold"
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ScrollableChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* 2. Bottom Row: Batch Induction Vertical Stacked Bar Chart & User Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Batch Induction (OG-1 vs OG-2 Stacked Vertical Bar Chart) */}
        <Card className="border border-border bg-card shadow-2xs lg:col-span-2">
          <CardHeader className="p-3.5 sm:p-4 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xs sm:text-sm font-semibold text-foreground">
                  Induction Batches & Grade Mix
                </CardTitle>
                {batchData.length > 0 && (
                  <Badge variant="secondary" className="text-[10px] font-normal text-muted-foreground">
                    {batchData.length} Batches
                  </Badge>
                )}
              </div>
              <CardDescription className="text-[11px] sm:text-xs mt-0.5">
                Staff intake by hire date with OG-I vs OG-II distribution
              </CardDescription>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground px-1.5 py-0.5 rounded bg-muted">
              HIRE_DATE (BATCHES)
            </span>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 pt-3 sm:pt-4">
            {batchData.length === 0 ? (
              <div className="h-[250px] sm:h-[280px] flex items-center justify-center text-xs text-muted-foreground">
                No hire date batch records found.
              </div>
            ) : (
              <div className="h-[250px] sm:h-[280px] w-full overflow-x-auto overflow-y-hidden pb-1 scrollbar-thin">
                <div style={{ width: `${Math.max(100, batchData.length * 4.5)}%`, minWidth: '100%', height: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={batchData}
                      margin={{ top: 22, right: 20, left: -20, bottom: 35 }}
                      barCategoryGap="18%"
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                      <XAxis
                        dataKey="displayDate"
                        tick={{ fontSize: 9 }}
                        angle={-28}
                        textAnchor="end"
                        interval={0}
                        height={40}
                      />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (!active || !payload || !payload.length) return null;
                          const og1Val = payload.find(p => p.dataKey === 'og1')?.value || 0;
                          const og2Val = payload.find(p => p.dataKey === 'og2')?.value || 0;
                          const othersVal = payload.find(p => p.dataKey === 'others')?.value || 0;
                          const totalVal = Number(og1Val) + Number(og2Val) + Number(othersVal);

                          return (
                            <div className="rounded-lg border border-border bg-popover p-2.5 shadow-md text-xs space-y-1">
                              <p className="font-semibold text-foreground border-b border-border pb-1">Batch Date: {label}</p>
                              <p className="text-cyan-600 dark:text-cyan-400">
                                OG-I: <strong className="font-mono">{og1Val}</strong>
                              </p>
                              <p className="text-indigo-600 dark:text-indigo-400">
                                OG-II: <strong className="font-mono">{og2Val}</strong>
                              </p>
                              {Number(othersVal) > 0 && (
                                <p className="text-muted-foreground">
                                  Other Grades: <strong className="font-mono text-foreground">{othersVal}</strong>
                                </p>
                              )}
                              <p className="text-foreground font-semibold pt-0.5 border-t border-border">
                                Total Batch Size: <span className="font-mono">{totalVal}</span>
                              </p>
                            </div>
                          );
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} iconType="circle" iconSize={7} />
                      {/* 1. Other Grades (Bottom of Stack) */}
                      <Bar dataKey="others" name="Other Grades" fill="#94a3b8" stackId="batch" maxBarSize={28}>
                        <LabelList
                          dataKey="others"
                          position="center"
                          className="fill-white font-mono text-[8px] font-medium"
                          formatter={(val: unknown) => (typeof val === 'number' && val > 0 ? String(val) : '')}
                        />
                      </Bar>
                      {/* 2. OG-2 Stack (Middle of Stack) */}
                      <Bar dataKey="og2" name="OG-II / OG-2" fill="#818cf8" stackId="batch" maxBarSize={28}>
                        <LabelList
                          dataKey="og2"
                          position="center"
                          className="fill-white font-mono text-[8px] font-medium"
                          formatter={(val: unknown) => (typeof val === 'number' && val > 0 ? String(val) : '')}
                        />
                      </Bar>
                      {/* 3. OG-1 Stack (Top of Stack with Total Batch Label) */}
                      <Bar dataKey="og1" name="OG-I / OG-1" fill="#0284c7" stackId="batch" radius={[2, 2, 0, 0]} maxBarSize={28}>
                        <LabelList
                          dataKey="og1"
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
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Status Donut */}
        <Card className="border border-border bg-card shadow-2xs">
          <CardHeader className="p-3.5 sm:p-4 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xs sm:text-sm font-semibold text-foreground">
                Employment Status
              </CardTitle>
              <CardDescription className="text-[11px] sm:text-xs">
                Active vs Attrited breakdown
              </CardDescription>
            </div>
            <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground">
              USER_STATUS
            </span>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center">
            <div className="h-[180px] sm:h-[200px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={2}
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STATUS_COLORS[entry.status] || PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Clean Legend Pills */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
              {statusData.map((item, idx) => (
                <div
                  key={`status-${item.status}-${idx}`}
                  className="flex items-center gap-1 text-[11px] text-muted-foreground px-2 py-0.5 rounded bg-muted/60 border border-border"
                >
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{
                      backgroundColor:
                        STATUS_COLORS[item.status] || PIE_COLORS[idx % PIE_COLORS.length]
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
