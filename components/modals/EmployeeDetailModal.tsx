'use client';

import React, { useState } from 'react';
import { EmployeeRecord } from '@/types/hr';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Briefcase,
  MapPin,
  ShieldCheck,
  Copy,
  Check
} from 'lucide-react';

interface EmployeeDetailModalProps {
  employee: EmployeeRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmployeeDetailModal({
  employee,
  open,
  onOpenChange
}: EmployeeDetailModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!employee) return null;

  const isActive = (employee.userStatus || '').toLowerCase().includes('active');

  const handleCopy = (field: string, text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-xl sm:rounded-2xl">
        <DialogHeader className="pb-3 border-b border-border text-left">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 pr-6 sm:pr-0">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
                  {employee.fullName}
                </DialogTitle>
                <Badge
                  variant="outline"
                  className={`text-[10px] sm:text-xs px-2 py-0 font-medium ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                  }`}
                >
                  {employee.userStatus}
                </Badge>
              </div>
              <DialogDescription className="text-xs flex flex-wrap items-center gap-1.5 mt-1">
                <span className="font-mono font-semibold text-foreground">
                  {employee.employeeNumber}
                </span>
                <span>•</span>
                <span>{employee.positionName}</span>
                <span>•</span>
                <span className="truncate">{employee.group}</span>
              </DialogDescription>
            </div>

            {employee.sheetOrigin && (
              <Badge variant="secondary" className="text-[10px] font-mono self-start sm:self-auto">
                {employee.sheetOrigin}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 py-2 text-xs">
          {/* Grid of 4 Sections */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Section 1: Personal & Demographics */}
            <div className="border border-border rounded-lg p-3 sm:p-3.5 bg-muted/20 space-y-2">
              <h4 className="font-semibold text-foreground flex items-center gap-1.5 text-xs">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                Personal Demographics
              </h4>
              <Separator />
              <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground/70 block">Father Name</span>
                  <span className="font-medium text-foreground truncate block">{employee.fatherName || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground/70 block">Gender</span>
                  <span className="font-medium text-foreground">{employee.gender}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground/70 block">Date of Birth</span>
                  <span className="font-mono font-medium text-foreground">{employee.dateOfBirth}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground/70 block">Age</span>
                  <span className="font-medium text-foreground">{employee.age} Yrs</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground/70 block">Marital Status</span>
                  <span className="font-medium text-foreground">{employee.maritalStatus || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground/70 block">Religion</span>
                  <span className="font-medium text-foreground">{employee.religion || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Section 2: Organization & Hierarchy */}
            <div className="border border-border rounded-lg p-3 sm:p-3.5 bg-muted/20 space-y-2">
              <h4 className="font-semibold text-foreground flex items-center gap-1.5 text-xs">
                <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                Organization & Cadre
              </h4>
              <Separator />
              <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground/70 block">Business Group</span>
                  <span className="font-medium text-foreground truncate block">{employee.group}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground/70 block">Department</span>
                  <span className="font-medium text-foreground truncate block">{employee.subGroup}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground/70 block">Cadre</span>
                  <span className="font-medium text-foreground">{employee.cadre}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground/70 block">Job Grade</span>
                  <span className="font-medium text-foreground">{employee.grade}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground/70 block">Job Role</span>
                  <span className="font-medium text-foreground truncate block">{employee.job}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground/70 block">Employment</span>
                  <span className="font-medium text-foreground">{employee.employmentType}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] uppercase text-muted-foreground/70 block">Supervisor</span>
                  <span className="font-medium text-foreground truncate block">{employee.supervisor || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Section 3: Branch & Geography */}
            <div className="border border-border rounded-lg p-3 sm:p-3.5 bg-muted/20 space-y-2">
              <h4 className="font-semibold text-foreground flex items-center gap-1.5 text-xs">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                Branch & Geography
              </h4>
              <Separator />
              <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground/70 block">Branch Code</span>
                  <span className="font-mono font-semibold text-foreground">{employee.branchCode}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground/70 block">Location Code</span>
                  <span className="font-mono font-semibold text-foreground">{employee.locationCode}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground/70 block">Region</span>
                  <span className="font-medium text-foreground">{employee.region}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground/70 block">Cluster</span>
                  <span className="font-medium text-foreground">{employee.cluster}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground/70 block">Category</span>
                  <span className="font-medium text-foreground truncate block">{employee.branchCategory}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground/70 block">Flagship</span>
                  <span className="font-medium text-foreground">{employee.flagship}</span>
                </div>
              </div>
            </div>

            {/* Section 4: Tenure, Identity & Contacts */}
            <div className="border border-border rounded-lg p-3 sm:p-3.5 bg-muted/20 space-y-2">
              <h4 className="font-semibold text-foreground flex items-center gap-1.5 text-xs">
                <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                Tenure & Identity
              </h4>
              <Separator />
              <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground/70 block">Hire Date</span>
                  <span className="font-mono font-medium text-foreground">{employee.hireDate}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground/70 block">Tenure</span>
                  <span className="font-medium text-foreground">{employee.tenureYears} Yrs</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] uppercase text-muted-foreground/70 block">National ID</span>
                  <span className="font-mono font-medium text-foreground block truncate">{employee.nationalIdentity || 'N/A'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] uppercase text-muted-foreground/70 block">Work Email</span>
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono font-medium text-foreground truncate block">
                      {employee.emailAddress || 'N/A'}
                    </span>
                    {employee.emailAddress && (
                      <button
                        onClick={() => handleCopy('email', employee.emailAddress)}
                        className="text-muted-foreground hover:text-foreground p-1 shrink-0"
                        title="Copy Email"
                      >
                        {copiedField === 'email' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                      </button>
                    )}
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] uppercase text-muted-foreground/70 block">Contact</span>
                  <span className="font-mono font-medium text-foreground">{employee.contactId || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
