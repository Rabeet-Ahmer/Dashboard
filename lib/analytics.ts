import { EmployeeRecord, HRMetricsSummary } from '@/types/hr';

export function computeHRMetricsSummary(records: EmployeeRecord[]): HRMetricsSummary {
  const total = records.length;
  if (total === 0) {
    return {
      totalHeadcount: 0,
      activeCount: 0,
      inactiveCount: 0,
      activeRatio: 0,
      avgTenureYears: 0,
      avgAge: 0,
      genderRatio: { male: 0, female: 0, other: 0, malePercent: 0, femalePercent: 0 },
      uniqueBranchesCount: 0,
      uniqueRegionsCount: 0,
      uniqueClustersCount: 0,
      uniqueGroupsCount: 0
    };
  }

  let activeCount = 0;
  let totalTenure = 0;
  let totalAge = 0;
  let maleCount = 0;
  let femaleCount = 0;
  let otherCount = 0;

  const branches = new Set<string>();
  const regions = new Set<string>();
  const clusters = new Set<string>();
  const groups = new Set<string>();

  for (const r of records) {
    const isAct = r.userStatus.toLowerCase().includes('active');
    if (isAct) activeCount++;

    totalTenure += r.tenureYears || 0;
    totalAge += r.age || 0;

    const g = (r.gender || '').toLowerCase();
    if (g.startsWith('m')) maleCount++;
    else if (g.startsWith('f')) femaleCount++;
    else otherCount++;

    if (r.branchCode) branches.add(r.branchCode);
    if (r.region) regions.add(r.region);
    if (r.cluster) clusters.add(r.cluster);
    if (r.group) groups.add(r.group);
  }

  return {
    totalHeadcount: total,
    activeCount,
    inactiveCount: total - activeCount,
    activeRatio: parseFloat(((activeCount / total) * 100).toFixed(1)),
    avgTenureYears: parseFloat((totalTenure / total).toFixed(1)),
    avgAge: parseFloat((totalAge / total).toFixed(1)),
    genderRatio: {
      male: maleCount,
      female: femaleCount,
      other: otherCount,
      malePercent: parseFloat(((maleCount / total) * 100).toFixed(1)),
      femalePercent: parseFloat(((femaleCount / total) * 100).toFixed(1))
    },
    uniqueBranchesCount: branches.size,
    uniqueRegionsCount: regions.size,
    uniqueClustersCount: clusters.size,
    uniqueGroupsCount: groups.size
  };
}

export function getRegionalDistribution(records: EmployeeRecord[]) {
  const map: Record<string, { region: string; count: number; active: number; female: number }> = {};

  for (const r of records) {
    const region = r.region || 'Unassigned';
    if (!map[region]) {
      map[region] = { region, count: 0, active: 0, female: 0 };
    }
    map[region].count++;
    if (r.userStatus.toLowerCase().includes('active')) map[region].active++;
    if (r.gender.toLowerCase().startsWith('f')) map[region].female++;
  }

  return Object.values(map).sort((a, b) => b.count - a.count);
}

export function getGroupDistribution(records: EmployeeRecord[]) {
  const map: Record<string, { group: string; count: number; active: number }> = {};

  for (const r of records) {
    const g = r.group || 'Unassigned';
    if (!map[g]) map[g] = { group: g, count: 0, active: 0 };
    map[g].count++;
    if (r.userStatus.toLowerCase().includes('active')) map[g].active++;
  }

  return Object.values(map).sort((a, b) => b.count - a.count);
}

export function getSubGroupDistribution(records: EmployeeRecord[], selectedGroup?: string) {
  const map: Record<string, { subGroup: string; group: string; count: number }> = {};

  for (const r of records) {
    if (selectedGroup && selectedGroup !== 'ALL' && r.group !== selectedGroup) continue;
    const sg = r.subGroup || 'General';
    if (!map[sg]) map[sg] = { subGroup: sg, group: r.group, count: 0 };
    map[sg].count++;
  }

  return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 10);
}

export function getHiringTimeline(records: EmployeeRecord[]) {
  const map: Record<string, { year: string; hires: number; activeHires: number }> = {};

  for (const r of records) {
    const yr = r.hireYear || 'Unknown';
    if (yr === 'N/A' || yr === 'Unknown' || parseInt(yr) < 2000) continue;
    if (!map[yr]) map[yr] = { year: yr, hires: 0, activeHires: 0 };
    map[yr].hires++;
    if (r.userStatus.toLowerCase().includes('active')) map[yr].activeHires++;
  }

  return Object.values(map).sort((a, b) => a.year.localeCompare(b.year));
}

export function getUserStatusDistribution(records: EmployeeRecord[]) {
  const map: Record<string, { status: string; count: number }> = {};

  for (const r of records) {
    const st = r.userStatus || 'Unknown';
    if (!map[st]) map[st] = { status: st, count: 0 };
    map[st].count++;
  }

  return Object.values(map).sort((a, b) => b.count - a.count);
}

