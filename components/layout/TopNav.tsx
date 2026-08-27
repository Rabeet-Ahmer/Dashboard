'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Download,
  FileSpreadsheet,
  SlidersHorizontal,
  FileText,
  Layers
} from 'lucide-react';
import { exportRecordsToExcel, exportRecordsToCSV } from '@/lib/excel-parser';
import { EmployeeRecord } from '@/types/hr';

interface TopNavProps {
  activeTabTitle: string;
  activeSheetName: string;
  filteredCount: number;
  totalCount: number;
  filteredRecords: EmployeeRecord[];
  showFilters: boolean;
  onToggleFilters: () => void;
  activeFilterCount: number;
}

export function TopNav({
  activeTabTitle,
  activeSheetName,
  filteredCount,
  totalCount,
  filteredRecords,
  showFilters,
  onToggleFilters,
  activeFilterCount,
}: TopNavProps) {
  return (
    <header className="sticky top-0 z-20 h-16 border-b border-border bg-background/95 backdrop-blur-xs flex items-center justify-between px-8">
      {/* Left: View Title & Sheet Breadcrumb */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold tracking-tight text-foreground">
          {activeTabTitle}
        </h1>
        <div className="h-4 w-px bg-border hidden sm:block" />
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
          <Layers className="h-3.5 w-3.5 text-muted-foreground/70" />
          <span>Sheet:</span>
          <Badge variant="secondary" className="text-xs font-mono font-medium px-2 py-0.5">
            {activeSheetName === 'ALL' ? 'All Sheets Combined' : activeSheetName}
          </Badge>
        </div>
      </div>

      {/* Right: Telemetry pill, Filter toggle & Export action */}
      <div className="flex items-center gap-3">
        {/* Record count indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/60 border border-border text-xs text-muted-foreground font-mono">
          <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
          <span>
            <strong className="text-foreground font-bold">{filteredCount}</strong> of {totalCount} Records
          </span>
        </div>

        {/* Filter Toggle Button */}
        <Button
          variant={showFilters ? 'default' : 'outline'}
          size="sm"
          onClick={onToggleFilters}
          className="h-9 px-3.5 text-xs font-medium gap-2 rounded-lg transition-all"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span
              className={`h-4 min-w-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${
                showFilters ? 'bg-primary-foreground text-primary' : 'bg-primary text-primary-foreground'
              }`}
            >
              {activeFilterCount}
            </span>
          )}
        </Button>

        {/* Export Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-3.5 h-9 text-xs font-medium hover:bg-muted cursor-pointer transition-colors">
            <Download className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Export Data</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 p-1.5 rounded-xl shadow-lg border-border">
            <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground px-2 py-1.5">
              Export {filteredCount} Filtered Records
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => exportRecordsToExcel(filteredRecords, `HR_Export_${activeSheetName}.xlsx`)}
              className="cursor-pointer text-xs flex items-center gap-2.5 px-2.5 py-2 rounded-lg"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              <div className="flex flex-col">
                <span className="font-medium text-foreground">Excel Workbook</span>
                <span className="text-[10px] text-muted-foreground">Download .xlsx spreadsheet</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => exportRecordsToCSV(filteredRecords, `HR_Export_${activeSheetName}.csv`)}
              className="cursor-pointer text-xs flex items-center gap-2.5 px-2.5 py-2 rounded-lg"
            >
              <FileText className="h-4 w-4 text-blue-600" />
              <div className="flex flex-col">
                <span className="font-medium text-foreground">CSV Document</span>
                <span className="text-[10px] text-muted-foreground">Standard comma-separated format</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
