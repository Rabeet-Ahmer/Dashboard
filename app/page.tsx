'use client';

import React, { useState, useMemo } from 'react';
import { SheetCollection, HRFilterState } from '@/types/hr';
import { computeHRMetricsSummary } from '@/lib/analytics';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopNav } from '@/components/layout/TopNav';
import { GlobalFilterBar } from '@/components/filters/GlobalFilterBar';
import { KPICards } from '@/components/dashboard/KPICards';
import { OverviewTab } from '@/components/dashboard/tabs/OverviewTab';
import { HierarchyTab } from '@/components/dashboard/tabs/HierarchyTab';
import { GeographicTab } from '@/components/dashboard/tabs/GeographicTab';
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
  employmentType: 'ALL',
  branchCategory: 'ALL'
};

const TAB_TITLES: Record<string, string> = {
  overview: 'Executive Overview',
  hierarchy: 'Organization & Cadres',
  geographic: 'Geography & Branches',
  diversity: 'Demographics (DEI)',
  explorer: 'Employee Directory',
};

export default function DashboardPage() {
  const [sheetsData, setSheetsData] = useState<SheetCollection>({});
  const [fileName, setFileName] = useState<string>('');
  const [filters, setFilters] = useState<HRFilterState>(INITIAL_FILTERS);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showFilters, setShowFilters] = useState<boolean>(true);
  const [uploadModalOpen, setUploadModalOpen] = useState<boolean>(false);

  const hasData = Object.keys(sheetsData).length > 0;

  // Flattened records based on active sheet selection
  const currentSheetRecords = useMemo(() => {
    if (!hasData) return [];
    if (filters.sheet === 'ALL') {
      return Object.values(sheetsData).flat();
    }
    return sheetsData[filters.sheet] || [];
  }, [sheetsData, filters.sheet, hasData]);

  // Filtered records based on all active dropdowns & search query
  const filteredRecords = useMemo(() => {
    if (!hasData) return [];
    return currentSheetRecords.filter((r) => {
      // Search
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase().trim();
        const matchesName = (r.fullName || '').toLowerCase().includes(query);
        const matchesId = (r.employeeNumber || '').toLowerCase().includes(query);
        const matchesPos = (r.positionName || '').toLowerCase().includes(query) || (r.job || '').toLowerCase().includes(query);
        const matchesBranch = (r.branchCode || '').toLowerCase().includes(query);
        const matchesEmail = (r.emailAddress || '').toLowerCase().includes(query);
        const matchesGroup = (r.group || '').toLowerCase().includes(query);

        if (!matchesName && !matchesId && !matchesPos && !matchesBranch && !matchesEmail && !matchesGroup) {
          return false;
        }
      }

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

  // Handler when Excel file is parsed
  const handleDataLoaded = (newSheets: SheetCollection, newFileName: string) => {
    setSheetsData(newSheets);
    setFileName(newFileName);
    setFilters(INITIAL_FILTERS);
    setActiveTab('overview');
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
      sheet: prev.sheet,
      search: prev.search
    }));
  };

  // If no file loaded yet, render dedicated upload screen
  if (!hasData) {
    return <ExcelUploadHero onDataLoaded={handleDataLoaded} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* 1. Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        sheetsData={sheetsData}
        activeSheet={filters.sheet}
        onSheetChange={(sheet) => handleFilterChange('sheet', sheet)}
        fileName={fileName}
        totalRecordsCount={Object.values(sheetsData).flat().length}
        onOpenUpload={() => setUploadModalOpen(true)}
      />

      {/* 2. Main Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Bar */}
        <TopNav
          activeTabTitle={TAB_TITLES[activeTab] || 'Overview'}
          activeSheetName={filters.sheet}
          filteredCount={filteredRecords.length}
          totalCount={currentSheetRecords.length}
          filteredRecords={filteredRecords}
          searchQuery={filters.search}
          onSearchChange={(query) => handleFilterChange('search', query)}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          activeFilterCount={activeFilterCount}
        />

        {/* Global Filter Bar (Collapsible) */}
        {showFilters && (
          <GlobalFilterBar
            allRecords={currentSheetRecords}
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
          />
        )}

        {/* Main Body */}
        <main className="p-6 space-y-6 flex-1 max-w-7xl w-full">
          {/* Top 6 KPI Metric Cards */}
          <KPICards metrics={metricsSummary} />

          {/* Active Tab View */}
          <div className="pt-2">
            {activeTab === 'overview' && <OverviewTab records={filteredRecords} />}
            {activeTab === 'hierarchy' && <HierarchyTab records={filteredRecords} />}
            {activeTab === 'geographic' && <GeographicTab records={filteredRecords} />}
            {activeTab === 'diversity' && <DiversityTab records={filteredRecords} />}
            {activeTab === 'explorer' && (
              <EmployeeExplorerTab records={filteredRecords} activeSheetName={filters.sheet} />
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-4 px-6 text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-2 bg-sidebar mt-auto">
          <span>Apex HR Analytics • Enterprise Workforce Intelligence</span>
          <span>Zero-Database Client-Side Parsing • 28 Schema Attributes</span>
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