export function getCadreDistribution(records: EmployeeRecord[]) {
  const map: Record<string, { cadre: string; count: number; female: number; male: number }> = {};

  for (const r of records) {
    const c = r.cadre || 'Unassigned';
    if (!map[c]) map[c] = { cadre: c, count: 0, female: 0, male: 0 };
    map[c].count++;
    if (r.gender.toLowerCase().startsWith('f')) map[c].female++;
    else map[c].male++;
  }

  return Object.values(map).sort((a, b) => b.count - a.count);
}

export function getGradeDistribution(records: EmployeeRecord[]) {
  const map: Record<string, { grade: string; count: number; cadre: string }> = {};

  for (const r of records) {
    const g = r.grade || 'Unassigned';
    if (!map[g]) map[g] = { grade: g, count: 0, cadre: r.cadre };
    map[g].count++;
  }

  return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 10);
}

export function getGenderByGrade(records: EmployeeRecord[]) {
  const map: Record<string, { grade: string; male: number; female: number; total: number }> = {};

  for (const r of records) {
    const g = r.grade || 'Unassigned';
    if (!map[g]) map[g] = { grade: g, male: 0, female: 0, total: 0 };
    map[g].total++;
    if (r.gender.toLowerCase().startsWith('f')) map[g].female++;
    else map[g].male++;
  }

  return Object.values(map)
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);
}

export function getEmploymentTypeDistribution(records: EmployeeRecord[]) {
  const map: Record<string, { type: string; count: number }> = {};

  for (const r of records) {
    const t = r.employmentType || 'Permanent';
    if (!map[t]) map[t] = { type: t, count: 0 };
    map[t].count++;
  }

  return Object.values(map).sort((a, b) => b.count - a.count);
}

export function getTopPositions(records: EmployeeRecord[], limit = 10) {
  const map: Record<string, { position: string; count: number; group: string }> = {};

  for (const r of records) {
    const pos = r.positionName || r.job || 'Officer';
    if (!map[pos]) map[pos] = { position: pos, count: 0, group: r.group };
    map[pos].count++;
  }

  return Object.values(map).sort((a, b) => b.count - a.count).slice(0, limit);
}

export function getAgeCohortsDistribution(records: EmployeeRecord[]) {
  const order = ['< 25 yrs', '25 - 34 yrs', '35 - 44 yrs', '45 - 54 yrs', '55+ yrs'];
  const map: Record<string, { ageGroup: string; count: number; female: number; male: number }> = {};

  for (const o of order) {
    map[o] = { ageGroup: o, count: 0, female: 0, male: 0 };
  }

  for (const r of records) {
    const ag = r.ageGroup || '< 25 yrs';
    if (!map[ag]) map[ag] = { ageGroup: ag, count: 0, female: 0, male: 0 };
    map[ag].count++;
    if (r.gender.toLowerCase().startsWith('f')) map[ag].female++;
    else map[ag].male++;
  }

  return order.map(k => map[k]).filter(Boolean);
}

export function getTenureBracketsDistribution(records: EmployeeRecord[]) {
  const order = ['< 1 Year', '1 - 3 Years', '3 - 5 Years', '5 - 10 Years', '10+ Years'];
  const map: Record<string, { tenureGroup: string; count: number }> = {};

  for (const o of order) {
    map[o] = { tenureGroup: o, count: 0 };
  }

  for (const r of records) {
    const tg = r.tenureGroup || '< 1 Year';
    if (!map[tg]) map[tg] = { tenureGroup: tg, count: 0 };
    map[tg].count++;
  }

  return order.map(k => map[k]).filter(Boolean);
}

export function getBranchCategoryDistribution(records: EmployeeRecord[]) {
  const map: Record<string, { category: string; count: number }> = {};

  for (const r of records) {
    const cat = r.branchCategory || 'Standard';
    if (!map[cat]) map[cat] = { category: cat, count: 0 };
    map[cat].count++;
  }

  return Object.values(map).sort((a, b) => b.count - a.count);
}

export function getFlagshipDistribution(records: EmployeeRecord[]) {
  const map: Record<string, { flagship: string; count: number }> = {};

  for (const r of records) {
    const f = r.flagship || 'Standard';
    if (!map[f]) map[f] = { flagship: f, count: 0 };
    map[f].count++;
  }

  return Object.values(map).sort((a, b) => b.count - a.count);
}

export function getSupervisorSpan(records: EmployeeRecord[], limit = 8) {
  const map: Record<string, { supervisor: string; directReports: number }> = {};

  for (const r of records) {
    const sup = r.supervisor || 'Unassigned';
    if (!map[sup]) map[sup] = { supervisor: sup, directReports: 0 };
    map[sup].directReports++;
  }

  return Object.values(map).sort((a, b) => b.directReports - a.directReports).slice(0, limit);
}
