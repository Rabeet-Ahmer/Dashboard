'use client';

import React, { useState, useEffect } from 'react';
import { EmployeeRecord } from '@/types/hr';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getBranchCategoryDistribution,
  getFlagshipDistribution
} from '@/lib/analytics';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface GeographicTabProps {
  records: EmployeeRecord[];
}

const CATEGORY_COLORS = ['#2563eb', '#059669', '#d97706', '#7c3aed', '#0284c7', '#e11d48'];
const FLAGSHIP_COLORS: Record<string, string> = {
  'Yes (Flagship)': '#2563eb',
  'Headquarters': '#7c3aed',
  'Corporate Center': '#0284c7',
  'Standard': '#71717a'
};

export function GeographicTab({ records }: GeographicTabProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const categoryData = React.useMemo(() => getBranchCategoryDistribution(records), [records]);
  const flagshipData = React.useMemo(() => getFlagshipDistribution(records), [records]);

  // Top 10 Branches by employee count
  const topBranches = React.useMemo(() => {
    const map: Record<string, { branchCode: string; region: string; cluster: string; count: number; category: string }> = {};
    for (const r of records) {
      const code = r.branchCode || 'BR-Unknown';
      if (!map[code]) {
        map[code] = {
          branchCode: code,
          region: r.region,
          cluster: r.cluster,
          count: 0,
          category: r.branchCategory
        };
      }
      map[code].count++;
    }
    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 10);
  }, [records]);

  // Cluster distribution
  const clusterData = React.useMemo(() => {
    const map: Record<string, { cluster: string; region: string; count: number }> = {};
    for (const r of records) {
      const clus = r.cluster || 'General';
      if (!map[clus]) {
        map[clus] = { cluster: clus, region: r.region, count: 0 };
      }
      map[clus].count++;
    }
    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 10);
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
      {/* Row 1: Branch Categories & Flagship Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* 1. Branch Category */}
        <Card className="border border-border bg-card shadow-2xs">
          <CardHeader className="p-3.5 sm:p-4 pb-2 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xs sm:text-sm font-semibold text-foreground">
                  Branch Category Distribution
                </CardTitle>
                <CardDescription className="text-[11px] sm:text-xs">
                  Urban, Commercial, Rural, and Islamic branch network
                </CardDescription>
              </div>
              <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground">
                BRANCH_CATEGORY
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 pt-3 sm:pt-4">
            <div className="h-[240px] sm:h-[280px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={categoryData} margin={{ top: 10, right: 15, left: -20, bottom: 35 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                  <XAxis dataKey="category" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Staff Strength" fill="#059669" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 2. Flagship vs Standard */}
        <Card className="border border-border bg-card shadow-2xs">
          <CardHeader className="p-3.5 sm:p-4 pb-2 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xs sm:text-sm font-semibold text-foreground">
                  Flagship vs Standard Locations
                </CardTitle>
                <CardDescription className="text-[11px] sm:text-xs">
                  Headquarters and flagship hub staff concentration
                </CardDescription>
              </div>
              <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground">
                FLAGSHIP
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center">
            <div className="h-[170px] sm:h-[200px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie
                    data={flagshipData}
                    dataKey="count"
                    nameKey="flagship"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={2}
                  >
                    {flagshipData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={FLAGSHIP_COLORS[entry.flagship] || CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
              {flagshipData.map((item, idx) => (
                <div key={item.flagship} className="flex items-center gap-1 text-[11px] text-muted-foreground px-2 py-0.5 rounded bg-muted/60 border border-border">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{
                      backgroundColor:
                        FLAGSHIP_COLORS[item.flagship] || CATEGORY_COLORS[idx % CATEGORY_COLORS.length]
                    }}
                  />
                  <span className="truncate">
                    {item.flagship}: <strong className="text-foreground font-mono">{item.count}</strong>
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Top Staffed Branches & Top Clusters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top 10 Branches */}
        <Card className="border border-border bg-card shadow-2xs">
          <CardHeader className="p-3.5 sm:p-4 pb-2 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xs sm:text-sm font-semibold text-foreground">
                  Top Staffed Branches
                </CardTitle>
                <CardDescription className="text-[11px] sm:text-xs">
                  Branches with highest employee headcount
                </CardDescription>
              </div>
              <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground">
                BRANCH_CODE *
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 pt-3 sm:pt-4">
            <div className="h-[240px] sm:h-[280px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={topBranches} layout="vertical" margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="branchCode" tick={{ fontSize: 9 }} width={75} />
                  <Tooltip />
                  <Bar dataKey="count" name="Staff Count" fill="#2563eb" radius={[0, 2, 2, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Clusters */}
        <Card className="border border-border bg-card shadow-2xs">
          <CardHeader className="p-3.5 sm:p-4 pb-2 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xs sm:text-sm font-semibold text-foreground">
                  Cluster Workforce Distribution
                </CardTitle>
                <CardDescription className="text-[11px] sm:text-xs">
                  Staff strength across operational sub-regions
                </CardDescription>
              </div>
              <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground">
                CLUS
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 pt-3 sm:pt-4">
            <div className="h-[240px] sm:h-[280px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={clusterData} layout="vertical" margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="cluster" tick={{ fontSize: 9 }} width={100} />
                  <Tooltip />
                  <Bar dataKey="count" name="Employees" fill="#4f46e5" radius={[0, 2, 2, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
