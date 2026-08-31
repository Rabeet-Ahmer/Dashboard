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
      genderRatio: {
        maleCount: 0,
        femaleCount: 0,
        malePercent: 0,
        femalePercent: 0
      },
      uniqueBranchesCount: 0,
      uniqueRegionsCount: 0,
      uniqueClustersCount: 0,
      uniqueGroupsCount: 0
    };
  }

  let activeCount = 0;
  let totalTenure = 0;
  let tenureValidCount = 0;
  let totalAge = 0;
  let ageValidCount = 0;
  let maleCount = 0;
  let femaleCount = 0;

  const branches = new Set<string>();
  const regions = new Set<string>();
  const clusters = new Set<string>();
  const groups = new Set<string>();

  for (const r of records) {
    const isAct = (r.userStatus || '').toLowerCase().includes('active');
    if (isAct) activeCount++;

    if (typeof r.tenureYears === 'number' && !isNaN(r.tenureYears) && r.tenureYears > 0) {
      totalTenure += r.tenureYears;
      tenureValidCount++;
    }

    if (typeof r.age === 'number' && !isNaN(r.age) && r.age > 0) {
      totalAge += r.age;
      ageValidCount++;
    }

    const g = (r.gender || '').toLowerCase();
    if (g.startsWith('f')) femaleCount++;
    else if (g.startsWith('m')) maleCount++;

    if (r.branchCode && r.branchCode !== 'N/A') branches.add(r.branchCode);
    if (r.region && r.region !== 'N/A') regions.add(r.region);
    if (r.cluster && r.cluster !== 'N/A') clusters.add(r.cluster);
    if (r.group && r.group !== 'N/A') groups.add(r.group);
  }

  const genderTotal = maleCount + femaleCount;

  return {
    totalHeadcount: total,
    activeCount,
    inactiveCount: total - activeCount,
    activeRatio: total > 0 ? parseFloat(((activeCount / total) * 100).toFixed(1)) : 0,
    avgTenureYears: tenureValidCount > 0 ? parseFloat((totalTenure / tenureValidCount).toFixed(1)) : 0,
    avgAge: ageValidCount > 0 ? parseFloat((totalAge / ageValidCount).toFixed(1)) : 0,
    genderRatio: {
      maleCount,
      femaleCount,
      malePercent: genderTotal > 0 ? parseFloat(((maleCount / genderTotal) * 100).toFixed(1)) : 0,
      femalePercent: genderTotal > 0 ? parseFloat(((femaleCount / genderTotal) * 100).toFixed(1)) : 0
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
    const region = r.region && r.region !== 'N/A' ? r.region : 'Unassigned';
    if (!map[region]) {
      map[region] = { region, count: 0, active: 0, female: 0 };
    }
    map[region].count++;
    if ((r.userStatus || '').toLowerCase().includes('active')) map[region].active++;
    if ((r.gender || '').toLowerCase().startsWith('f')) map[region].female++;
  }

  return Object.values(map).sort((a, b) => b.count - a.count);
}

export function getGroupDistribution(records: EmployeeRecord[]) {
  const map: Record<string, { group: string; count: number; active: number }> = {};

  for (const r of records) {
    const g = r.group && r.group !== 'N/A' ? r.group : 'Unassigned';
    if (!map[g]) map[g] = { group: g, count: 0, active: 0 };
    map[g].count++;
    if ((r.userStatus || '').toLowerCase().includes('active')) map[g].active++;
  }

  return Object.values(map).sort((a, b) => b.count - a.count);
}

export function getSubGroupDistribution(records: EmployeeRecord[], selectedGroup?: string) {
  const map: Record<string, { subGroup: string; group: string; count: number }> = {};

  for (const r of records) {
    if (selectedGroup && selectedGroup !== 'ALL' && r.group !== selectedGroup) continue;
    const sg = r.subGroup && r.subGroup !== 'N/A' ? r.subGroup : 'General';
    if (!map[sg]) map[sg] = { subGroup: sg, group: r.group, count: 0 };
    map[sg].count++;
  }

  return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 10);
}

