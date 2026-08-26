import { EmployeeRecord, SheetCollection } from '@/types/hr';
import { getAgeGroup, getTenureGroup } from './excel-parser';

const FIRST_NAMES_MALE = [
  'Muhammad', 'Ali', 'Ahmed', 'Usman', 'Hamza', 'Bilal', 'Omar', 'Hassan', 'Zaid', 'Tariq',
  'Kamran', 'Faisal', 'Imran', 'Saad', 'Danish', 'Farhan', 'Kashif', 'Waqas', 'Asad', 'Babar'
];

const FIRST_NAMES_FEMALE = [
  'Fatima', 'Ayesha', 'Zainab', 'Maryam', 'Sana', 'Hira', 'Amna', 'Noor', 'Sara', 'Sadia',
  'Anum', 'Rabia', 'Mahnoor', 'Iqra', 'Nimra', 'Mehwish', 'Samina', 'Nida', 'Kiran', 'Bushra'
];

const LAST_NAMES = [
  'Khan', 'Ahmed', 'Malik', 'Sheikh', 'Chaudhry', 'Siddiqui', 'Qureshi', 'Raza', 'Shah', 'Farooqi',
  'Mirza', 'Abbasi', 'Butt', 'Dar', 'Ansari', 'Ghafoor', 'Iqbal', 'Hussain', 'Zubair', 'Mahmood'
];

const REGIONS = ['North Region', 'Central Region', 'South Region', 'Federal Capital', 'West Region'];
const CLUSTERS: Record<string, string[]> = {
  'North Region': ['Peshawar Cluster', 'Rawalpindi Cluster', 'Abbottabad Cluster', 'Mardan Cluster'],
  'Central Region': ['Lahore City Cluster', 'Faisalabad Cluster', 'Multan Cluster', 'Gujranwala Cluster', 'Sialkot Cluster'],
  'South Region': ['Karachi South Cluster', 'Karachi Central Cluster', 'Hyderabad Cluster', 'Sukkur Cluster', 'Quetta Cluster'],
  'Federal Capital': ['Islamabad Blue Area Cluster', 'Islamabad F-Sector Cluster'],
  'West Region': ['Gwadar Cluster', 'Hub Industrial Cluster']
};

const GROUPS_SUBGROUPS: Record<string, { subGroups: string[]; jobs: { job: string; pos: string; cadre: string; grade: string }[] }> = {
  'Retail Banking Group': {
    subGroups: ['Branch Operations', 'Consumer Finance', 'Customer Experience', 'Bancassurance', 'Direct Sales'],
    jobs: [
      { job: 'Branch Management', pos: 'Branch Manager', cadre: 'Management', grade: 'Vice President' },
      { job: 'Branch Operations', pos: 'Branch Operations Manager', cadre: 'Management', grade: 'Assistant Vice President' },
      { job: 'Customer Service', pos: 'Senior Customer Relationship Officer', cadre: 'Officer', grade: 'Officer Grade I' },
      { job: 'Teller Services', pos: 'Universal Teller & Cash Officer', cadre: 'Officer', grade: 'Officer Grade II' },
      { job: 'Consumer Lending', pos: 'Auto & Home Finance Specialist', cadre: 'Officer', grade: 'Officer Grade II' },
      { job: 'Branch Support', pos: 'Office Assistant', cadre: 'Support Staff', grade: 'Non-Management' }
    ]
  },
  'Information Technology Group': {
    subGroups: ['Core Banking Solutions', 'Cyber Security', 'Infrastructure & Cloud', 'Digital Channels & Mobile', 'Data & Analytics'],
    jobs: [
      { job: 'IT Leadership', pos: 'Head of Enterprise Architecture', cadre: 'Executive', grade: 'Senior Vice President' },
      { job: 'Software Engineering', pos: 'Senior Full Stack Engineer', cadre: 'Management', grade: 'Manager' },
      { job: 'Cyber Security', pos: 'SOC Analyst & SecOps Lead', cadre: 'Officer', grade: 'Officer Grade I' },
      { job: 'Data Analytics', pos: 'Senior Business Intelligence Analyst', cadre: 'Officer', grade: 'Officer Grade I' },
      { job: 'System Administration', pos: 'DevOps & Cloud Engineer', cadre: 'Officer', grade: 'Officer Grade II' },
      { job: 'IT Helpdesk', pos: 'IT Support Engineer', cadre: 'Support Staff', grade: 'Officer Grade III' }
    ]
  },
  'Corporate & Commercial Group': {
    subGroups: ['Large Corporate Lending', 'SME Banking', 'Trade Finance & FX', 'Structured Finance', 'Syndications'],
    jobs: [
      { job: 'Relationship Management', pos: 'Senior Relationship Manager - Corporate', cadre: 'Management', grade: 'Vice President' },
      { job: 'Credit Analysis', pos: 'Senior Credit Risk Analyst', cadre: 'Management', grade: 'Assistant Vice President' },
      { job: 'Trade Services', pos: 'Trade Finance Officer', cadre: 'Officer', grade: 'Officer Grade I' },
      { job: 'SME Portfolio', pos: 'SME Relationship Officer', cadre: 'Officer', grade: 'Officer Grade II' },
      { job: 'Treasury Operations', pos: 'Treasury Settlement Associate', cadre: 'Officer', grade: 'Officer Grade II' }
    ]
  },
  'Operations & Support Group': {
    subGroups: ['Centralized Clearing (NIFT)', 'HR Shared Services', 'Compliance & AML', 'Internal Audit', 'Legal & Governance'],
    jobs: [
      { job: 'Audit & Inspection', pos: 'Senior Internal Auditor', cadre: 'Management', grade: 'Assistant Vice President' },
      { job: 'Compliance', pos: 'AML & Sanctions Compliance Officer', cadre: 'Officer', grade: 'Officer Grade I' },
      { job: 'HR Operations', pos: 'Talent Acquisition & HRBP', cadre: 'Officer', grade: 'Officer Grade I' },
      { job: 'Clearing Operations', pos: 'Clearing & Remittance Associate', cadre: 'Officer', grade: 'Officer Grade II' },
      { job: 'Logistics', pos: 'Facilities & Security Officer', cadre: 'Support Staff', grade: 'Officer Grade III' }
    ]
  }
};

