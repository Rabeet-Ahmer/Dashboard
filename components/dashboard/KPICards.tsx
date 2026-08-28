'use client';

import React from 'react';
import { HRMetricsSummary } from '@/types/hr';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface KPICardsProps {
  metrics: HRMetricsSummary;
}

export function KPICards({ metrics }: KPICardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
      {/* 1. Total Headcount */}
      <Card className="border border-border bg-card shadow-2xs">
        <CardContent className="p-3.5 sm:p-4 space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span className="truncate">Total Headcount</span>
            <Badge variant="outline" className="text-[10px] py-0 px-1 font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shrink-0">
              {metrics.activeCount} Act
            </Badge>
          </div>
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-mono">
            {metrics.totalHeadcount.toLocaleString()}
          </div>
          <p className="text-[11px] text-muted-foreground truncate">
            {metrics.inactiveCount > 0 ? `${metrics.inactiveCount} inactive` : '100% Active'}
          </p>
        </CardContent>
      </Card>

      {/* 2. Active Workforce Ratio */}
      <Card className="border border-border bg-card shadow-2xs">
        <CardContent className="p-3.5 sm:p-4 space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span className="flex items-center gap-1 truncate">
              Active Ratio
              <Tooltip>
                <TooltipTrigger className="hidden sm:inline">
                  <Info className="h-3 w-3 text-muted-foreground/70 cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent className="text-xs">
                  Percentage of workforce currently in Active status
                </TooltipContent>
              </Tooltip>
            </span>
            <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground shrink-0">
              {metrics.activeCount}/{metrics.totalHeadcount}
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-mono">
            {metrics.activeRatio}%
          </div>
          <Progress value={metrics.activeRatio} className="h-1 bg-muted" />
        </CardContent>
      </Card>

      {/* 3. Average Tenure */}
      <Card className="border border-border bg-card shadow-2xs">
        <CardContent className="p-3.5 sm:p-4 space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span className="flex items-center gap-1 truncate">
              Avg Tenure
              <Tooltip>
                <TooltipTrigger className="hidden sm:inline">
                  <Info className="h-3 w-3 text-muted-foreground/70 cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent className="text-xs">
                  Calculated from employee HIRE_DATE
                </TooltipContent>
              </Tooltip>
            </span>
            <span className="text-[10px] text-muted-foreground font-mono shrink-0">Years</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-mono">
            {metrics.avgTenureYears > 0 ? (
              <>
                {metrics.avgTenureYears} <span className="text-xs sm:text-sm font-normal text-muted-foreground">yrs</span>
              </>
            ) : (
              'N/A'
            )}
          </div>
          <p className="text-[11px] text-muted-foreground truncate">
            {metrics.avgTenureYears >= 5 ? 'High stability' : (metrics.avgTenureYears > 0 ? 'Growing tenure' : 'No tenure data')}
          </p>
        </CardContent>
      </Card>

      {/* 4. Average Age */}
      <Card className="border border-border bg-card shadow-2xs">
        <CardContent className="p-3.5 sm:p-4 space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span className="flex items-center gap-1 truncate">
              Avg Age
              <Tooltip>
                <TooltipTrigger className="hidden sm:inline">
                  <Info className="h-3 w-3 text-muted-foreground/70 cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent className="text-xs">
                  Calculated from employee DATE_OF_BIRTH
                </TooltipContent>
              </Tooltip>
            </span>
            <span className="text-[10px] text-muted-foreground font-mono shrink-0">Age</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-mono">
            {metrics.avgAge > 0 ? (
              <>
                {metrics.avgAge} <span className="text-xs sm:text-sm font-normal text-muted-foreground">yrs</span>
              </>
            ) : (
              'N/A'
            )}
          </div>
          <p className="text-[11px] text-muted-foreground truncate">
            {metrics.avgAge > 0 ? (metrics.avgAge < 35 ? 'Millennial/Gen-Z' : 'Experienced') : 'No DOB data'}
          </p>
        </CardContent>
      </Card>

      {/* 5. Gender Diversity Ratio */}
      <Card className="border border-border bg-card shadow-2xs">
        <CardContent className="p-3.5 sm:p-4 space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span className="truncate">Diversity (DEI)</span>
            <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground shrink-0">
              ♀ {metrics.genderRatio.femalePercent}%
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-mono">
            {metrics.genderRatio.femalePercent}% <span className="text-[11px] sm:text-xs font-normal text-muted-foreground font-sans">Female</span>
          </div>
          <div className="h-1 w-full bg-blue-600 rounded-full overflow-hidden flex">
            <div
              className="bg-rose-500 h-full"
              style={{ width: `${metrics.genderRatio.femalePercent}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* 6. Network Reach */}
      <Card className="border border-border bg-card shadow-2xs">
        <CardContent className="p-3.5 sm:p-4 space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span className="truncate">Footprint</span>
            <span className="text-[10px] font-mono text-muted-foreground shrink-0">
              {metrics.uniqueRegionsCount} Regions
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-mono">
            {metrics.uniqueBranchesCount} <span className="text-xs sm:text-sm font-normal text-muted-foreground">branches</span>
          </div>
          <p className="text-[11px] text-muted-foreground truncate">
            {metrics.uniqueClustersCount} clusters
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