export function getHiringTimeline(records: EmployeeRecord[]) {
  const map: Record<string, { year: string; hires: number; activeHires: number }> = {};

  for (const r of records) {
    const yr = r.hireYear;
    if (!yr || yr === 'N/A' || yr === 'Unknown' || parseInt(yr) < 1980) continue;
    if (!map[yr]) map[yr] = { year: yr, hires: 0, activeHires: 0 };
    map[yr].hires++;
    if ((r.userStatus || '').toLowerCase().includes('active')) map[yr].activeHires++;
  }

  return Object.values(map).sort((a, b) => a.year.localeCompare(b.year));
}

export function getUserStatusDistribution(records: EmployeeRecord[]) {
  const map: Record<string, { status: string; count: number }> = {};

  for (const r of records) {
    const st = r.userStatus || 'N/A';
    if (!map[st]) map[st] = { status: st, count: 0 };
    map[st].count++;
  }

  return Object.values(map).sort((a, b) => b.count - a.count);
}

export function getCadreDistribution(records: EmployeeRecord[]) {
  const map: Record<string, { cadre: string; count: number; female: number; male: number }> = {};

  for (const r of records) {
    const c = r.cadre && r.cadre !== 'N/A' ? r.cadre : 'Unassigned';
    if (!map[c]) map[c] = { cadre: c, count: 0, female: 0, male: 0 };
    map[c].count++;
    if ((r.gender || '').toLowerCase().startsWith('f')) map[c].female++;
    else if ((r.gender || '').toLowerCase().startsWith('m')) map[c].male++;
  }

  return Object.values(map).sort((a, b) => b.count - a.count);
}

export function getGradeDistribution(records: EmployeeRecord[]) {
  const map: Record<string, { grade: string; count: number; cadre: string }> = {};

  for (const r of records) {
    const g = r.grade && r.grade !== 'N/A' ? r.grade : 'Unassigned';
    if (!map[g]) map[g] = { grade: g, count: 0, cadre: r.cadre };
    map[g].count++;
  }

  return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 10);
}

export function getGenderByGrade(records: EmployeeRecord[]) {
  const map: Record<string, { grade: string; male: number; female: number; total: number }> = {};

  for (const r of records) {
    const g = r.grade && r.grade !== 'N/A' ? r.grade : 'Unassigned';
    if (!map[g]) map[g] = { grade: g, male: 0, female: 0, total: 0 };
    map[g].total++;
    if ((r.gender || '').toLowerCase().startsWith('f')) map[g].female++;
    else if ((r.gender || '').toLowerCase().startsWith('m')) map[g].male++;
  }

  return Object.values(map)
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);
}

export function getEmploymentTypeDistribution(records: EmployeeRecord[]) {
  const map: Record<string, { type: string; count: number }> = {};

  for (const r of records) {
    const t = r.employmentCategory && r.employmentCategory !== 'N/A' ? r.employmentCategory : 'Unassigned';
    if (!map[t]) map[t] = { type: t, count: 0 };
    map[t].count++;
  }

  return Object.values(map).sort((a, b) => b.count - a.count);
}

export function getTopPositions(records: EmployeeRecord[], limit = 10) {
  const map: Record<string, { position: string; count: number; group: string }> = {};

  for (const r of records) {
    const pos = r.positionName !== 'N/A' ? r.positionName : (r.job !== 'N/A' ? r.job : 'Unassigned');
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
    if (!r.ageGroup || r.ageGroup === 'N/A') continue;
    const ag = r.ageGroup;
    if (!map[ag]) map[ag] = { ageGroup: ag, count: 0, female: 0, male: 0 };
    map[ag].count++;
    if ((r.gender || '').toLowerCase().startsWith('f')) map[ag].female++;
    else if ((r.gender || '').toLowerCase().startsWith('m')) map[ag].male++;
  }

  return order.map(k => map[k]).filter(Boolean);
}

