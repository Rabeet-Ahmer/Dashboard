'use client';

import React, { useState, useEffect } from 'react';
import { EmployeeRecord } from '@/types/hr';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DiversityTabProps {
  records: EmployeeRecord[];
}

const DIVERSITY_COLORS = ['#e11d48', '#2563eb', '#059669', '#d97706', '#7c3aed'];

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
      const st = r.maritalStatus || 'Married';
      if (!map[st]) map[st] = { status: st, count: 0 };
      map[st].count++;
    }
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [records]);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-[340px] rounded-lg" />
        <Skeleton className="h-[340px] rounded-lg" />
        <Skeleton className="h-[340px] rounded-lg lg:col-span-2" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Row 1: Gender by Grade & Age Pyramid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Gender Diversity Across Grades */}
        <Card className="border border-border bg-card shadow-2xs">
          <CardHeader className="pb-2 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-foreground">
                  Gender Balance Across Job Grades
                </CardTitle>
                <CardDescription className="text-xs">
                  Male and female representation across leadership tiers
                </CardDescription>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">
                GENDER × GRADE
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[280px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={genderGradeData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                  <XAxis dataKey="grade" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" interval={0} />
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

        {/* 2. Age Generational Cohorts */}
        <Card className="border border-border bg-card shadow-2xs">
          <CardHeader className="pb-2 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-foreground">
                  Age Demographic Cohorts
                </CardTitle>
                <CardDescription className="text-xs">
                  Generational distribution derived from DATE_OF_BIRTH
                </CardDescription>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">
                DATE_OF_BIRTH
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[280px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={ageData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                  <XAxis dataKey="ageGroup" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="male" name="Male" fill="#2563eb" stackId="a" />
                  <Bar dataKey="female" name="Female" fill="#e11d48" stackId="a" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Tenure Brackets & Demographics Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3. Tenure Brackets */}
        <Card className="border border-border bg-card shadow-2xs lg:col-span-2">
          <CardHeader className="pb-2 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-foreground">
                  Tenure & Retention Brackets
                </CardTitle>
                <CardDescription className="text-xs">
                  Employee service longevity cohorts
                </CardDescription>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">
                HIRE_DATE
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[260px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={tenureData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                  <XAxis dataKey="tenureGroup" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Employees" fill="#4f46e5" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 4. Marital Status */}
        <Card className="border border-border bg-card shadow-2xs">
          <CardHeader className="pb-2 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-foreground">
                  Marital Status Profile
                </CardTitle>
                <CardDescription className="text-xs">
                  Employee demographics
                </CardDescription>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">
                MARITAL_STATUS
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-4 flex flex-col items-center justify-center">
            <div className="h-[180px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie
                    data={maritalData}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={2}
                  >
                    {maritalData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={DIVERSITY_COLORS[index % DIVERSITY_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {maritalData.map((item, idx) => (
                <div key={item.status} className="flex items-center gap-1.5 text-xs text-muted-foreground px-2 py-0.5 rounded bg-muted/60 border border-border">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: DIVERSITY_COLORS[idx % DIVERSITY_COLORS.length] }}
                  />
                  <span>
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
