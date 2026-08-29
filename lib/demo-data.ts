import { SheetCollection } from '@/types/hr';

const REGIONS = [
  'Federal Capital',
  'South Region',
  'Central Region',
  'North Region',
  'Special Economic Zone'
];

const CLUSTERS: Record<string, string[]> = {
  'Federal Capital': ['Islamabad Urban', 'Rawalpindi Metro', 'Diplomatic Enclave'],
  'South Region': ['Karachi South & Port', 'Karachi Central', 'Hyderabad & Interior'],
  'Central Region': ['Lahore CBD', 'Faisalabad Industrial', 'Multan Hub'],
  'North Region': ['Peshawar City', 'Abbottabad Valley', 'Mardan Division'],
  'Special Economic Zone': ['Gwadar Port Zone', 'Rashakai Hub', 'Dhabeji SEZ']
};

const BRANCH_CATEGORIES = ['Corporate Head Office', 'Urban Commercial', 'Retail Branch', 'Islamic Banking Hub', 'Rural Agribusiness'];

const GROUPS_SUBGROUPS: Record<string, { subGroups: string[]; jobs: { job: string; pos: string; cadre: string; grade: string }[] }> = {
  'Branch Banking Group': {
    subGroups: ['Retail Operations', 'Customer Experience', 'Islamic Window', 'Branch Audit & Controls'],
    jobs: [
      { job: 'Branch Manager', pos: 'Senior Branch Manager (AVP)', cadre: 'Management', grade: 'AVP' },
      { job: 'Operations Manager', pos: 'Branch Operations Officer', cadre: 'Officer', grade: 'OG-I' },
      { job: 'Relationship Manager', pos: 'Senior RM - Commercial', cadre: 'Officer', grade: 'OG-II' },
      { job: 'Universal Teller', pos: 'Senior Teller & Cash Custodian', cadre: 'Support', grade: 'OG-III' },
      { job: 'Customer Service Officer', pos: 'CS Desk Specialist', cadre: 'Support', grade: 'Associate' }
    ]
  },
  'Information Technology Group': {
    subGroups: ['Core Banking Engineering', 'Cloud Infrastructure & DevOps', 'Cybersecurity & SOC', 'Data & AI Platform'],
    jobs: [
      { job: 'Lead Cloud Architect', pos: 'Principal Cloud Platform Engineer', cadre: 'Executive', grade: 'VP' },
      { job: 'Senior Full Stack Engineer', pos: 'Staff Software Engineer - FinTech', cadre: 'Management', grade: 'AVP' },
      { job: 'Database Administrator', pos: 'High-Availability DBA Specialist', cadre: 'Officer', grade: 'OG-I' },
      { job: 'Cyber Threat Analyst', pos: 'SOC Lead Security Analyst', cadre: 'Officer', grade: 'OG-II' },
      { job: 'Data Engineer', pos: 'Analytics Pipeline Engineer', cadre: 'Officer', grade: 'OG-II' }
    ]
  },
  'Operations & Support Group': {
    subGroups: ['Central Clearing & Settlements', 'Trade Finance Services', 'Corporate Cash Management', 'Facilities & Real Estate'],
    jobs: [
      { job: 'Settlements Head', pos: 'Head of Swift & Central Clearing', cadre: 'Executive', grade: 'SVP' },
      { job: 'Trade Finance Specialist', pos: 'LC & Guarantees Operations Officer', cadre: 'Management', grade: 'AVP' },
      { job: 'Reconciliation Officer', pos: 'Daily Nostro & GL Reconciler', cadre: 'Officer', grade: 'OG-I' },
      { job: 'Cash Vault Officer', pos: 'Central Vault Custodian', cadre: 'Support', grade: 'OG-III' }
    ]
  },
  'Corporate & Commercial Group': {
    subGroups: ['Syndicated Lending & Project Finance', 'Multinational Corporate Desk', 'SME Business Banking'],
    jobs: [
      { job: 'Senior Credit Underwriter', pos: 'VP - Large Corporate Credit', cadre: 'Executive', grade: 'VP' },
      { job: 'Portfolio Manager', pos: 'SME Commercial Portfolio Head', cadre: 'Management', grade: 'AVP' },
      { job: 'Credit Analyst', pos: 'Financial Modelling & Risk Analyst', cadre: 'Officer', grade: 'OG-I' }
    ]
  }
};

