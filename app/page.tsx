'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { SheetCollection, HRFilterState } from '@/types/hr';
import { computeHRMetricsSummary } from '@/lib/analytics';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopNav } from '@/components/layout/TopNav';
import { GlobalFilterBar } from '@/components/filters/GlobalFilterBar';
import { KPICards } from '@/components/dashboard/KPICards';
import { OverviewTab } from '@/components/dashboard/tabs/OverviewTab';
import { HierarchyTab } from '@/components/dashboard/tabs/HierarchyTab';
import { SupervisorTab } from '@/components/dashboard/tabs/SupervisorTab';
import { DiversityTab } from '@/components/dashboard/tabs/DiversityTab';
import { EmployeeExplorerTab } from '@/components/dashboard/tabs/EmployeeExplorerTab';
import { ExcelDropzoneModal } from '@/components/upload/ExcelDropzoneModal';
import { ExcelUploadHero } from '@/components/upload/ExcelUploadHero';

const INITIAL_FILTERS: HRFilterState = {
  sheet: 'ALL',
  search: '',
  region: 'ALL',
  cluster: 'ALL',
  group: 'ALL',
  subGroup: 'ALL',
  grade: 'ALL',
  cadre: 'ALL',
  userStatus: 'ALL',
  gender: 'ALL',
  employmentCategory: 'ALL',
  branchCategory: 'ALL',
  nationality: 'ALL'
};

const TAB_CONFIGS: Record<string, { title: string; subtitle: string }> = {
  overview: {
    title: 'Executive Overview',
    subtitle: 'High-level workforce health, regional headcount strength, and onboarding velocity.'
  },
  hierarchy: {
    title: 'Organization & Cadres',
    subtitle: 'Hierarchical breakdown across job grades, staff cadres, and employment categories.'
  },
  supervisors: {
    title: 'Supervisor Span & Reporting Teams',
    subtitle: 'Executive supervisor directory, managerial span metrics, and direct reporting team rosters.'
  },
  diversity: {
    title: 'Demographics & Diversity (DEI)',
    subtitle: 'Gender balance across leadership tiers, generational age cohorts, and tenure retention.'
  },
  explorer: {
    title: 'Employee Directory',
    subtitle: 'Searchable employee master roster with full 29-attribute profile dossiers.'
  },
};

