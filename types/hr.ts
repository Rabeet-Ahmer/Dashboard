export interface EmployeeRecord {
  // Raw 28 fields from HR Excel Schema
  employeeNumber: string;
  fullName: string;
  userStatus: string;
  group: string;
  subGroup: string;
  dateOfBirth: string;
  hireDate: string;
  branchCode: string;
  accountNo: string;
  cadre: string;
  grade: string;
  locationCode: string;
  flagship: string;
  branchCategory: string;
  region: string;
  cluster: string;
  job: string;
  positionName: string;
  org: string;
  supervisor: string;
  fatherName: string;
  gender: string;
  nationalIdentity: string;
  employmentType: string;
  emailAddress: string;
  contactId: string;
  maritalStatus: string;
  religion: string;

  // Computed & Derived properties
  age: number;
  tenureYears: number;
  ageGroup: string;
  tenureGroup: string;
  hireYear: string;
  sheetOrigin?: string;
}

export interface SheetCollection {
  [sheetName: string]: EmployeeRecord[];
}

export interface HRFilterState {
  sheet: string; // "ALL" or specific sheet name
  search: string;
  region: string;
  cluster: string;
  group: string;
  subGroup: string;
  grade: string;
  cadre: string;
  userStatus: string;
  gender: string;
  employmentType: string;
  branchCategory: string;
}

export interface HRMetricsSummary {
  totalHeadcount: number;
  activeCount: number;
  inactiveCount: number;
  activeRatio: number;
  avgTenureYears: number;
  avgAge: number;
  genderRatio: {
    male: number;
    female: number;
    other: number;
    malePercent: number;
    femalePercent: number;
  };
  uniqueBranchesCount: number;
  uniqueRegionsCount: number;
  uniqueClustersCount: number;
  uniqueGroupsCount: number;
}