const SUPERVISORS = [
  'Tariq Mansoor (EVP)',
  'Dr. Ayesha Siddiqui (SVP)',
  'Khurram Jahangir (VP)',
  'Zainab Al-Husseini (VP)',
  'Bilal Ahmed Qureshi (AVP)',
  'Farhana Batool (AVP)',
  'Naveed Akhtar (AVP)',
  'Shehryar Khan (VP)'
];

const FIRST_NAMES_MALE = ['Muhammad', 'Ahmed', 'Ali', 'Usman', 'Hamza', 'Bilal', 'Zayd', 'Mustafa', 'Hassan', 'Farooq', 'Imran', 'Kamran', 'Omar', 'Saad'];
const FIRST_NAMES_FEMALE = ['Fatima', 'Ayesha', 'Zainab', 'Maryam', 'Sara', 'Hira', 'Sana', 'Khadija', 'Noor', 'Mahnoor', 'Anam', 'Rabia', 'Sadia'];
const LAST_NAMES = ['Khan', 'Ahmed', 'Malik', 'Qureshi', 'Siddiqui', 'Shah', 'Chaudhry', 'Bhatti', 'Ansari', 'Raza', 'Farooqi', 'Hashmi', 'Mirza'];

const MARITAL_STATUSES = ['Married', 'Single', 'Married', 'Married', 'Single'];
const RELIGIONS = ['Islam', 'Christianity', 'Islam', 'Islam', 'Hinduism', 'Islam'];
const EMPLOYMENT_CATEGORIES = ['Permanent', 'Permanent', 'Permanent', 'Contractual', 'Probationary'];

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getAgeGroup(age: number): string {
  if (age < 25) return '< 25 yrs';
  if (age <= 34) return '25 - 34 yrs';
  if (age <= 44) return '35 - 44 yrs';
  if (age <= 54) return '45 - 54 yrs';
  return '55+ yrs';
}

function getTenureGroup(tenureYears: number): string {
  if (tenureYears < 1) return '< 1 Year';
  if (tenureYears <= 3) return '1 - 3 Years';
  if (tenureYears <= 5) return '3 - 5 Years';
  if (tenureYears <= 10) return '5 - 10 Years';
  return '10+ Years';
}

