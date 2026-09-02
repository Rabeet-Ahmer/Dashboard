'use client';

import React from 'react';
import { HRMetricsSummary } from '@/types/hr';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { formatTenureReadable } from '@/lib/analytics';

interface KPICardsProps {
  metrics: HRMetricsSummary;
}

export function KPICards({ metrics }: KPICardsProps) {
  const tenureFormatted = formatTenureReadable(metrics.avgTenureYears);

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
                  Percentage of active employees in dataset
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
                  Calculated from employee HIRE_DATE ({metrics.avgTenureYears} yrs avg)
                </TooltipContent>
              </Tooltip>
            </span>
            <span className="text-[10px] text-muted-foreground font-mono shrink-0">Tenure</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-mono">
            {metrics.avgTenureYears > 0 ? (
              <div className="flex items-baseline gap-1">
                <span>{tenureFormatted.display}</span>
                {tenureFormatted.unit && (
                  <span className="text-xs sm:text-sm font-normal text-muted-foreground">{tenureFormatted.unit}</span>
                )}
              </div>
            ) : (
              'N/A'
            )}
          </div>
          <p className="text-[11px] text-muted-foreground truncate" title={tenureFormatted.fullText}>
            {metrics.avgTenureYears > 0 ? (
              metrics.avgTenureYears < 1 ? `New cohort (~${metrics.avgTenureYears} yrs)` : tenureFormatted.fullText
            ) : (
              'No tenure data'
            )}
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

      {/* 5. Gender Diversity Ratio (Dual Male & Female Split) */}
      <Card className="border border-border bg-card shadow-2xs">
        <CardContent className="p-3.5 sm:p-4 space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span className="flex items-center gap-1 truncate">
              Gender Split
              <Tooltip>
                <TooltipTrigger className="hidden sm:inline">
                  <Info className="h-3 w-3 text-muted-foreground/70 cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent className="text-xs">
                  Proportion of Male (♂) vs Female (♀) workforce
                </TooltipContent>
              </Tooltip>
            </span>
            <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground shrink-0">
              DEI
            </span>
          </div>

          {/* Opposite Ends: Male on Left, Female on Right */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400">♂</span>
              <span className="text-sm sm:text-base font-bold tracking-tight text-foreground font-mono">
                {metrics.genderRatio.malePercent}%
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm sm:text-base font-bold tracking-tight text-foreground font-mono">
                {metrics.genderRatio.femalePercent}%
              </span>
              <span className="text-[11px] font-bold text-rose-500 dark:text-rose-400">♀</span>
            </div>
          </div>

          {/* Dual Color Segmented Progress Bar */}
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex">
            <div
              className="bg-sky-500 h-full transition-all"
              style={{ width: `${metrics.genderRatio.malePercent}%` }}
            />
            <div
              className="bg-rose-400 h-full transition-all"
              style={{ width: `${metrics.genderRatio.femalePercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-muted-foreground font-mono">
            <span className="text-sky-600 dark:text-sky-400 font-medium">Male: {metrics.genderRatio.maleCount}</span>
            <span className="text-rose-500 dark:text-rose-400 font-medium">Female: {metrics.genderRatio.femaleCount}</span>
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
