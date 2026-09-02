'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LayoutDashboard,
  Building2,
  Network,
  HeartHandshake,
  Users,
  UploadCloud,
  FileSpreadsheet,
  ShieldCheck,
  Briefcase,
  Trash2,
  X
} from 'lucide-react';
import { SheetCollection } from '@/types/hr';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  sheetsData: SheetCollection;
  activeSheet: string;
  onSheetChange: (sheet: string) => void;
  fileName: string;
  totalRecordsCount: number;
  onOpenUpload: () => void;
  onClearData?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({
  activeTab,
  onTabChange,
  sheetsData,
  activeSheet,
  onSheetChange,
  fileName,
  totalRecordsCount,
  onOpenUpload,
  onClearData,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const sheetNames = Object.keys(sheetsData);

  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      description: 'KPI summary & trends',
    },
    {
      id: 'hierarchy',
      label: 'Organization & Cadres',
      icon: Building2,
      description: 'Grades, levels & categories',
    },
    {
      id: 'supervisors',
      label: 'Supervisor Span & Teams',
      icon: Network,
      description: 'Manager hierarchy & teams',
    },
    {
      id: 'diversity',
      label: 'Demographics (DEI)',
      icon: HeartHandshake,
      description: 'Gender, age & tenure',
    },
    {
      id: 'explorer',
      label: 'Employee Directory',
      icon: Users,
      badge: totalRecordsCount,
      description: 'Complete data table',
    },
  ];

  const handleNavClick = (id: string) => {
    onTabChange(id);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full bg-sidebar">
      {/* Top Section: Branding & Sheet Switcher */}
      <div className="p-4 space-y-4">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-1 py-0.5">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-xs">
              <Briefcase className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-foreground">
                  SEAP
                </span>
                <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20">
                  Portal
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-tight truncate max-w-[150px]" title="Science And Engineering Associate Program">
                Science & Eng. Program
              </p>
            </div>
          </div>

          {/* Close button on mobile */}
          {onMobileClose && (
            <button
              onClick={onMobileClose}
              className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Active Workbook & Sheet Selector */}
        <div className="space-y-1.5 pt-1">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block px-1">
            Active Dataset
          </label>
          <div className="border border-border rounded-lg p-2 bg-background space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-foreground truncate" title={fileName}>
              <FileSpreadsheet className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="truncate">{fileName || 'No file loaded'}</span>
            </div>
            <Select
              value={activeSheet}
              onValueChange={(val) => {
                if (val) {
                  onSheetChange(val);
                  if (onMobileClose) onMobileClose();
                }
              }}
            >
              <SelectTrigger className="h-7 w-full text-xs bg-muted/50 border-border">
                <SelectValue placeholder="Select Sheet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">
                  All Sheets Combined ({totalRecordsCount})
                </SelectItem>
                {sheetNames.map((sheet) => (
                  <SelectItem key={sheet} value={sheet}>
                    {sheet} ({sheetsData[sheet]?.length || 0})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="space-y-1 pt-2">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block px-1">
            Views
          </label>
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2.5 sm:py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <Badge
                      variant={isActive ? 'outline' : 'secondary'}
                      className={`text-[10px] px-1.5 py-0 font-mono ${
                        isActive
                          ? 'border-primary-foreground/30 text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Section: Actions & Privacy */}
      <div className="p-4 border-t border-border space-y-2 bg-sidebar">
        <Button
          onClick={() => {
            onOpenUpload();
            if (onMobileClose) onMobileClose();
          }}
          className="w-full h-9 sm:h-8 text-xs font-medium gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
        >
          <UploadCloud className="h-3.5 w-3.5" />
          <span>Upload Another Sheet</span>
        </Button>

        {onClearData && (
          <Button
            variant="ghost"
            onClick={() => {
              onClearData();
              if (onMobileClose) onMobileClose();
            }}
            className="w-full h-8 text-xs font-normal text-muted-foreground hover:text-destructive gap-1.5 cursor-pointer"
          >
            <Trash2 className="h-3 w-3" />
            <span>Unload / Reset Data</span>
          </Button>
        )}

        <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground pt-1">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>SQLite Database • In-Memory</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-border bg-sidebar shrink-0 flex-col justify-between h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* 2. Mobile Slide-Over Drawer with Backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200"
            onClick={onMobileClose}
          />

          {/* Drawer Canvas */}
          <div className="relative w-4/5 max-w-xs h-full bg-sidebar border-r border-border shadow-2xl z-50 flex flex-col transition-transform animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
