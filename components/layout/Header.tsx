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
  UploadCloud,
  FileSpreadsheet,
  Download,
  Sparkles,
  Layers,
  ShieldCheck,
  Zap,
  Activity,
  ChevronDown
} from 'lucide-react';
import { exportRecordsToExcel, exportRecordsToCSV } from '@/lib/excel-parser';
import { EmployeeRecord } from '@/types/hr';

interface HeaderProps {
  fileName: string;
  totalSheetsCount: number;
  activeSheetName: string;
  totalFilteredCount: number;
  filteredRecords: EmployeeRecord[];
  onOpenUpload: () => void;
  onLoadSample: () => void;
}

export function Header({
  fileName,
  totalSheetsCount,
  activeSheetName,
  totalFilteredCount,
  filteredRecords,
  onOpenUpload,
  onLoadSample,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-xs transition-colors">
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left Branding */}
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
              <Zap className="h-5 w-5 fill-white/20 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 ring-2 ring-background"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base md:text-lg font-bold tracking-tight text-foreground flex items-center gap-1.5">
                SEAP<span className="text-primary font-extrabold">HQ</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                  Portal
                </span>
              </h1>
            </div>
            <p className="text-[11px] text-muted-foreground hidden sm:flex items-center gap-1.5">
              <span>Science And Engineering Associate Program</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 font-medium">
                <ShieldCheck className="h-3 w-3" /> Confidential
              </span>
            </p>
          </div>
        </div>

        {/* Center: Live HUD Telemetry */}
        <div className="hidden lg:flex items-center gap-3 bg-muted/40 border border-border/80 rounded-xl px-3.5 py-1.5 text-xs text-muted-foreground shadow-2xs">
          <div className="flex items-center gap-1.5">
            <FileSpreadsheet className="h-4 w-4 text-blue-500 shrink-0" />
            <span className="font-semibold text-foreground truncate max-w-[160px] font-mono text-[11px]">
              {fileName}
            </span>
          </div>
          <span className="text-border">|</span>
          <div className="flex items-center gap-1">
            <Layers className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[11px]">{totalSheetsCount} {totalSheetsCount === 1 ? 'Sheet' : 'Sheets'}</span>
          </div>
          <span className="text-border">|</span>
          <div className="flex items-center gap-1 text-[11px]">
            <Activity className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-foreground font-mono font-medium">{totalFilteredCount}</span>
            <span>matched</span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Sample Data Reset */}
          <Button
            variant="outline"
            size="sm"
            onClick={onLoadSample}
            className="hidden sm:flex items-center gap-1.5 text-xs h-9 rounded-lg border-border/70 hover:bg-accent hover:border-border"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Reset Demo</span>
          </Button>

          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border/80 bg-background px-3 h-9 text-xs font-medium shadow-2xs hover:bg-accent cursor-pointer transition-all">
              <Download className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="hidden sm:inline">Export</span>
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 font-semibold bg-muted">
                {totalFilteredCount}
              </Badge>
              <ChevronDown className="h-3 w-3 opacity-50 ml-0.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-xl rounded-xl">
              <DropdownMenuLabel className="text-[11px] font-semibold px-2 py-1.5 text-muted-foreground uppercase tracking-wider">
                Export Filtered View ({totalFilteredCount} rows)
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => exportRecordsToExcel(filteredRecords, `HR_Intelligence_${activeSheetName}.xlsx`)}
                className="cursor-pointer text-xs rounded-lg py-2 flex items-center gap-2.5"
              >
                <div className="h-7 w-7 rounded-md bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <FileSpreadsheet className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-medium block text-foreground">Microsoft Excel</span>
                  <span className="text-[10px] text-muted-foreground block">Formatted .xlsx workbook</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => exportRecordsToCSV(filteredRecords, `HR_Intelligence_${activeSheetName}.csv`)}
                className="cursor-pointer text-xs rounded-lg py-2 flex items-center gap-2.5"
              >
                <div className="h-7 w-7 rounded-md bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <Download className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-medium block text-foreground">Comma-Separated</span>
                  <span className="text-[10px] text-muted-foreground block">Standard .csv spreadsheet</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Upload Button */}
          <Button
            size="sm"
            onClick={onOpenUpload}
            className="h-9 gap-1.5 text-xs bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-md shadow-blue-600/20 hover:from-blue-700 hover:to-indigo-700 rounded-lg transition-all"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Upload Sheets</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
