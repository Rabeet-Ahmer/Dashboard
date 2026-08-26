import * as XLSX from 'xlsx';
import { EmployeeRecord, SheetCollection } from '@/types/hr';

// Utility to parse Excel serial dates or date strings
export function parseExcelDate(val: any): { dateStr: string; year: string; dateObj: Date | null } {
  if (!val) {
    return { dateStr: 'N/A', year: 'N/A', dateObj: null };
  }

  // If already a Date object
  if (val instanceof Date && !isNaN(val.getTime())) {
    const yyyy = val.getFullYear();
    const mm = String(val.getMonth() + 1).padStart(2, '0');
    const dd = String(val.getDate()).padStart(2, '0');
    return { dateStr: `${yyyy}-${mm}-${dd}`, year: String(yyyy), dateObj: val };
  }

  // If number (Excel serial date)
  if (typeof val === 'number') {
    // Excel base date is Dec 30 1899
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    if (!isNaN(date.getTime())) {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      return { dateStr: `${yyyy}-${mm}-${dd}`, year: String(yyyy), dateObj: date };
    }
  }

  // If string
  if (typeof val === 'string') {
    const trimmed = val.trim();
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      const yyyy = parsed.getFullYear();
      const mm = String(parsed.getMonth() + 1).padStart(2, '0');
      const dd = String(parsed.getDate()).padStart(2, '0');
      return { dateStr: `${yyyy}-${mm}-${dd}`, year: String(yyyy), dateObj: parsed };
    }
    return { dateStr: trimmed, year: trimmed.substring(0, 4) || 'N/A', dateObj: null };
  }

  return { dateStr: String(val), year: 'N/A', dateObj: null };
}

// Compute Age
export function computeAge(dobDateObj: Date | null, dobStr: string): number {
  const now = new Date();
  if (dobDateObj && !isNaN(dobDateObj.getTime())) {
    let age = now.getFullYear() - dobDateObj.getFullYear();
    const m = now.getMonth() - dobDateObj.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dobDateObj.getDate())) {
      age--;
    }
    return Math.max(18, Math.min(80, age));
  }
  const yearMatch = dobStr.match(/\b(19\d{2}|20\d{2})\b/);
  if (yearMatch) {
    const birthYear = parseInt(yearMatch[1], 10);
    return Math.max(18, Math.min(80, now.getFullYear() - birthYear));
  }
  return 32; // reasonable default if missing
}

// Compute Tenure
export function computeTenure(hireDateObj: Date | null, hireStr: string): number {
  const now = new Date();
  if (hireDateObj && !isNaN(hireDateObj.getTime())) {
    const diffMs = now.getTime() - hireDateObj.getTime();
    const years = diffMs / (1000 * 60 * 60 * 24 * 365.25);
    return Math.max(0, parseFloat(years.toFixed(1)));
  }
  const yearMatch = hireStr.match(/\b(19\d{2}|20\d{2})\b/);
  if (yearMatch) {
    const hireYear = parseInt(yearMatch[1], 10);
    return Math.max(0, now.getFullYear() - hireYear);
  }
  return 3.0; // reasonable default
}

export function getAgeGroup(age: number): string {
  if (age < 25) return '< 25 yrs';
  if (age <= 34) return '25 - 34 yrs';
  if (age <= 44) return '35 - 44 yrs';
  if (age <= 54) return '45 - 54 yrs';
  return '55+ yrs';
}

export function getTenureGroup(tenureYears: number): string {
  if (tenureYears < 1) return '< 1 Year';
  if (tenureYears <= 3) return '1 - 3 Years';
  if (tenureYears <= 5) return '3 - 5 Years';
  if (tenureYears <= 10) return '5 - 10 Years';
  return '10+ Years';
}

