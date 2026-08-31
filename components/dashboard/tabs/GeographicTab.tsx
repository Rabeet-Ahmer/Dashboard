'use client';

import React, { useState, useEffect } from 'react';
import { EmployeeRecord } from '@/types/hr';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollableChartContainer } from '@/components/dashboard/ScrollableChartContainer';
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
  LabelList,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface GeographicTabProps {
  records: EmployeeRecord[];
}

const CATEGORY_COLORS = ['#0d9488', '#0284c7', '#6366f1', '#10b981', '#f59e0b', '#fb7185'];
const FLAGSHIP_COLORS: Record<string, string> = {
  'Yes (Flagship)': '#0284c7',
  'Headquarters': '#6366f1',
  'Corporate Center': '#0d9488',
  'Standard': '#64748b',
  'N/A': '#94a3b8'
};

export function GeographicTab({ records }: GeographicTabProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const categoryData = React.useMemo(() => getBranchCategoryDistribution(records), [records]);
  const flagshipData = React.useMemo(() => getFlagshipDistribution(records), [records]);

  // Top Branches by employee count
  const topBranches = React.useMemo(() => {
    const map: Record<string, { branchCode: string; region: string; cluster: string; count: number; category: string }> = {};
    for (const r of records) {
      const code = r.branchCode && r.branchCode !== 'N/A' ? r.branchCode : 'Unassigned';
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
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [records]);

  // Cluster distribution
  const clusterData = React.useMemo(() => {
    const map: Record<string, { cluster: string; region: string; count: number }> = {};
    for (const r of records) {
      const clus = r.cluster && r.cluster !== 'N/A' ? r.cluster : 'Unassigned';
      if (!map[clus]) {
        map[clus] = { cluster: clus, region: r.region, count: 0 };
      }
      map[clus].count++;
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
      {/* Row 1: Branch Categories & Flagship Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* 1. Branch Category */}
        <Card className="border border-border bg-card shadow-2xs">
          <CardHeader className="p-3.5 sm:p-4 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
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
          </CardHeader>
          <CardContent className="p-2 sm:p-4 pt-3 sm:pt-4">
            <div className="h-[240px] sm:h-[280px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={categoryData} margin={{ top: 18, right: 15, left: -20, bottom: 35 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                  <XAxis dataKey="category" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Staff Strength" fill="#0d9488" radius={[2, 2, 0, 0]}>
                    <LabelList
                      dataKey="count"
                      position="top"
                      offset={6}
                      className="fill-foreground font-mono text-[10px] font-semibold"
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 2. Flagship vs Standard */}
        <Card className="border border-border bg-card shadow-2xs">
          <CardHeader className="p-3.5 sm:p-4 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
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
                <div key={`flagship-${item.flagship}-${idx}`} className="flex items-center gap-1 text-[11px] text-muted-foreground px-2 py-0.5 rounded bg-muted/60 border border-border">
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
        {/* Top Branches (Scrollable) */}
        <Card className="border border-border bg-card shadow-2xs">
          <CardHeader className="p-3.5 sm:p-4 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xs sm:text-sm font-semibold text-foreground">
                Staffed Branch Network
              </CardTitle>
              <CardDescription className="text-[11px] sm:text-xs">
                Headcount across operational branch locations ({topBranches.length} Branches)
              </CardDescription>
            </div>
            <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground">
              BRANCH_CODE
            </span>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 pt-3 sm:pt-4">
            <ScrollableChartContainer
              dataLength={topBranches.length}
              itemHeight={36}
              minHeight={250}
              maxViewportHeight={280}
              threshold={6}
              itemName="branches"
            >
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={topBranches} layout="vertical" margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="branchCode" tick={{ fontSize: 9 }} width={90} interval={0} />
                  <Tooltip />
                  <Bar dataKey="count" name="Staff Count" fill="#0284c7" radius={[0, 2, 2, 0]} maxBarSize={16}>
                    <LabelList
                      dataKey="count"
                      position="right"
                      offset={6}
                      className="fill-foreground font-mono text-[10px] font-semibold"
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ScrollableChartContainer>
          </CardContent>
        </Card>

        {/* Clusters (Scrollable) */}
        <Card className="border border-border bg-card shadow-2xs">
          <CardHeader className="p-3.5 sm:p-4 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xs sm:text-sm font-semibold text-foreground">
                Cluster Workforce Distribution
              </CardTitle>
              <CardDescription className="text-[11px] sm:text-xs">
                Staff strength across operational sub-regions ({clusterData.length} Clusters)
              </CardDescription>
            </div>
            <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground">
              CLUS
            </span>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 pt-3 sm:pt-4">
            <ScrollableChartContainer
              dataLength={clusterData.length}
              itemHeight={36}
              minHeight={250}
              maxViewportHeight={280}
              threshold={6}
              itemName="clusters"
            >
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={clusterData} layout="vertical" margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="cluster" tick={{ fontSize: 9 }} width={120} interval={0} />
                  <Tooltip />
                  <Bar dataKey="count" name="Employees" fill="#6366f1" radius={[0, 2, 2, 0]} maxBarSize={16}>
                    <LabelList
                      dataKey="count"
                      position="right"
                      offset={6}
                      className="fill-foreground font-mono text-[10px] font-semibold"
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ScrollableChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