export function getTenureBracketsDistribution(records: EmployeeRecord[]) {
  const maxYear = 10;
  const buckets: string[] = ['< 1 Year'];
  for (let y = 1; y < maxYear; y++) {
    buckets.push(y === 1 ? '1 Year' : `${y} Years`);
  }
  buckets.push(`${maxYear}+ Years`);

  const counts: Record<string, number> = {};
  for (const b of buckets) {
    counts[b] = 0;
  }

  for (const r of records) {
    if (typeof r.tenureYears !== 'number' || isNaN(r.tenureYears) || r.tenureYears < 0) continue;
    const ty = r.tenureYears;

    let bName = '';
    if (ty < 1) {
      bName = '< 1 Year';
    } else if (ty >= maxYear) {
      bName = `${maxYear}+ Years`;
    } else {
      const yr = Math.floor(ty);
      bName = yr === 1 ? '1 Year' : `${yr} Years`;
    }

    if (counts[bName] !== undefined) {
      counts[bName]++;
    }
  }

  return buckets.map(b => ({ tenureGroup: b, count: counts[b] }));
}

export function getBranchCategoryDistribution(records: EmployeeRecord[]) {
  const map: Record<string, { category: string; count: number }> = {};

  for (const r of records) {
    const cat = r.branchCategory && r.branchCategory !== 'N/A' ? r.branchCategory : 'Unassigned';
    if (!map[cat]) map[cat] = { category: cat, count: 0 };
    map[cat].count++;
  }

  return Object.values(map).sort((a, b) => b.count - a.count);
}

export function getFlagshipDistribution(records: EmployeeRecord[]) {
  const map: Record<string, { flagship: string; count: number }> = {};

  for (const r of records) {
    const f = r.flagship && r.flagship !== 'N/A' ? r.flagship : 'Standard';
    if (!map[f]) map[f] = { flagship: f, count: 0 };
    map[f].count++;
  }

  return Object.values(map).sort((a, b) => b.count - a.count);
}

export function getSupervisorSpan(records: EmployeeRecord[], limit?: number) {
  const map: Record<string, { supervisor: string; directReports: number }> = {};

  for (const r of records) {
    const sup = r.supervisor && r.supervisor !== 'N/A' ? r.supervisor : 'Unassigned';
    if (!map[sup]) map[sup] = { supervisor: sup, directReports: 0 };
    map[sup].directReports++;
  }

  const sorted = Object.values(map).sort((a, b) => b.directReports - a.directReports);
  return typeof limit === 'number' ? sorted.slice(0, limit) : sorted;
}

export interface BatchOnboardingData {
  hireDate: string;
  displayDate: string;
  og1: number;
  og2: number;
  others: number;
  total: number;
}

export function getBatchOnboardingDistribution(records: EmployeeRecord[]): BatchOnboardingData[] {
  const map: Record<string, BatchOnboardingData> = {};

  for (const r of records) {
    if (!r.hireDate || r.hireDate === 'N/A') continue;
    const dateStr = r.hireDate.trim();
    if (!map[dateStr]) {
      let displayDate = dateStr;
      try {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
          const day = String(d.getDate()).padStart(2, '0');
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const month = months[d.getMonth()];
          const year = d.getFullYear();
          displayDate = `${day}-${month}-${year}`;
        }
      } catch (_) {}

      map[dateStr] = {
        hireDate: dateStr,
        displayDate,
        og1: 0,
        og2: 0,
        others: 0,
        total: 0
      };
    }

    const g = (r.grade || '').toLowerCase().replace(/[\s_-]/g, '');
    const j = (r.job || '').toLowerCase();
    const p = (r.positionName || '').toLowerCase();

    const isOg1 =
      g.includes('og1') ||
      g.includes('ogi') ||
      g === 'og1' ||
      g === 'ogi' ||
      j.includes('og-1') ||
      j.includes('og-i') ||
      p.includes('og-1') ||
      p.includes('og-i') ||
      g.includes('officergrade1') ||
      g.includes('officergradei');

    const isOg2 =
      !isOg1 &&
      (g.includes('og2') ||
        g.includes('ogii') ||
        g === 'og2' ||
        g === 'ogii' ||
        j.includes('og-2') ||
        j.includes('og-ii') ||
        p.includes('og-2') ||
        p.includes('og-ii') ||
        g.includes('officergrade2') ||
        g.includes('officergradeii'));

    if (isOg1) {
      map[dateStr].og1++;
    } else if (isOg2) {
      map[dateStr].og2++;
    } else {
      map[dateStr].others++;
    }
    map[dateStr].total++;
  }

  // Sort chronologically ascending
  return Object.values(map).sort((a, b) => a.hireDate.localeCompare(b.hireDate));
}

