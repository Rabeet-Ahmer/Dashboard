'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { EmployeeRecord } from '@/types/hr';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { ScrollableChartContainer } from '@/components/dashboard/ScrollableChartContainer';
import { EmployeeDetailModal } from '@/components/modals/EmployeeDetailModal';
import {
  getCadreDistribution,
  getGradeDistribution,
  getEmploymentTypeDistribution,
  getTopPositions,
  getSupervisorSpan
} from '@/lib/analytics';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Search, Users, X, Eye, ChevronRight, AlertTriangle } from 'lucide-react';

interface HierarchyTabProps {
  records: EmployeeRecord[];
}

const EMPL_COLORS: Record<string, string> = {
  Permanent: '#0284c7',
  Contractual: '#f59e0b',
  Probationary: '#818cf8',
  Intern: '#10b981',
  Temporary: '#64748b',
  'N/A': '#94a3b8'
};

const PIE_COLORS = ['#0284c7', '#0d9488', '#818cf8', '#f59e0b', '#fb7185', '#64748b'];

// Generate initials for avatar
function getInitials(name: string): string {
  if (!name || name === 'N/A' || name.toLowerCase() === 'unassigned') return '⚠️';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function HierarchyTab({ records }: HierarchyTabProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [searchSupervisor, setSearchSupervisor] = useState('');
  const [selectedSupervisor, setSelectedSupervisor] = useState<string | null>(null);
  const [teamSearch, setTeamSearch] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const cadreData = useMemo(() => getCadreDistribution(records), [records]);
  const gradeData = useMemo(() => getGradeDistribution(records), [records]);
  const emplData = useMemo(() => getEmploymentTypeDistribution(records), [records]);
  const topPositions = useMemo(() => getTopPositions(records, 15), [records]);
  const allSupervisors = useMemo(() => getSupervisorSpan(records), [records]);

  // Set default selected supervisor to the first one once loaded
  useEffect(() => {
    if (allSupervisors.length > 0 && !selectedSupervisor) {
      setSelectedSupervisor(allSupervisors[0].supervisor);
    }
  }, [allSupervisors, selectedSupervisor]);

  // Filter supervisors list by search query
  const filteredSupervisors = useMemo(() => {
    if (!searchSupervisor.trim()) return allSupervisors;
    const q = searchSupervisor.toLowerCase().trim();
    return allSupervisors.filter(s => s.supervisor.toLowerCase().includes(q));
  }, [allSupervisors, searchSupervisor]);

  // Get active supervisor data and their direct reports
  const activeSupervisorName = selectedSupervisor || (filteredSupervisors[0]?.supervisor ?? null);
  const isUnassigned = (activeSupervisorName || '').toLowerCase() === 'unassigned';

  const directReports = useMemo(() => {
    if (!activeSupervisorName) return [];
    if (activeSupervisorName.toLowerCase() === 'unassigned') {
      return records.filter(
        r => !r.supervisor || r.supervisor === 'N/A' || r.supervisor.trim() === '' || r.supervisor.trim().toLowerCase() === 'unassigned'
      );
    }
    return records.filter(r => (r.supervisor || '').trim().toLowerCase() === activeSupervisorName.trim().toLowerCase());
  }, [records, activeSupervisorName]);

  // Search filter inside the active supervisor's team
  const filteredDirectReports = useMemo(() => {
    if (!teamSearch.trim()) return directReports;
    const q = teamSearch.toLowerCase().trim();
    return directReports.filter(r =>
      (r.fullName || '').toLowerCase().includes(q) ||
      (r.employeeNumber || '').toLowerCase().includes(q) ||
      (r.positionName || '').toLowerCase().includes(q) ||
      (r.job || '').toLowerCase().includes(q) ||
      (r.grade || '').toLowerCase().includes(q) ||
      (r.branchCode || '').toLowerCase().includes(q) ||
      (r.region || '').toLowerCase().includes(q) ||
      (r.contact || '').toLowerCase().includes(q) ||
      (r.emailAddress || '').toLowerCase().includes(q)
    );
  }, [directReports, teamSearch]);

  // Find department or group for the active supervisor from reports
  const supervisorDepartment = useMemo(() => {
    if (isUnassigned) return 'Unassigned Hierarchy';
    if (!directReports.length) return 'General Operations';
    const groupCount: Record<string, number> = {};
    for (const r of directReports) {
      const g = r.group && r.group !== 'N/A' ? r.group : 'General';
      groupCount[g] = (groupCount[g] || 0) + 1;
    }
    const top = Object.entries(groupCount).sort((a, b) => b[1] - a[1])[0];
    return top ? top[0] : 'General Operations';
  }, [directReports, isUnassigned]);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Skeleton className="h-[280px] sm:h-[340px] rounded-lg" />
        <Skeleton className="h-[280px] sm:h-[340px] rounded-lg" />
        <Skeleton className="h-[200px] sm:h-[220px] rounded-lg lg:col-span-2" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Row 1: Cadre Breakdown & Grade Pyramid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* 1. Cadre & Gender Distribution */}
        <Card className="border border-border bg-card shadow-2xs">
          <CardHeader className="p-3.5 sm:p-4 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xs sm:text-sm font-semibold text-foreground">
                Cadre & Staff Level Distribution
              </CardTitle>
              <CardDescription className="text-[11px] sm:text-xs">
                Executive, Management, Officer, and Support staff
              </CardDescription>
            </div>
            <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground">
              CADRE
            </span>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 pt-3 sm:pt-4">
            <div className="h-[240px] sm:h-[280px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={cadreData} margin={{ top: 18, right: 15, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                  <XAxis dataKey="cadre" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '6px' }} />
                  <Bar dataKey="male" name="Male (♂)" fill="#0284c7" stackId="a">
                    <LabelList
                      dataKey="male"
                      position="center"
                      className="fill-white font-mono text-[8px] font-medium"
                      formatter={(val: unknown) => (typeof val === 'number' && val > 0 ? String(val) : '')}
                    />
                  </Bar>
                  <Bar dataKey="female" name="Female (♀)" fill="#fb7185" stackId="a" radius={[2, 2, 0, 0]}>
                    <LabelList
                      dataKey="female"
                      position="center"
                      className="fill-white font-mono text-[8px] font-medium"
                      formatter={(val: unknown) => (typeof val === 'number' && val > 0 ? String(val) : '')}
                    />
                    <LabelList
                      dataKey="count"
                      position="top"
                      offset={5}
                      className="fill-foreground font-mono text-[9px] font-bold"
                      formatter={(val: unknown) => (typeof val === 'number' && val > 0 ? String(val) : '')}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 2. Grade Distribution (Scrollable) */}
        <Card className="border border-border bg-card shadow-2xs">
          <CardHeader className="p-3.5 sm:p-4 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xs sm:text-sm font-semibold text-foreground">
                Job Grade Breakdown
              </CardTitle>
              <CardDescription className="text-[11px] sm:text-xs">
                Hierarchy and pay grade distribution ({gradeData.length} Grades)
              </CardDescription>
            </div>
            <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground">
              Grade
            </span>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 pt-3 sm:pt-4">
            <ScrollableChartContainer
              dataLength={gradeData.length}
              itemHeight={38}
              minHeight={260}
              maxViewportHeight={280}
              threshold={6}
              itemName="grades"
            >
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={gradeData} layout="vertical" margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="grade" tick={{ fontSize: 9 }} width={120} interval={0} />
                  <Tooltip />
                  <Bar dataKey="count" name="Employees" fill="#6366f1" radius={[0, 2, 2, 0]} maxBarSize={16}>
                    <LabelList
                      dataKey="count"
                      position="right"
                      offset={5}
                      className="fill-foreground font-mono text-[9px] font-bold"
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ScrollableChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Top Positions & Employment Type */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* 3. Top Positions (Scrollable) */}
        <Card className="border border-border bg-card shadow-2xs lg:col-span-2">
          <CardHeader className="p-3.5 sm:p-4 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xs sm:text-sm font-semibold text-foreground">
                Top Designations & Positions
              </CardTitle>
              <CardDescription className="text-[11px] sm:text-xs">
                Most populated roles across the organization
              </CardDescription>
            </div>
            <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground">
              Pos_name
            </span>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 pt-3 sm:pt-4">
            <ScrollableChartContainer
              dataLength={topPositions.length}
              itemHeight={36}
              minHeight={250}
              maxViewportHeight={270}
              threshold={6}
              itemName="positions"
            >
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={topPositions} layout="vertical" margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="position" tick={{ fontSize: 9 }} width={140} interval={0} />
                  <Tooltip />
                  <Bar dataKey="count" name="Staff Count" fill="#0d9488" radius={[0, 2, 2, 0]} maxBarSize={16}>
                    <LabelList
                      dataKey="count"
                      position="right"
                      offset={5}
                      className="fill-foreground font-mono text-[9px] font-bold"
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ScrollableChartContainer>
          </CardContent>
        </Card>

        {/* 4. Employment Type Donut */}
        <Card className="border border-border bg-card shadow-2xs">
          <CardHeader className="p-3.5 sm:p-4 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xs sm:text-sm font-semibold text-foreground">
                Employment Category
              </CardTitle>
              <CardDescription className="text-[11px] sm:text-xs">
                Permanent vs Contractual mix
              </CardDescription>
            </div>
            <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground">
              EMPLOYMENT_CATEGORY
            </span>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center">
            <div className="h-[170px] sm:h-[180px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie
                    data={emplData}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={2}
                  >
                    {emplData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={EMPL_COLORS[entry.type] || PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
              {emplData.map((item, idx) => (
                <div key={`empl-${item.type}-${idx}`} className="flex items-center gap-1 text-[11px] text-muted-foreground px-2 py-0.5 rounded bg-muted/60 border border-border">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{
                      backgroundColor: EMPL_COLORS[item.type] || PIE_COLORS[idx % PIE_COLORS.length]
                    }}
                  />
                  <span className="truncate">
                    {item.type}: <strong className="text-foreground font-mono">{item.count}</strong>
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Modern Master-Detail Supervisor Workspace (Clean & Eye-Friendly) */}
      <Card className="border border-border bg-card shadow-2xs overflow-hidden">
        <CardHeader className="p-3.5 sm:p-4 pb-3 border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-muted/10">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Users className="h-4 w-4 text-primary" />
                Supervisor Span & Reporting Teams
              </CardTitle>
              <Badge variant="secondary" className="text-[10px] font-normal text-muted-foreground">
                {allSupervisors.length} Supervisors
              </Badge>
            </div>
            <CardDescription className="text-[11px] sm:text-xs mt-0.5">
              Select any supervisor from the directory to inspect their direct reporting team roster
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border">
            {/* Left Column: Supervisor Directory List (4 cols) */}
            <div className="lg:col-span-4 p-3 sm:p-3.5 flex flex-col space-y-2.5 bg-muted/5">
              {/* Supervisor Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search supervisors..."
                  value={searchSupervisor}
                  onChange={(e) => setSearchSupervisor(e.target.value)}
                  className="pl-8 pr-7 h-8 text-xs bg-background"
                />
                {searchSupervisor && (
                  <button
                    onClick={() => setSearchSupervisor('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Scrollable Supervisor List */}
              <div className="h-[340px] sm:h-[380px] overflow-y-auto pr-1 space-y-1.5 scrollbar-thin">
                {filteredSupervisors.length === 0 ? (
                  <div className="py-12 text-center text-xs text-muted-foreground">
                    No supervisors matching &ldquo;{searchSupervisor}&rdquo;.
                  </div>
                ) : (
                  filteredSupervisors.map((sup, idx) => {
                    const isSelected = (activeSupervisorName || '').toLowerCase() === sup.supervisor.toLowerCase();
                    const supIsUnassigned = sup.supervisor.toLowerCase() === 'unassigned';
                    const initials = getInitials(sup.supervisor);

                    return (
                      <button
                        key={`sup-row-${sup.supervisor}-${idx}`}
                        onClick={() => {
                          setSelectedSupervisor(sup.supervisor);
                          setTeamSearch('');
                        }}
                        className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between gap-2.5 cursor-pointer ${
                          isSelected
                            ? supIsUnassigned
                              ? 'bg-amber-500/15 border-amber-500/60 text-foreground shadow-2xs'
                              : 'bg-primary/10 border-primary/60 text-foreground shadow-2xs'
                            : supIsUnassigned
                            ? 'bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/30 text-muted-foreground hover:text-foreground'
                            : 'bg-card hover:bg-muted/50 border-border/70 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                              supIsUnassigned
                                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 font-sans'
                                : isSelected
                                ? 'bg-primary text-primary-foreground font-mono'
                                : 'bg-muted text-muted-foreground font-mono'
                            }`}
                          >
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p
                              className={`text-xs font-medium truncate ${
                                isSelected
                                  ? supIsUnassigned
                                    ? 'text-amber-600 dark:text-amber-400 font-semibold'
                                    : 'text-primary font-semibold'
                                  : 'text-foreground'
                              }`}
                            >
                              {supIsUnassigned ? 'Unassigned Staff' : sup.supervisor}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {supIsUnassigned ? 'No Supervisor Assigned' : 'Team Manager'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge
                            variant={supIsUnassigned ? 'destructive' : isSelected ? 'default' : 'secondary'}
                            className={`font-mono text-[10px] px-1.5 py-0 h-5 ${
                              supIsUnassigned ? 'bg-amber-600 hover:bg-amber-600 text-white' : ''
                            }`}
                          >
                            {sup.directReports}
                          </Badge>
                          <ChevronRight
                            className={`h-3.5 w-3.5 ${
                              isSelected
                                ? supIsUnassigned
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-primary'
                                : 'text-muted-foreground/50'
                            }`}
                          />
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Column: Active Supervisor Team Roster (8 cols) */}
            <div className="lg:col-span-8 p-3 sm:p-4 flex flex-col space-y-3 bg-card min-w-0">
              {activeSupervisorName ? (
                <>
                  {/* Supervisor Header Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-9 w-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          isUnassigned
                            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                            : 'bg-primary/15 text-primary font-mono'
                        }`}
                      >
                        {getInitials(activeSupervisorName)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm sm:text-base font-bold text-foreground">
                            {isUnassigned ? 'Unassigned Personnel' : activeSupervisorName}
                          </h3>
                          <Badge
                            variant={isUnassigned ? 'destructive' : 'outline'}
                            className={`text-[10px] font-normal px-2 py-0 ${
                              isUnassigned ? 'bg-amber-600/90 text-white' : ''
                            }`}
                          >
                            {supervisorDepartment}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {isUnassigned ? (
                            <span>
                              Total Unassigned: <strong className="text-foreground font-mono">{directReports.length}</strong> employees
                            </span>
                          ) : (
                            <span>
                              Direct Span: <strong className="text-foreground font-mono">{directReports.length}</strong> employees reporting
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Team search input */}
                    <div className="relative w-full sm:w-56">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Filter staff by name, ID, role..."
                        value={teamSearch}
                        onChange={(e) => setTeamSearch(e.target.value)}
                        className="pl-8 pr-7 h-7 text-[11px] bg-background"
                      />
                      {teamSearch && (
                        <button
                          onClick={() => setTeamSearch('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* If unassigned, show tracking notice */}
                  {isUnassigned && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-md px-3 py-2 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                      <span>
                        <strong>Hierarchy Audit:</strong> These {directReports.length} staff members have no reporting supervisor listed. Use this table to track and identify employees needing assignment.
                      </span>
                    </div>
                  )}

                  {/* Team Members Roster Table */}
                  <div className="h-[290px] sm:h-[325px] overflow-auto border border-border rounded-lg scrollbar-thin">
                    <Table>
                      <TableHeader className="bg-muted/60 sticky top-0 z-10">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="text-[10px] font-semibold h-7 text-foreground">EMP #</TableHead>
                          <TableHead className="text-[10px] font-semibold h-7 text-foreground">STAFF MEMBER</TableHead>
                          <TableHead className="text-[10px] font-semibold h-7 text-foreground">DESIGNATION</TableHead>
                          <TableHead className="text-[10px] font-semibold h-7 text-foreground">GRADE</TableHead>
                          <TableHead className="text-[10px] font-semibold h-7 text-foreground">LOCATION</TableHead>
                          <TableHead className="text-[10px] font-semibold h-7 text-foreground">CONTACT</TableHead>
                          <TableHead className="text-[10px] font-semibold h-7 text-foreground">STATUS</TableHead>
                          <TableHead className="text-[10px] font-semibold h-7 text-right text-foreground">ACTION</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredDirectReports.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-12 text-xs text-muted-foreground">
                              No staff members match this filter.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredDirectReports.map((emp, i) => (
                            <TableRow
                              key={`dr-${emp.employeeNumber}-${i}`}
                              onClick={() => {
                                setSelectedEmployee(emp);
                                setModalOpen(true);
                              }}
                              className="cursor-pointer hover:bg-muted/40 transition-colors text-xs"
                            >
                              <TableCell className="font-mono font-medium text-[11px] text-foreground">
                                {emp.employeeNumber}
                              </TableCell>
                              <TableCell className="font-medium text-foreground whitespace-nowrap">
                                {emp.title ? `${emp.title} ` : ''}{emp.fullName}
                              </TableCell>
                              <TableCell className="text-muted-foreground truncate max-w-[140px]">
                                {emp.positionName !== 'N/A' ? emp.positionName : emp.job}
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="text-[9px] font-mono font-medium px-1.5 py-0">
                                  {emp.grade}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground font-mono text-[10px] whitespace-nowrap">
                                {emp.branchCode} <span className="text-[9px] text-muted-foreground/70">({emp.region})</span>
                              </TableCell>
                              <TableCell className="font-mono text-[10px] text-foreground whitespace-nowrap">
                                {emp.contact !== 'N/A' ? emp.contact : (emp.emailAddress !== 'N/A' ? emp.emailAddress : 'N/A')}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={(emp.userStatus || '').toLowerCase().includes('active') ? 'default' : 'secondary'}
                                  className="text-[9px] px-1.5 py-0"
                                >
                                  {emp.userStatus}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-[10px] px-2 text-primary hover:text-primary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedEmployee(emp);
                                    setModalOpen(true);
                                  }}
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                  Select a supervisor from the left directory to view their reporting team.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Full Employee Dossier Modal */}
      <EmployeeDetailModal
        employee={selectedEmployee}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