export default function DashboardPage() {
  const [sheetsData, setSheetsData] = useState<SheetCollection>({});
  const [fileName, setFileName] = useState<string>('');
  const [filters, setFilters] = useState<HRFilterState>(INITIAL_FILTERS);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [uploadModalOpen, setUploadModalOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch workforce data from SQLite database
  const fetchWorkforceData = useCallback(async (isInitial = false) => {
    try {
      const res = await fetch('/api/workforce');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data && json.data.totalCount > 0) {
          setSheetsData(json.data.sheets);
          setFileName(json.data.fileName);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch workforce data from SQLite:', e);
    } finally {
      if (isInitial) setIsLoading(false);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchWorkforceData(true);
  }, [fetchWorkforceData]);

  // Auto-sync when window regains focus (e.g. after editing & saving in Excel)
  useEffect(() => {
    const onFocus = () => {
      fetchWorkforceData(false);
    };
    window.addEventListener('focus', onFocus);
    const timer = setInterval(() => {
      fetchWorkforceData(false);
    }, 10000);

    return () => {
      window.removeEventListener('focus', onFocus);
      clearInterval(timer);
    };
  }, [fetchWorkforceData]);

  const hasData = Object.keys(sheetsData).length > 0;

  // Flattened records based on active sheet selection
  const currentSheetRecords = useMemo(() => {
    if (!hasData) return [];
    if (filters.sheet === 'ALL') {
      return Object.values(sheetsData).flat();
    }
    return sheetsData[filters.sheet] || [];
  }, [sheetsData, filters.sheet, hasData]);

  // Filtered records based on all active dropdowns
  const filteredRecords = useMemo(() => {
    if (!hasData) return [];
    return currentSheetRecords.filter((r) => {
      // Region
      if (filters.region !== 'ALL' && r.region !== filters.region) return false;

      // Cluster
      if (filters.cluster !== 'ALL' && r.cluster !== filters.cluster) return false;

      // Group
      if (filters.group !== 'ALL' && r.group !== filters.group) return false;

      // Sub Group
      if (filters.subGroup !== 'ALL' && r.subGroup !== filters.subGroup) return false;

      // Cadre
      if (filters.cadre !== 'ALL' && r.cadre !== filters.cadre) return false;

      // Grade
      if (filters.grade !== 'ALL' && r.grade !== filters.grade) return false;

      // User Status
      if (filters.userStatus !== 'ALL') {
        if (filters.userStatus === 'Active' && !(r.userStatus || '').toLowerCase().includes('active')) return false;
        if (filters.userStatus !== 'Active' && r.userStatus !== filters.userStatus) return false;
      }

      // Gender
      if (filters.gender !== 'ALL' && !(r.gender || '').toLowerCase().startsWith(filters.gender.toLowerCase().charAt(0))) {
        return false;
      }

      // Employment Category
      if (filters.employmentCategory !== 'ALL' && r.employmentCategory !== filters.employmentCategory) {
        return false;
      }

      // Nationality
      if (filters.nationality !== 'ALL' && r.nationality !== filters.nationality) {
        return false;
      }

      return true;
    });
  }, [currentSheetRecords, filters, hasData]);

  // Compute Memoized Metrics Summary
  const metricsSummary = useMemo(() => {
    return computeHRMetricsSummary(filteredRecords);
  }, [filteredRecords]);

  // Count active non-default filters
  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).filter(([key, val]) => {
      if (key === 'sheet') return false;
      if (key === 'search') return false;
      return val !== 'ALL';
    }).length;
  }, [filters]);

  // Handler when Excel file is parsed and saved to SQLite
  const handleDataLoaded = (newSheets: SheetCollection, newFileName: string) => {
    setSheetsData(newSheets);
    setFileName(newFileName);
    setFilters(INITIAL_FILTERS);
    setActiveTab('overview');
  };

  // Handler to clear/unload dataset from SQLite
  const handleClearData = async () => {
    try {
      await fetch('/api/workforce', { method: 'DELETE' });
      setSheetsData({});
      setFileName('');
      setFilters(INITIAL_FILTERS);
    } catch (err) {
      console.error('Error clearing data:', err);
    }
  };

  const handleFilterChange = (key: keyof HRFilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleResetFilters = () => {
    setFilters((prev) => ({
      ...INITIAL_FILTERS,
      sheet: prev.sheet
    }));
  };

  // While checking SQLite on initial mount
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="flex items-center gap-2.5 text-xs text-muted-foreground font-mono">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span>Connecting to SQLite database...</span>
        </div>
      </div>
    );
  }

  // If no file loaded yet, render dedicated upload screen
  if (!hasData) {
    return <ExcelUploadHero onDataLoaded={handleDataLoaded} />;
  }

  const currentTabConfig = TAB_CONFIGS[activeTab] || TAB_CONFIGS.overview;

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* 1. Left Sidebar (Responsive with Mobile Drawer) */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        sheetsData={sheetsData}
        activeSheet={filters.sheet}
        onSheetChange={(sheet) => handleFilterChange('sheet', sheet)}
        fileName={fileName}
        totalRecordsCount={Object.values(sheetsData).flat().length}
        onOpenUpload={() => setUploadModalOpen(true)}
        onClearData={handleClearData}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* 2. Main Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Navigation Bar */}
        <TopNav
          activeTabTitle={currentTabConfig.title}
          activeSheetName={filters.sheet}
          filteredCount={filteredRecords.length}
          totalCount={currentSheetRecords.length}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          activeFilterCount={activeFilterCount}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        {/* Global Filter Bar (Toggled by Filters button) */}
        {showFilters && (
          <GlobalFilterBar
            allRecords={currentSheetRecords}
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
          />
        )}

        {/* Main Content Area */}
        <main className="p-3.5 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 flex-1 max-w-7xl w-full">
          {/* Top Page Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1">
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                {currentTabConfig.title}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                {currentTabConfig.subtitle}
              </p>
            </div>
          </div>

          {/* Top 6 KPI Metric Cards */}
          <KPICards metrics={metricsSummary} />

          {/* Active Tab View */}
          <div className="pt-1 sm:pt-2">
            {activeTab === 'overview' && <OverviewTab records={filteredRecords} />}
            {activeTab === 'hierarchy' && <HierarchyTab records={filteredRecords} />}
            {activeTab === 'supervisors' && <SupervisorTab records={filteredRecords} />}
            {activeTab === 'diversity' && <DiversityTab records={filteredRecords} />}
            {activeTab === 'explorer' && (
              <EmployeeExplorerTab records={filteredRecords} activeSheetName={filters.sheet} />
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-3.5 px-4 sm:px-8 text-[11px] sm:text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-1.5 bg-sidebar mt-auto">
          <span>SEAP • Science And Engineering Associate Program</span>
          <span>SQLite Database: data/workforce.db • 29 Schema Attributes</span>
        </footer>
      </div>

      {/* Upload Dialog Modal */}
      <ExcelDropzoneModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onDataLoaded={handleDataLoaded}
      />
    </div>
  );
}