const BRANCH_CATEGORIES = ['Urban High Volume', 'Commercial Hub', 'Semi-Urban', 'Rural Outreach', 'Islamic Banking Branch'];
const EMPLOYMENT_TYPES = ['Permanent', 'Permanent', 'Permanent', 'Contractual', 'Probationary'];
const MARITAL_STATUSES = ['Married', 'Married', 'Single', 'Married', 'Single'];
const RELIGIONS = ['Islam', 'Islam', 'Islam', 'Christianity', 'Islam', 'Hinduism'];
const SUPERVISORS = [
  'Kamran Farooqi (EVP - Group Head)',
  'Ayesha Tariq (SVP - Regional Head)',
  'Babar Raza (VP - Division Lead)',
  'Fatima Sheikh (AVP - Team Manager)',
  'Zaid Chaudhry (AVP - Operations Lead)',
  'Sana Siddiqui (Manager - Dept Lead)'
];

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateDemoHRDataset(): SheetCollection {
  const sheets: SheetCollection = {
    'Branch Network (Retail)': [],
    'Head Office & Operations': [],
    'Corporate & Investment': []
  };

  let empCounter = 1000;

  // Sheet 1: Branch Network (350 records)
  for (let i = 0; i < 350; i++) {
    empCounter++;
    const isFemale = Math.random() < 0.38;
    const firstName = isFemale ? randomChoice(FIRST_NAMES_FEMALE) : randomChoice(FIRST_NAMES_MALE);
    const lastName = randomChoice(LAST_NAMES);
    const fatherName = `${randomChoice(FIRST_NAMES_MALE)} ${lastName}`;
    const fullName = `${firstName} ${lastName}`;
    
    const birthYear = randomInt(1970, 2003);
    const birthMonth = String(randomInt(1, 12)).padStart(2, '0');
    const birthDay = String(randomInt(1, 28)).padStart(2, '0');
    const dob = `${birthYear}-${birthMonth}-${birthDay}`;

    const maxHireYear = 2026;
    const minHireYear = Math.max(birthYear + 20, 2010);
    const hireYear = randomInt(minHireYear, maxHireYear);
    const hireMonth = String(randomInt(1, 12)).padStart(2, '0');
    const hireDay = String(randomInt(1, 28)).padStart(2, '0');
    const hireDate = `${hireYear}-${hireMonth}-${hireDay}`;

    const region = randomChoice(REGIONS);
    const cluster = randomChoice(CLUSTERS[region]);
    const branchNum = randomInt(101, 280);
    const branchCode = `BR-${branchNum}`;
    const isFlagship = branchNum % 7 === 0 ? 'Yes (Flagship)' : 'Standard';
    const branchCategory = randomChoice(BRANCH_CATEGORIES);

    const groupKey = 'Retail Banking Group';
    const groupDef = GROUPS_SUBGROUPS[groupKey];
    const subGroup = randomChoice(groupDef.subGroups);
    const jobRole = randomChoice(groupDef.jobs);

    const userStatus = Math.random() < 0.94 ? 'Active' : (Math.random() < 0.6 ? 'Resigned' : 'On Leave');
    const age = 2026 - birthYear;
    const tenureYears = parseFloat((2026 - hireYear + (randomInt(0, 11) / 12)).toFixed(1));

    sheets['Branch Network (Retail)'].push({
      employeeNumber: `EMP-${empCounter}`,
      fullName,
      userStatus,
      group: groupKey,
      subGroup,
      dateOfBirth: dob,
      hireDate,
      branchCode,
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
      nationalIdentity: `42101-${randomInt(1000000, 9999999)}-${isFemale ? '2' : '1'}`,
      employmentType: randomChoice(EMPLOYMENT_TYPES),
      emailAddress: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${empCounter % 100}@apexbank.com`,
      contactId: `+92-3${randomInt(10, 49)}-${randomInt(1000000, 9999999)}`,
      maritalStatus: randomChoice(MARITAL_STATUSES),
      religion: randomChoice(RELIGIONS),
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
      nationalIdentity: `35202-${randomInt(1000000, 9999999)}-${isFemale ? '2' : '1'}`,
      employmentType: randomChoice(EMPLOYMENT_TYPES),
      emailAddress: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${empCounter % 100}@apexbank.com`,
      contactId: `+92-3${randomInt(10, 49)}-${randomInt(1000000, 9999999)}`,
      maritalStatus: randomChoice(MARITAL_STATUSES),
      religion: randomChoice(RELIGIONS),
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
      nationalIdentity: `61101-${randomInt(1000000, 9999999)}-${isFemale ? '2' : '1'}`,
      employmentType: 'Permanent',
      emailAddress: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${empCounter % 100}@apexbank.com`,
      contactId: `+92-3${randomInt(10, 49)}-${randomInt(1000000, 9999999)}`,
      maritalStatus: randomChoice(MARITAL_STATUSES),
      religion: randomChoice(RELIGIONS),
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
