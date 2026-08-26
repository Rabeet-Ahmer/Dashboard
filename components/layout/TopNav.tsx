'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Search,
  ChevronRight,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { exportRecordsToExcel, exportRecordsToCSV } from '@/lib/excel-parser';
import { EmployeeRecord } from '@/types/hr';

interface TopNavProps {
  activeTabTitle: string;
  activeSheetName: string;
  filteredCount: number;
  totalCount: number;
  filteredRecords: EmployeeRecord[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
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
  searchQuery,
  onSearchChange,
  showFilters,
  onToggleFilters,
  activeFilterCount,
}: TopNavProps) {
  return (
    <header className="sticky top-0 z-20 h-14 border-b border-border bg-background flex items-center justify-between px-6">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Apex HR</span>
        <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
        <span className="font-semibold text-foreground">{activeTabTitle}</span>
        <span className="text-muted-foreground/40">•</span>
        <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal text-muted-foreground">
          {activeSheetName === 'ALL' ? 'All Sheets' : activeSheetName}
        </Badge>
      </div>

      {/* Right: Quick Search, Filter Toggle & Export */}
      <div className="flex items-center gap-2.5">
        {/* Quick Search */}
        <div className="relative w-48 sm:w-64">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search employees, roles..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-8 text-xs bg-muted/40 border-border"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter Bar Toggle */}
        <Button
          variant={showFilters ? 'default' : 'outline'}
          size="sm"
          onClick={onToggleFilters}
          className="h-8 text-xs gap-1.5"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <Badge
              variant={showFilters ? 'secondary' : 'default'}
              className="h-4 px-1 text-[10px] ml-0.5"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {/* Matched Count Pill */}
        <div className="hidden md:flex items-center text-xs text-muted-foreground font-mono px-2 py-1 rounded bg-muted">
          <strong className="text-foreground font-bold mr-1">{filteredCount}</strong> / {totalCount}
        </div>

        {/* Export Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 h-8 text-xs font-medium hover:bg-muted cursor-pointer transition-colors">
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 text-xs">
            <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground">
              Export {filteredCount} Records
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => exportRecordsToExcel(filteredRecords, `HR_Export_${activeSheetName}.xlsx`)}
              className="cursor-pointer text-xs flex items-center gap-2"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              <span>Excel (.xlsx)</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => exportRecordsToCSV(filteredRecords, `HR_Export_${activeSheetName}.csv`)}
              className="cursor-pointer text-xs flex items-center gap-2"
            >
              <Download className="h-4 w-4 text-blue-600" />
              <span>CSV (.csv)</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
