// Enterprise HR Record Type matching 29-column Excel Schema
export interface EmployeeRecord {
  employeeNumber: string;         // EMPLOYEE_NUMBER
  title: string;                  // TITLE (e.g. Mr., Ms., Dr.)
  fullName: string;               // FULL_NAME
  userStatus: string;             // USER_STATUS (Active, Resigned, On Leave, etc.)
  group: string;                  // GROUP
  subGroup: string;               // SUB_GROUP (Department / Division)
  dateOfBirth: string;            // DATE_OF_BIRTH (YYYY-MM-DD)
  hireDate: string;               // HIRE_DATE (YYYY-MM-DD)
  branchCode: string;             // BRANCH_CODE
  accountNo: string;              // ACCOUNT_NO
  cadre: string;                  // CADRE (Executive, Management, Officer, Support)
  grade: string;                  // Grade (e.g. VP, AVP, Manager, OG-I)
  locationCode: string;           // LOCATION_CODE
  flagship: string;               // FLAGSHIP (Yes/No/HQ)
  branchCategory: string;         // BRANCH_CATEGORY (Urban, Commercial, Rural, Islamic)
  region: string;                 // Region (North, Central, South, etc.)
  cluster: string;                // CLUS (Cluster name)
  job: string;                    // JOB (Job Title)
  positionName: string;           // Pos_name (Position Designation)
  org: string;                    // ORG (Organization / Company entity)
  supervisor: string;             // SUPERVISOR (Reporting manager)
  fatherName: string;             // FATHER_NAME
  gender: string;                 // GENDER (Male, Female, Other)
  employmentCategory: string;     // EMPLOYMENT_CATEGORY (Permanent, Contractual, Probationary, etc.)
  emailAddress: string;           // EMAIL_ADDRESS
  maritalStatus: string;          // MARITAL_STATUS (Single, Married, Divorced)
  nationality: string;            // NATIONALITY (e.g. Pakistani, Expatriate)
  religion: string;               // RELIGION (Islam, Christianity, Hinduism, etc.)
  nationalId: string;             // NATIONAL_ID (CNIC, SSN, Passport)

  // Derived analytical fields
  age: number;                    // Calculated Age in years
  tenureYears: number;            // Calculated Tenure in years
  ageGroup: string;               // e.g. "< 25 yrs", "25 - 34 yrs", etc.
  tenureGroup: string;            // e.g. "< 1 Year", "1 - 3 Years", etc.
  hireYear: string;               // e.g. "2021"
  sheetOrigin: string;            // Name of the sheet inside the multi-sheet workbook
}

// Multi-sheet workbook collection map (Sheet Name -> Records)
export interface SheetCollection {
  [sheetName: string]: EmployeeRecord[];
}

// Global Filter State
export interface HRFilterState {
  sheet: string;
  search: string;
  region: string;
  cluster: string;
  group: string;
  subGroup: string;
  grade: string;
  cadre: string;
  userStatus: string;
  gender: string;
  employmentCategory: string;
  branchCategory: string;
  nationality: string;
}

// Top KPI Metrics Summary
export interface HRMetricsSummary {
  totalHeadcount: number;
  activeCount: number;
  inactiveCount: number;
  activeRatio: number;
  avgTenureYears: number;
  avgAge: number;
  genderRatio: {
    maleCount: number;
    femaleCount: number;
    malePercent: number;
    femalePercent: number;
  };
  uniqueBranchesCount: number;
  uniqueRegionsCount: number;
  uniqueClustersCount: number;
  uniqueGroupsCount: number;
}
