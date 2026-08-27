'use client';

import React, { useState, useMemo } from 'react';
import { EmployeeRecord } from '@/types/hr';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EmployeeDetailModal } from '@/components/modals/EmployeeDetailModal';
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  FileSpreadsheet,
  Download,
  Eye,
  Copy,
  Check,
  Search,
  X,
  Users
} from 'lucide-react';
import { exportRecordsToExcel, exportRecordsToCSV } from '@/lib/excel-parser';

interface EmployeeExplorerTabProps {
  records: EmployeeRecord[];
  activeSheetName: string;
}

type SortField = 'fullName' | 'employeeNumber' | 'userStatus' | 'group' | 'grade' | 'region' | 'branchCode' | 'tenureYears' | 'age';
type SortOrder = 'asc' | 'desc';

export function EmployeeExplorerTab({ records, activeSheetName }: EmployeeExplorerTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [sortField, setSortField] = useState<SortField>('fullName');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter by local search query
  const searchedRecords = useMemo(() => {
    if (!searchQuery.trim()) return records;
    const query = searchQuery.toLowerCase().trim();
    return records.filter((r) => {
      const matchesName = (r.fullName || '').toLowerCase().includes(query);
      const matchesId = (r.employeeNumber || '').toLowerCase().includes(query);
      const matchesPos = (r.positionName || '').toLowerCase().includes(query) || (r.job || '').toLowerCase().includes(query);
      const matchesBranch = (r.branchCode || '').toLowerCase().includes(query);
      const matchesEmail = (r.emailAddress || '').toLowerCase().includes(query);
      const matchesGroup = (r.group || '').toLowerCase().includes(query);
      const matchesRegion = (r.region || '').toLowerCase().includes(query);
      return matchesName || matchesId || matchesPos || matchesBranch || matchesEmail || matchesGroup || matchesRegion;
    });
  }, [records, searchQuery]);

  // Sorting
  const sortedRecords = useMemo(() => {
    return [...searchedRecords].sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = (valB || '').toLowerCase();
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      valA = valA || 0;
      valB = valB || 0;
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });
  }, [searchedRecords, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedRecords.length / pageSize));
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRecords.slice(start, start + pageSize);
  }, [sortedRecords, currentPage, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleRowClick = (emp: EmployeeRecord) => {
    setSelectedEmployee(emp);
    setModalOpen(true);
  };

  const handleCopyId = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="space-y-4">
      <Card className="border border-border bg-card shadow-2xs">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-border/40">
          <div>
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>Employee Directory & Roster</span>
              <Badge variant="secondary" className="text-xs font-mono font-normal">
                {searchedRecords.length} of {records.length} Records
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Search, sort, and click any employee row to open their full 28-field profile dossier
            </CardDescription>
          </div>

          {/* Directory Search & Export Actions */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name, ID, role, branch..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 pr-8 h-9 text-xs bg-muted/40 border-border rounded-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => exportRecordsToExcel(searchedRecords, `HR_Explorer_${activeSheetName}.xlsx`)}
              className="h-9 text-xs gap-1.5 rounded-lg"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Export Excel</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportRecordsToCSV(searchedRecords, `HR_Explorer_${activeSheetName}.csv`)}
              className="h-9 text-xs gap-1.5 rounded-lg"
            >
              <Download className="h-3.5 w-3.5 text-blue-600" />
              <span className="hidden sm:inline">Export CSV</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30 border-b border-border">
                <TableRow className="text-xs hover:bg-transparent">
                  <TableHead className="w-[120px] cursor-pointer font-semibold" onClick={() => handleSort('employeeNumber')}>
                    <div className="flex items-center gap-1.5">
                      <span>EMP ID</span>
                      <ArrowUpDown className="h-3 w-3 opacity-50" />
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[190px] cursor-pointer font-semibold" onClick={() => handleSort('fullName')}>
                    <div className="flex items-center gap-1.5">
                      <span>Full Name</span>
                      <ArrowUpDown className="h-3 w-3 opacity-50" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer font-semibold" onClick={() => handleSort('userStatus')}>
                    <div className="flex items-center gap-1.5">
                      <span>Status</span>
                      <ArrowUpDown className="h-3 w-3 opacity-50" />
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[150px] cursor-pointer font-semibold" onClick={() => handleSort('group')}>
                    <div className="flex items-center gap-1.5">
                      <span>Business Group</span>
                      <ArrowUpDown className="h-3 w-3 opacity-50" />
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[140px] cursor-pointer font-semibold" onClick={() => handleSort('grade')}>
                    <div className="flex items-center gap-1.5">
                      <span>Grade / Cadre</span>
                      <ArrowUpDown className="h-3 w-3 opacity-50" />
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[140px] cursor-pointer font-semibold" onClick={() => handleSort('region')}>
                    <div className="flex items-center gap-1.5">
                      <span>Region / Branch</span>
                      <ArrowUpDown className="h-3 w-3 opacity-50" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer text-right font-semibold" onClick={() => handleSort('tenureYears')}>
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Tenure</span>
                      <ArrowUpDown className="h-3 w-3 opacity-50" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer text-right font-semibold" onClick={() => handleSort('age')}>
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Age</span>
                      <ArrowUpDown className="h-3 w-3 opacity-50" />
                    </div>
                  </TableHead>
                  <TableHead className="w-[60px] text-center font-semibold">View</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-36 text-center text-xs text-muted-foreground">
                      No matching employee records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRecords.map((emp) => {
                    const isActive = (emp.userStatus || '').toLowerCase().includes('active');

                    return (
                      <TableRow
                        key={emp.employeeNumber}
                        onClick={() => handleRowClick(emp)}
                        className="cursor-pointer hover:bg-muted/40 text-xs transition-colors group/row"
                      >
                        <TableCell className="font-mono font-medium text-foreground">
                          <button
                            onClick={(e) => handleCopyId(e, emp.employeeNumber)}
                            className="flex items-center gap-1 text-[11px] hover:underline cursor-pointer"
                            title="Copy ID"
                          >
                            <span>{emp.employeeNumber}</span>
                            {copiedId === emp.employeeNumber ? (
                              <Check className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <Copy className="h-2.5 w-2.5 opacity-0 group-hover/row:opacity-60" />
                            )}
                          </button>
                        </TableCell>
                        <TableCell>
                          <div>
                            <span className="font-semibold text-foreground block">{emp.fullName}</span>
                            <span className="text-[11px] text-muted-foreground truncate block max-w-[180px]">
                              {emp.positionName || emp.job}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0 font-medium ${
                              isActive
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                            }`}
                          >
                            {emp.userStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-foreground block truncate max-w-[150px]">
                            {emp.group}
                          </span>
                          <span className="text-[11px] text-muted-foreground block truncate max-w-[150px]">
                            {emp.subGroup}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-foreground block">{emp.grade}</span>
                          <span className="text-[11px] text-muted-foreground block">{emp.cadre}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-foreground block">{emp.region}</span>
                          <span className="text-[11px] font-mono text-muted-foreground block">
                            {emp.branchCode} ({emp.cluster})
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium text-foreground">
                          {emp.tenureYears} yrs
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium text-foreground">
                          {emp.age} yrs
                        </TableCell>
                        <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => handleRowClick(emp)}
                            title="View Full Profile"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-border text-xs text-muted-foreground bg-muted/20">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <Select
                value={String(pageSize)}
                onValueChange={(val) => {
                  if (val) {
                    setPageSize(Number(val));
                    setCurrentPage(1);
                  }
                }}
              >
                <SelectTrigger className="h-7 w-16 text-xs bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span>
                Page <strong className="font-semibold text-foreground">{currentPage}</strong> of {totalPages}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2.5 text-xs"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2.5 text-xs"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee Full Dossier Modal */}
      <EmployeeDetailModal
        employee={selectedEmployee}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