// Helper to normalize keys from Excel rows
function normalizeKey(key: string): string {
  return key
    .toLowerCase()
    .replace(/[*_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Finds the value from a raw row object using flexible key matching
function extractFieldValue(row: Record<string, any>, possibleKeys: string[]): string {
  const rowKeys = Object.keys(row);
  const normalizedRowKeyMap: Record<string, string> = {};
  for (const k of rowKeys) {
    normalizedRowKeyMap[normalizeKey(k)] = k;
  }

  for (const targetKey of possibleKeys) {
    const normTarget = normalizeKey(targetKey);
    if (normalizedRowKeyMap[normTarget]) {
      const origKey = normalizedRowKeyMap[normTarget];
      const val = row[origKey];
      return val !== undefined && val !== null ? String(val).trim() : '';
    }
  }

  // Partial / contains search as fallback
  for (const targetKey of possibleKeys) {
    const normTarget = normalizeKey(targetKey);
    for (const [normRowKey, origKey] of Object.entries(normalizedRowKeyMap)) {
      if (normRowKey.includes(normTarget) || normTarget.includes(normRowKey)) {
        const val = row[origKey];
        if (val !== undefined && val !== null) {
          return String(val).trim();
        }
      }
    }
  }

  return '';
}

// Convert a single raw Excel row into a typed EmployeeRecord
export function mapRowToEmployeeRecord(row: Record<string, any>, index: number, sheetName: string): EmployeeRecord {
  const empNo = extractFieldValue(row, ['EMPLOYEE_NUMBER', 'EMPLOYEE NUMBER', 'EMP NO', 'EMP_NO', 'ID', 'EMPLOYEE ID']) || `EMP-${String(index + 1).padStart(4, '0')}`;
  const fullName = extractFieldValue(row, ['FULL NAME', 'FULL_NAME', 'NAME', 'EMPLOYEE NAME', 'EMP NAME']) || `Employee ${index + 1}`;
  const userStatus = extractFieldValue(row, ['USER STATUS', 'USER_STATUS', 'STATUS', 'EMPLOYEE STATUS']) || 'Active';
  const group = extractFieldValue(row, ['GROUP *', 'GROUP', 'BUSINESS GROUP', 'DIVISION']) || 'General';
  const subGroup = extractFieldValue(row, ['SUB GROUP *', 'SUB GROUP', 'SUB_GROUP', 'DEPARTMENT', 'DEPT']) || 'Operations';
  
  const rawDob = row[Object.keys(row).find(k => normalizeKey(k).includes('birth') || normalizeKey(k).includes('dob')) || ''] || extractFieldValue(row, ['DATE_OF_BIRTH', 'DATE OF BIRTH', 'DOB']);
  const rawHireDate = row[Object.keys(row).find(k => normalizeKey(k).includes('hire') || normalizeKey(k).includes('join')) || ''] || extractFieldValue(row, ['HIRE_DATE', 'HIRE DATE', 'JOINING DATE']);

  const dobParsed = parseExcelDate(rawDob);
  const hireParsed = parseExcelDate(rawHireDate);

  const age = computeAge(dobParsed.dateObj, dobParsed.dateStr);
  const tenureYears = computeTenure(hireParsed.dateObj, hireParsed.dateStr);

  const branchCode = extractFieldValue(row, ['BRANCH_CODE *', 'BRANCH CODE', 'BRANCH_CODE', 'BRANCH ID']) || 'BR-001';
  const accountNo = extractFieldValue(row, ['ACCOUNT_NO', 'ACCOUNT NO', 'ACC NO']);
  const cadre = extractFieldValue(row, ['CADRE', 'STAFF CADRE', 'CATEGORY']) || 'Officer';
  const grade = extractFieldValue(row, ['GRADE', 'PAY GRADE', 'JOB GRADE']) || 'Officer Grade I';
  const locationCode = extractFieldValue(row, ['LOCATION_CODE', 'LOCATION CODE', 'LOCATION']) || 'LOC-01';
  const flagship = extractFieldValue(row, ['FLAGSHIP', 'FLAGSHIP BRANCH', 'IS FLAGSHIP']) || 'Standard';
  const branchCategory = extractFieldValue(row, ['BRANCH_CATEGORY', 'BRANCH CATEGORY', 'CATEGORY']) || 'Urban';
  const region = extractFieldValue(row, ['REGION', 'ZONE', 'PROVINCE']) || 'Central';
  const cluster = extractFieldValue(row, ['CLUS', 'CLUSTER', 'SUB REGION']) || 'Cluster 1';
  const job = extractFieldValue(row, ['JOB', 'JOB ROLE', 'JOB TITLE']) || 'Banking Officer';
  const positionName = extractFieldValue(row, ['Pos_name', 'POS NAME', 'POSITION NAME', 'DESIGNATION']) || job;
  const org = extractFieldValue(row, ['ORG', 'ORGANIZATION', 'COMPANY', 'ENTITY']) || 'Bank Limited';
  const supervisor = extractFieldValue(row, ['SUPERVISOR', 'REPORTING MANAGER', 'MANAGER']) || 'Executive Manager';
  const fatherName = extractFieldValue(row, ['FATHER_NAME', 'FATHER NAME', 'GUARDIAN']);
  
  let gender = extractFieldValue(row, ['GENDER', 'SEX']) || 'Male';
  if (gender.toLowerCase().startsWith('m')) gender = 'Male';
  else if (gender.toLowerCase().startsWith('f')) gender = 'Female';
  else gender = 'Other';

  const nationalIdentity = extractFieldValue(row, ['NATIONAL_IDENTITY', 'CNIC', 'NATIONAL ID', 'SSN']);
  const employmentType = extractFieldValue(row, ['EMPL', 'EMPLOYMENT TYPE', 'EMP TYPE']) || 'Permanent';
  const emailAddress = extractFieldValue(row, ['EMAIL_ADDRESS', 'EMAIL', 'WORK EMAIL']) || `${empNo.toLowerCase()}@organization.com`;
  const contactId = extractFieldValue(row, ['CONTACT_ID', 'CONTACT', 'PHONE', 'MOBILE']);
  const maritalStatus = extractFieldValue(row, ['MARITAL_STATUS', 'MARITAL STATUS', 'MARITAL']) || 'Married';
  const religion = extractFieldValue(row, ['RELIGION']) || 'Islam';

  return {
    employeeNumber: empNo,
    fullName,
    userStatus,
    group,
    subGroup,
    dateOfBirth: dobParsed.dateStr,
    hireDate: hireParsed.dateStr,
    branchCode,
    accountNo,
    cadre,
    grade,
    locationCode,
    flagship,
    branchCategory,
    region,
    cluster,
    job,
    positionName,
    org,
    supervisor,
    fatherName,
    gender,
    nationalIdentity,
    employmentType,
    emailAddress,
    contactId,
    maritalStatus,
    religion,
    age,
    tenureYears,
    ageGroup: getAgeGroup(age),
    tenureGroup: getTenureGroup(tenureYears),
    hireYear: hireParsed.year,
    sheetOrigin: sheetName
  };
}

// Parse entire multi-sheet workbook from ArrayBuffer
export function parseExcelWorkbook(buffer: ArrayBuffer): SheetCollection {
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  const sheetsData: SheetCollection = {};

  workbook.SheetNames.forEach((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

    if (rawRows.length > 0) {
      sheetsData[sheetName] = rawRows.map((row, index) =>
        mapRowToEmployeeRecord(row, index, sheetName)
      );
    }
  });

  return sheetsData;
}

// Export records to Excel file download
export function exportRecordsToExcel(records: EmployeeRecord[], filename: string = 'HR_Workforce_Export.xlsx') {
  const exportData = records.map(r => ({
    'EMPLOYEE_NUMBER': r.employeeNumber,
    'FULL NAME': r.fullName,
    'USER STATUS': r.userStatus,
    'GROUP *': r.group,
    'SUB GROUP *': r.subGroup,
    'DATE_OF_BIRTH': r.dateOfBirth,
    'HIRE_DATE': r.hireDate,
    'BRANCH_CODE *': r.branchCode,
    'ACCOUNT_NO': r.accountNo,
    'CADRE': r.cadre,
    'GRADE': r.grade,
    'LOCATION_CODE': r.locationCode,
    'FLAGSHIP': r.flagship,
    'BRANCH_CATEGORY': r.branchCategory,
    'REGION': r.region,
    'CLUS': r.cluster,
    'JOB': r.job,
    'Pos_name': r.positionName,
    'ORG': r.org,
    'SUPERVISOR': r.supervisor,
    'FATHER_NAME': r.fatherName,
    'GENDER': r.gender,
    'NATIONAL_IDENTITY': r.nationalIdentity,
    'EMPL': r.employmentType,
    'EMAIL_ADDRESS': r.emailAddress,
    'CONTACT_ID': r.contactId,
    'MARITAL_STATUS': r.maritalStatus,
    'RELIGION': r.religion,
    'AGE': r.age,
    'TENURE_YEARS': r.tenureYears
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Filtered Employees');
  XLSX.writeFile(workbook, filename);
}

// Export records to CSV file download
export function exportRecordsToCSV(records: EmployeeRecord[], filename: string = 'HR_Workforce_Export.csv') {
  const exportData = records.map(r => ({
    'EMPLOYEE_NUMBER': r.employeeNumber,
    'FULL NAME': r.fullName,
    'USER STATUS': r.userStatus,
    'GROUP *': r.group,
    'SUB GROUP *': r.subGroup,
    'DATE_OF_BIRTH': r.dateOfBirth,
    'HIRE_DATE': r.hireDate,
    'BRANCH_CODE *': r.branchCode,
    'ACCOUNT_NO': r.accountNo,
    'CADRE': r.cadre,
    'GRADE': r.grade,
    'LOCATION_CODE': r.locationCode,
    'FLAGSHIP': r.flagship,
    'BRANCH_CATEGORY': r.branchCategory,
    'REGION': r.region,
    'CLUS': r.cluster,
    'JOB': r.job,
    'Pos_name': r.positionName,
    'ORG': r.org,
    'SUPERVISOR': r.supervisor,
    'FATHER_NAME': r.fatherName,
    'GENDER': r.gender,
    'NATIONAL_IDENTITY': r.nationalIdentity,
    'EMPL': r.employmentType,
    'EMAIL_ADDRESS': r.emailAddress,
    'CONTACT_ID': r.contactId,
    'MARITAL_STATUS': r.maritalStatus,
    'RELIGION': r.religion,
    'AGE': r.age,
    'TENURE_YEARS': r.tenureYears
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const csvContent = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
