'use client';

import React, { useState, useEffect } from 'react';
import { EmployeeRecord } from '@/types/hr';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
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
  Temporary: '#71717a'
};

const PIE_COLORS = ['#2563eb', '#d97706', '#7c3aed', '#059669', '#e11d48'];

export function HierarchyTab({ records }: HierarchyTabProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const cadreData = React.useMemo(() => getCadreDistribution(records), [records]);
  const gradeData = React.useMemo(() => getGradeDistribution(records), [records]);
  const emplData = React.useMemo(() => getEmploymentTypeDistribution(records), [records]);
  const topPositions = React.useMemo(() => getTopPositions(records, 8), [records]);
  const supervisorData = React.useMemo(() => getSupervisorSpan(records, 6), [records]);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-[340px] rounded-lg" />
        <Skeleton className="h-[340px] rounded-lg" />
        <Skeleton className="h-[220px] rounded-lg lg:col-span-2" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Row 1: Cadre Breakdown & Grade Pyramid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Cadre & Gender Distribution */}
        <Card className="border border-border bg-card shadow-2xs">
          <CardHeader className="pb-2 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-foreground">
                  Cadre & Staff Level Distribution
                </CardTitle>
                <CardDescription className="text-xs">
                  Executive, Management, Officer, and Support staff by gender
                </CardDescription>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">
                CADRE
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[280px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={cadreData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                  <XAxis dataKey="cadre" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="male" name="Male (♂)" fill="#2563eb" stackId="a" />
                  <Bar dataKey="female" name="Female (♀)" fill="#e11d48" stackId="a" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 2. Grade Distribution */}
        <Card className="border border-border bg-card shadow-2xs">
          <CardHeader className="pb-2 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-foreground">
                  Job Grade Breakdown
                </CardTitle>
                <CardDescription className="text-xs">
                  Hierarchy and pay grade distribution
                </CardDescription>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">
                GRADE
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[280px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={gradeData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="grade" tick={{ fontSize: 10 }} width={130} />
                  <Tooltip />
                  <Bar dataKey="count" name="Employees" fill="#4f46e5" radius={[0, 2, 2, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Top Positions & Employment Type */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3. Top Positions */}
        <Card className="border border-border bg-card shadow-2xs lg:col-span-2">
          <CardHeader className="pb-2 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-foreground">
                  Top Designations & Positions
                </CardTitle>
                <CardDescription className="text-xs">
                  Most populated roles across the organization
                </CardDescription>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">
                Pos_name
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[260px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={topPositions} layout="vertical" margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="position" tick={{ fontSize: 10 }} width={170} />
                  <Tooltip />
                  <Bar dataKey="count" name="Staff Count" fill="#0284c7" radius={[0, 2, 2, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 4. Employment Type Donut */}
        <Card className="border border-border bg-card shadow-2xs">
          <CardHeader className="pb-2 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-foreground">
                  Employment Type
                </CardTitle>
                <CardDescription className="text-xs">
                  Permanent vs Contractual mix
                </CardDescription>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">
                EMPL
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-4 flex flex-col items-center justify-center">
            <div className="h-[180px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie
                    data={emplData}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
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
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {emplData.map((item, idx) => (
                <div key={item.type} className="flex items-center gap-1.5 text-xs text-muted-foreground px-2 py-0.5 rounded bg-muted/60 border border-border">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: EMPL_COLORS[item.type] || PIE_COLORS[idx % PIE_COLORS.length]
                    }}
                  />
                  <span>
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
        <CardHeader className="pb-2 border-b border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">
                Supervisor Span of Control
              </CardTitle>
              <CardDescription className="text-xs">
                Direct reports per manager
              </CardDescription>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground">
              SUPERVISOR
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {supervisorData.map((sup) => (
              <div
                key={sup.supervisor}
                className="border border-border rounded-lg p-3 bg-muted/20 space-y-1.5"
              >
                <p className="text-xs font-medium text-foreground truncate" title={sup.supervisor}>
                  {sup.supervisor}
                </p>
                <div className="flex items-baseline justify-between pt-1 border-t border-border">
                  <span className="text-xl font-bold font-mono text-foreground">
                    {sup.directReports}
                  </span>
                  <span className="text-[10px] uppercase text-muted-foreground font-medium">
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
