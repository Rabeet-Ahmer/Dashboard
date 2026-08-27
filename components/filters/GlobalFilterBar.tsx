'use client';

import React from 'react';
import { HRFilterState, EmployeeRecord } from '@/types/hr';
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
  RotateCcw,
  X,
  Filter
} from 'lucide-react';

interface GlobalFilterBarProps {
  allRecords: EmployeeRecord[];
  filters: HRFilterState;
  onFilterChange: (key: keyof HRFilterState, value: string) => void;
  onResetFilters: () => void;
}

export function GlobalFilterBar({
  allRecords,
  filters,
  onFilterChange,
  onResetFilters,
}: GlobalFilterBarProps) {
  // Compute dynamic unique option sets
  const uniqueRegions = React.useMemo(() => {
    const set = new Set<string>();
    allRecords.forEach((r) => {
      if (r.region) set.add(r.region);
    });
    return Array.from(set).sort();
  }, [allRecords]);

  const uniqueClusters = React.useMemo(() => {
    const set = new Set<string>();
    allRecords.forEach((r) => {
      if (filters.region === 'ALL' || r.region === filters.region) {
        if (r.cluster) set.add(r.cluster);
      }
    });
    return Array.from(set).sort();
  }, [allRecords, filters.region]);

  const uniqueGroups = React.useMemo(() => {
    const set = new Set<string>();
    allRecords.forEach((r) => {
      if (r.group) set.add(r.group);
    });
    return Array.from(set).sort();
  }, [allRecords]);

  const uniqueSubGroups = React.useMemo(() => {
    const set = new Set<string>();
    allRecords.forEach((r) => {
      if (filters.group === 'ALL' || r.group === filters.group) {
        if (r.subGroup) set.add(r.subGroup);
      }
    });
    return Array.from(set).sort();
  }, [allRecords, filters.group]);

  const uniqueCadres = React.useMemo(() => {
    const set = new Set<string>();
    allRecords.forEach((r) => {
      if (r.cadre) set.add(r.cadre);
    });
    return Array.from(set).sort();
  }, [allRecords]);

  const uniqueStatuses = React.useMemo(() => {
    const set = new Set<string>();
    allRecords.forEach((r) => {
      if (r.userStatus) set.add(r.userStatus);
    });
    return Array.from(set).sort();
  }, [allRecords]);

  // Active filter tags for quick dismissal
  const activeFilterTags = React.useMemo(() => {
    const tags: { key: keyof HRFilterState; label: string; value: string }[] = [];
    if (filters.region !== 'ALL') tags.push({ key: 'region', label: 'Region', value: filters.region });
    if (filters.cluster !== 'ALL') tags.push({ key: 'cluster', label: 'Cluster', value: filters.cluster });
    if (filters.group !== 'ALL') tags.push({ key: 'group', label: 'Group', value: filters.group });
    if (filters.subGroup !== 'ALL') tags.push({ key: 'subGroup', label: 'Dept', value: filters.subGroup });
    if (filters.cadre !== 'ALL') tags.push({ key: 'cadre', label: 'Cadre', value: filters.cadre });
    if (filters.userStatus !== 'ALL') tags.push({ key: 'userStatus', label: 'Status', value: filters.userStatus });
    if (filters.gender !== 'ALL') tags.push({ key: 'gender', label: 'Gender', value: filters.gender });
    return tags;
  }, [filters]);

  return (
    <div className="border-b border-border bg-card/60 px-4 sm:px-6 lg:px-8 py-3.5 space-y-3 transition-all">
      {/* Header of filter panel */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <Filter className="h-3.5 w-3.5 text-primary" />
          <span>Filter Parameters</span>
        </div>
        {activeFilterTags.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground gap-1.5"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset all</span>
          </Button>
        )}
      </div>

      {/* Select Controls Grid (Responsive 1 -> 2 -> 4 -> 7 cols) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3">
        {/* Region */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground block">
            Region
          </label>
          <Select
            value={filters.region}
            onValueChange={(val) => {
              if (val) {
                onFilterChange('region', val);
                onFilterChange('cluster', 'ALL');
              }
            }}
          >
            <SelectTrigger className="h-8.5 text-xs bg-background border-border rounded-lg w-full">
              <SelectValue placeholder="All Regions" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="ALL">All Regions</SelectItem>
              {uniqueRegions.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Cluster */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground block">
            Cluster
          </label>
          <Select
            value={filters.cluster}
            onValueChange={(val) => {
              if (val) onFilterChange('cluster', val);
            }}
            disabled={uniqueClusters.length === 0}
          >
            <SelectTrigger className="h-8.5 text-xs bg-background border-border rounded-lg w-full">
              <SelectValue placeholder="All Clusters" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="ALL">All Clusters</SelectItem>
              {uniqueClusters.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Business Group */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground block">
            Business Group
          </label>
          <Select
            value={filters.group}
            onValueChange={(val) => {
              if (val) {
                onFilterChange('group', val);
                onFilterChange('subGroup', 'ALL');
              }
            }}
          >
            <SelectTrigger className="h-8.5 text-xs bg-background border-border rounded-lg w-full">
              <SelectValue placeholder="All Groups" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="ALL">All Groups</SelectItem>
              {uniqueGroups.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sub-Group / Dept */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground block">
            Department
          </label>
          <Select
            value={filters.subGroup}
            onValueChange={(val) => {
              if (val) onFilterChange('subGroup', val);
            }}
            disabled={uniqueSubGroups.length === 0}
          >
            <SelectTrigger className="h-8.5 text-xs bg-background border-border rounded-lg w-full">
              <SelectValue placeholder="All Sub-Groups" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="ALL">All Sub-Groups</SelectItem>
              {uniqueSubGroups.map((sg) => (
                <SelectItem key={sg} value={sg}>
                  {sg}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Cadre */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground block">
            Cadre
          </label>
          <Select
            value={filters.cadre}
            onValueChange={(val) => {
              if (val) onFilterChange('cadre', val);
            }}
          >
            <SelectTrigger className="h-8.5 text-xs bg-background border-border rounded-lg w-full">
              <SelectValue placeholder="All Cadres" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="ALL">All Cadres</SelectItem>
              {uniqueCadres.map((cadre) => (
                <SelectItem key={cadre} value={cadre}>
                  {cadre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* User Status */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground block">
            Status
          </label>
          <Select
            value={filters.userStatus}
            onValueChange={(val) => {
              if (val) onFilterChange('userStatus', val);
            }}
          >
            <SelectTrigger className="h-8.5 text-xs bg-background border-border rounded-lg w-full">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="ALL">All Statuses</SelectItem>
              {uniqueStatuses.map((st) => (
                <SelectItem key={st} value={st}>
                  {st}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Gender */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground block">
            Gender
          </label>
          <Select
            value={filters.gender}
            onValueChange={(val) => {
              if (val) onFilterChange('gender', val);
            }}
          >
            <SelectTrigger className="h-8.5 text-xs bg-background border-border rounded-lg w-full">
              <SelectValue placeholder="All Genders" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="ALL">All Genders</SelectItem>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFilterTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-border/50">
          <span className="text-[11px] font-medium text-muted-foreground mr-1">
            Active:
          </span>
          {activeFilterTags.map((tag) => (
            <Badge
              key={tag.key}
              variant="secondary"
              className="text-xs font-normal pl-2 pr-1.5 py-0.5 gap-1 bg-background border border-border cursor-pointer hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors rounded-md"
              onClick={() => onFilterChange(tag.key, 'ALL')}
            >
              <span>{tag.label}: <strong className="font-medium text-foreground">{tag.value}</strong></span>
              <X className="h-3 w-3 opacity-60" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