export function generateDemoEnterpriseSheets(): SheetCollection {
  const sheets: SheetCollection = {
    'Branch Network (Retail)': [],
    'Head Office & Operations': [],
    'Corporate & Investment': []
  };

  let empCounter = 1000;

  // Sheet 1: Branch Network (Retail) (350 records)
  for (let i = 0; i < 350; i++) {
    empCounter++;
    const isFemale = Math.random() < 0.38;
    const title = isFemale ? 'Ms.' : 'Mr.';
    const firstName = isFemale ? randomChoice(FIRST_NAMES_FEMALE) : randomChoice(FIRST_NAMES_MALE);
    const lastName = randomChoice(LAST_NAMES);
    const fatherName = `${randomChoice(FIRST_NAMES_MALE)} ${lastName}`;
    const fullName = `${firstName} ${lastName}`;

    const birthYear = randomInt(1975, 2003);
    const birthMonth = String(randomInt(1, 12)).padStart(2, '0');
    const birthDay = String(randomInt(1, 28)).padStart(2, '0');
    const dob = `${birthYear}-${birthMonth}-${birthDay}`;

    const hireYear = randomInt(Math.max(birthYear + 20, 2010), 2026);
    const hireMonth = String(randomInt(1, 12)).padStart(2, '0');
    const hireDay = String(randomInt(1, 28)).padStart(2, '0');
    const hireDate = `${hireYear}-${hireMonth}-${hireDay}`;

    const groupDef = GROUPS_SUBGROUPS['Branch Banking Group'];
    const subGroup = randomChoice(groupDef.subGroups);
    const jobRole = randomChoice(groupDef.jobs);

    const region = randomChoice(REGIONS);
    const cluster = randomChoice(CLUSTERS[region]);
    const branchNum = randomInt(101, 399);
    const branchCategory = randomChoice(BRANCH_CATEGORIES);
    const isFlagship = branchCategory.includes('Corporate') || branchCategory.includes('Hub') ? 'Yes (Flagship)' : 'Standard';
    const userStatus = Math.random() < 0.94 ? 'Active' : (Math.random() < 0.6 ? 'Resigned' : 'On Leave');

    const age = 2026 - birthYear;
    const tenureYears = parseFloat((2026 - hireYear + (randomInt(0, 11) / 12)).toFixed(1));

    sheets['Branch Network (Retail)'].push({
      employeeNumber: `EMP-${empCounter}`,
      title,
      fullName,
      userStatus,
      group: 'Branch Banking Group',
      subGroup,
      dateOfBirth: dob,
      hireDate,
      branchCode: `BR-${branchNum}`,
      accountNo: `PK92BANK000${empCounter}${randomInt(10, 99)}`,
      cadre: jobRole.cadre,
      grade: jobRole.grade,
      locationCode: `LOC-${region.substring(0, 3).toUpperCase()}-${branchNum}`,
      flagship: isFlagship,
      branchCategory,
      region,
      cluster,
      job: jobRole.job,
      positionName: jobRole.pos,
      org: 'Apex Premier Bank Ltd',
      supervisor: randomChoice(SUPERVISORS),
      fatherName,
      gender: isFemale ? 'Female' : 'Male',
      employmentCategory: randomChoice(EMPLOYMENT_CATEGORIES),
      emailAddress: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${empCounter % 100}@apexbank.com`,
      maritalStatus: randomChoice(MARITAL_STATUSES),
      nationality: 'Pakistani',
      religion: randomChoice(RELIGIONS),
      nationalId: `42101-${randomInt(1000000, 9999999)}-${isFemale ? '2' : '1'}`,
      contact: `+92-3${randomInt(10, 49)}-${randomInt(1000000, 9999999)}`,
      age,
      tenureYears,
      ageGroup: getAgeGroup(age),
      tenureGroup: getTenureGroup(tenureYears),
      hireYear: String(hireYear),
      sheetOrigin: 'Branch Network (Retail)'
    });
  }

  // Sheet 2: Head Office & Operations (220 records)
  for (let i = 0; i < 220; i++) {
    empCounter++;
    const isFemale = Math.random() < 0.44;
    const title = isFemale ? 'Ms.' : 'Mr.';
    const firstName = isFemale ? randomChoice(FIRST_NAMES_FEMALE) : randomChoice(FIRST_NAMES_MALE);
    const lastName = randomChoice(LAST_NAMES);
    const fatherName = `${randomChoice(FIRST_NAMES_MALE)} ${lastName}`;
    const fullName = `${firstName} ${lastName}`;

    const birthYear = randomInt(1972, 2002);
    const birthMonth = String(randomInt(1, 12)).padStart(2, '0');
    const birthDay = String(randomInt(1, 28)).padStart(2, '0');
    const dob = `${birthYear}-${birthMonth}-${birthDay}`;

    const hireYear = randomInt(Math.max(birthYear + 21, 2012), 2026);
    const hireMonth = String(randomInt(1, 12)).padStart(2, '0');
    const hireDay = String(randomInt(1, 28)).padStart(2, '0');
    const hireDate = `${hireYear}-${hireMonth}-${hireDay}`;

    const groupKey = Math.random() < 0.5 ? 'Information Technology Group' : 'Operations & Support Group';
    const groupDef = GROUPS_SUBGROUPS[groupKey];
    const subGroup = randomChoice(groupDef.subGroups);
    const jobRole = randomChoice(groupDef.jobs);

    const region = Math.random() < 0.7 ? 'Federal Capital' : 'South Region';
    const cluster = randomChoice(CLUSTERS[region]);
    const userStatus = Math.random() < 0.96 ? 'Active' : (Math.random() < 0.7 ? 'Resigned' : 'Inactive');

    const age = 2026 - birthYear;
    const tenureYears = parseFloat((2026 - hireYear + (randomInt(0, 11) / 12)).toFixed(1));

    sheets['Head Office & Operations'].push({
      employeeNumber: `EMP-${empCounter}`,
      title,
      fullName,
      userStatus,
      group: groupKey,
      subGroup,
      dateOfBirth: dob,
      hireDate,
      branchCode: 'HO-001',
      accountNo: `PK92BANK000${empCounter}${randomInt(10, 99)}`,
      cadre: jobRole.cadre,
      grade: jobRole.grade,
      locationCode: 'LOC-HO-ISB',
      flagship: 'Headquarters',
      branchCategory: 'Corporate Head Office',
      region,
      cluster,
      job: jobRole.job,
      positionName: jobRole.pos,
      org: 'Apex Premier Bank Ltd',
      supervisor: randomChoice(SUPERVISORS),
      fatherName,
      gender: isFemale ? 'Female' : 'Male',
      employmentCategory: randomChoice(EMPLOYMENT_CATEGORIES),
      emailAddress: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${empCounter % 100}@apexbank.com`,
      maritalStatus: randomChoice(MARITAL_STATUSES),
      nationality: 'Pakistani',
      religion: randomChoice(RELIGIONS),
      nationalId: `35202-${randomInt(1000000, 9999999)}-${isFemale ? '2' : '1'}`,
      contact: `+92-3${randomInt(10, 49)}-${randomInt(1000000, 9999999)}`,
      age,
      tenureYears,
      ageGroup: getAgeGroup(age),
      tenureGroup: getTenureGroup(tenureYears),
      hireYear: String(hireYear),
      sheetOrigin: 'Head Office & Operations'
    });
  }

  // Sheet 3: Corporate & Investment (130 records)
  for (let i = 0; i < 130; i++) {
    empCounter++;
    const isFemale = Math.random() < 0.40;
    const title = isFemale ? 'Ms.' : 'Mr.';
    const firstName = isFemale ? randomChoice(FIRST_NAMES_FEMALE) : randomChoice(FIRST_NAMES_MALE);
    const lastName = randomChoice(LAST_NAMES);
    const fatherName = `${randomChoice(FIRST_NAMES_MALE)} ${lastName}`;
    const fullName = `${firstName} ${lastName}`;

    const birthYear = randomInt(1974, 2000);
    const birthMonth = String(randomInt(1, 12)).padStart(2, '0');
    const birthDay = String(randomInt(1, 28)).padStart(2, '0');
    const dob = `${birthYear}-${birthMonth}-${birthDay}`;

    const hireYear = randomInt(Math.max(birthYear + 22, 2014), 2026);
    const hireMonth = String(randomInt(1, 12)).padStart(2, '0');
    const hireDay = String(randomInt(1, 28)).padStart(2, '0');
    const hireDate = `${hireYear}-${hireMonth}-${hireDay}`;

    const groupKey = 'Corporate & Commercial Group';
    const groupDef = GROUPS_SUBGROUPS[groupKey];
    const subGroup = randomChoice(groupDef.subGroups);
    const jobRole = randomChoice(groupDef.jobs);

    const region = randomChoice(['South Region', 'Central Region', 'Federal Capital']);
    const cluster = randomChoice(CLUSTERS[region]);
    const userStatus = Math.random() < 0.95 ? 'Active' : 'Resigned';

    const age = 2026 - birthYear;
    const tenureYears = parseFloat((2026 - hireYear + (randomInt(0, 11) / 12)).toFixed(1));

    sheets['Corporate & Investment'].push({
      employeeNumber: `EMP-${empCounter}`,
      title,
      fullName,
      userStatus,
      group: groupKey,
      subGroup,
      dateOfBirth: dob,
      hireDate,
      branchCode: 'CORP-01',
      accountNo: `PK92BANK000${empCounter}${randomInt(10, 99)}`,
      cadre: jobRole.cadre,
      grade: jobRole.grade,
      locationCode: `LOC-${region.substring(0, 3).toUpperCase()}-CORP`,
      flagship: 'Corporate Center',
      branchCategory: 'Commercial Hub',
      region,
      cluster,
      job: jobRole.job,
      positionName: jobRole.pos,
      org: 'Apex Premier Bank Ltd',
      supervisor: randomChoice(SUPERVISORS),
      fatherName,
      gender: isFemale ? 'Female' : 'Male',
      employmentCategory: 'Permanent',
      emailAddress: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${empCounter % 100}@apexbank.com`,
      maritalStatus: randomChoice(MARITAL_STATUSES),
      nationality: 'Pakistani',
      religion: randomChoice(RELIGIONS),
      nationalId: `61101-${randomInt(1000000, 9999999)}-${isFemale ? '2' : '1'}`,
      contact: `+92-3${randomInt(10, 49)}-${randomInt(1000000, 9999999)}`,
      age,
      tenureYears,
      ageGroup: getAgeGroup(age),
      tenureGroup: getTenureGroup(tenureYears),
      hireYear: String(hireYear),
      sheetOrigin: 'Corporate & Investment'
    });
  }

  return sheets;
}
