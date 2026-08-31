'use client';

import React, { useState, useEffect } from 'react';
import { EmployeeRecord } from '@/types/hr';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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

// Soft, harmonious palette for Generational Age Cohorts
const AGE_COHORT_COLORS: Record<string, string> = {
  '< 25 yrs': '#2dd4bf',    // Soft Mint / Cyan (Gen-Z)
  '25 - 34 yrs': '#818cf8', // Soft Iris / Lavender (Millennials)
  '35 - 44 yrs': '#f59e0b', // Warm Amber (Mid-career)
  '45 - 54 yrs': '#fb923c', // Warm Peach / Apricot (Experienced)
  '55+ yrs': '#a8a29e'      // Warm Stone Greige (Senior Executive)
};

const AGE_PALETTE = ['#2dd4bf', '#818cf8', '#f59e0b', '#fb923c', '#a8a29e'];

// Soft, comforting palette for Marital Status Profile (Distinct from Gender)
const MARITAL_COLORS: Record<string, string> = {
  Married: '#f59e0b',     // Warm Honey Amber
  Single: '#818cf8',      // Soft Lavender / Iris
  Divorced: '#14b8a6',    // Calming Seafoam Mint
  Separated: '#38bdf8',   // Soft Glacier Sky
  Widowed: '#a8a29e',     // Warm Stone Greige
  Unassigned: '#94a3b8',  // Soft Slate
  'N/A': '#94a3b8'
};

const MARITAL_PALETTE = ['#f59e0b', '#818cf8', '#14b8a6', '#fb923c', '#a8a29e', '#94a3b8'];

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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Skeleton className="h-[280px] sm:h-[340px] rounded-lg" />
        <Skeleton className="h-[280px] sm:h-[340px] rounded-lg" />
        <Skeleton className="h-[280px] sm:h-[340px] rounded-lg lg:col-span-2" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Row 1: Gender by Grade & Age Pyramid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* 1. Gender Diversity Across Grades (Scrollable if >6 grades) */}
        <Card className="border border-border bg-card shadow-2xs">
          <CardHeader className="p-3.5 sm:p-4 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xs sm:text-sm font-semibold text-foreground">
                Gender Balance Across Job Grades
              </CardTitle>
              <CardDescription className="text-[11px] sm:text-xs">
                Male and female representation across tiers ({genderGradeData.length} Grades)
              </CardDescription>
            </div>
            <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground">
              GENDER × Grade
            </span>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 pt-3 sm:pt-4">
            <ScrollableChartContainer
              dataLength={genderGradeData.length}
              itemHeight={38}
              minHeight={240}
              maxViewportHeight={280}
              threshold={6}
              itemName="grades"
            >
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={genderGradeData} margin={{ top: 10, right: 15, left: -20, bottom: 35 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                  <XAxis dataKey="grade" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" interval={0} />
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
                  <Bar dataKey="female" name="Female (♀)" fill="#fb7185" stackId="a" radius={[2, 2, 0, 0]}>
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

        {/* 2. Age Generational Cohorts (Dedicated Soft Generational Colors) */}
        <Card className="border border-border bg-card shadow-2xs">
          <CardHeader className="p-3.5 sm:p-4 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xs sm:text-sm font-semibold text-foreground">
                Age Demographic Cohorts
              </CardTitle>
              <CardDescription className="text-[11px] sm:text-xs">
                Generational distribution across career brackets
              </CardDescription>
            </div>
            <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground">
              DATE_OF_BIRTH
            </span>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 pt-3 sm:pt-4">
            <div className="h-[240px] sm:h-[280px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={ageData} margin={{ top: 18, right: 15, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                  <XAxis dataKey="ageGroup" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload || !payload.length) return null;
                      const val = payload[0]?.value || 0;
                      const totalCount = records.length || 1;
                      const pct = ((Number(val) / totalCount) * 100).toFixed(1);
                      return (
                        <div className="rounded-lg border border-border bg-popover p-2.5 shadow-md text-xs space-y-1">
                          <p className="font-semibold text-foreground">{label}</p>
                          <p className="text-primary">
                            Headcount: <strong className="font-mono">{val}</strong> staff ({pct}%)
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="count" name="Employees" radius={[2, 2, 0, 0]} maxBarSize={28}>
                    {ageData.map((entry, index) => (
                      <Cell
                        key={`age-cell-${index}`}
                        fill={AGE_COHORT_COLORS[entry.ageGroup] || AGE_PALETTE[index % AGE_PALETTE.length]}
                      />
                    ))}
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
            {/* Soft Cohort Legend Pills */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
              {ageData.map((item, idx) => (
                <div
                  key={`age-pill-${item.ageGroup}-${idx}`}
                  className="flex items-center gap-1 text-[10px] text-muted-foreground px-2 py-0.5 rounded bg-muted/50 border border-border"
                >
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{
                      backgroundColor: AGE_COHORT_COLORS[item.ageGroup] || AGE_PALETTE[idx % AGE_PALETTE.length]
                    }}
                  />
                  <span className="truncate">
                    {item.ageGroup}: <strong className="text-foreground font-mono">{item.count}</strong>
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Tenure Brackets & Demographics Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* 3. Tenure Brackets */}
        <Card className="border border-border bg-card shadow-2xs lg:col-span-2">
          <CardHeader className="p-3.5 sm:p-4 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xs sm:text-sm font-semibold text-foreground">
                Tenure & Retention Brackets
              </CardTitle>
              <CardDescription className="text-[11px] sm:text-xs">
                Employee service longevity cohorts (single-year breakdown)
              </CardDescription>
            </div>
            <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground">
              HIRE_DATE
            </span>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 pt-3 sm:pt-4">
            <div className="h-[240px] sm:h-[260px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={tenureData} margin={{ top: 20, right: 15, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                  <XAxis
                    dataKey="tenureGroup"
                    tick={{ fontSize: 9 }}
                    angle={-22}
                    textAnchor="end"
                    interval={0}
                    height={32}
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Employees" fill="#0d9488" radius={[2, 2, 0, 0]}>
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

        {/* 4. Marital Status (Warm, Comforting & Distinct Palette) */}
        <Card className="border border-border bg-card shadow-2xs">
          <CardHeader className="p-3.5 sm:p-4 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xs sm:text-sm font-semibold text-foreground">
                Marital Status Profile
              </CardTitle>
              <CardDescription className="text-[11px] sm:text-xs">
                Employee demographic composition
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
                  <Pie
                    data={maritalData}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={2}
                  >
                    {maritalData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={MARITAL_COLORS[entry.status] || MARITAL_PALETTE[index % MARITAL_PALETTE.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Soft Legend Pills */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
              {maritalData.map((item, idx) => (
                <div
                  key={`marital-${item.status}-${idx}`}
                  className="flex items-center gap-1 text-[10px] text-muted-foreground px-2 py-0.5 rounded bg-muted/60 border border-border"
                >
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{
                      backgroundColor:
                        MARITAL_COLORS[item.status] || MARITAL_PALETTE[idx % MARITAL_PALETTE.length]
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
