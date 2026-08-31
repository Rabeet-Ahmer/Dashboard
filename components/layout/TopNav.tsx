'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  SlidersHorizontal,
  Layers,
  Menu
} from 'lucide-react';

interface TopNavProps {
  activeTabTitle: string;
  activeSheetName: string;
  filteredCount: number;
  totalCount: number;
  showFilters: boolean;
  onToggleFilters: () => void;
  activeFilterCount: number;
  onOpenMobileMenu?: () => void;
}

export function TopNav({
  activeTabTitle,
  activeSheetName,
  filteredCount,
  totalCount,
  showFilters,
  onToggleFilters,
  activeFilterCount,
  onOpenMobileMenu,
}: TopNavProps) {
  return (
    <header className="sticky top-0 z-20 h-14 sm:h-16 border-b border-border bg-background/95 backdrop-blur-xs flex items-center justify-between px-3 sm:px-6 lg:px-8">
      {/* Left: Mobile Menu Toggle + View Title & Sheet Breadcrumb */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile Hamburger Button */}
        {onOpenMobileMenu && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenMobileMenu}
            className="lg:hidden h-9 w-9 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        <div className="min-w-0">
          <h1 className="text-sm sm:text-base lg:text-lg font-bold tracking-tight text-foreground truncate">
            {activeTabTitle}
          </h1>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground sm:hidden truncate">
            <span className="truncate">{activeSheetName === 'ALL' ? 'All Sheets' : activeSheetName}</span>
            <span>•</span>
            <span className="font-mono">{filteredCount}/{totalCount}</span>
          </div>
        </div>

        <div className="h-4 w-px bg-border hidden sm:block" />
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground truncate">
          <Layers className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
          <span className="hidden md:inline">Sheet:</span>
          <Badge variant="secondary" className="text-xs font-mono font-medium px-2 py-0.5 truncate max-w-[140px] md:max-w-[200px]">
            {activeSheetName === 'ALL' ? 'All Sheets Combined' : activeSheetName}
          </Badge>
        </div>
      </div>

      {/* Right: Telemetry pill & Filter toggle */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Record count indicator (Desktop/Tablet) */}
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
          className="h-8 sm:h-9 px-2.5 sm:px-3.5 text-xs font-medium gap-1.5 sm:gap-2 rounded-lg cursor-pointer transition-all shadow-2xs"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Filters</span>
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
      </div>
    </header>
  );
}
