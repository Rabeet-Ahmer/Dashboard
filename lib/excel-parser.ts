import * as XLSX from 'xlsx';
import { EmployeeRecord, SheetCollection } from '@/types/hr';

// Utility to parse Excel serial dates, JS Date objects, or date strings with zero fake generation
export function parseExcelDate(val: any): { dateStr: string; year: string; dateObj: Date | null } {
  if (val === null || val === undefined || val === '') {
    return { dateStr: 'N/A', year: 'N/A', dateObj: null };
  }

  // If already a valid Date object
  if (val instanceof Date && !isNaN(val.getTime())) {
    const yyyy = val.getFullYear();
    const mm = String(val.getMonth() + 1).padStart(2, '0');
    const dd = String(val.getDate()).padStart(2, '0');
    return { dateStr: `${yyyy}-${mm}-${dd}`, year: String(yyyy), dateObj: val };
  }

  // If number (Excel serial date, e.g. 44561)
  if (typeof val === 'number') {
    if (val < 1 || isNaN(val)) {
      return { dateStr: 'N/A', year: 'N/A', dateObj: null };
    }
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    if (!isNaN(date.getTime()) && date.getFullYear() >= 1900 && date.getFullYear() <= 2100) {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      return { dateStr: `${yyyy}-${mm}-${dd}`, year: String(yyyy), dateObj: date };
    }
  }

  // If string
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed || trimmed.toLowerCase() === 'n/a' || trimmed === '-' || trimmed.toLowerCase() === 'null' || trimmed.toLowerCase() === 'undefined') {
      return { dateStr: 'N/A', year: 'N/A', dateObj: null };
    }

    // Try standard ISO or parseable format
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime()) && parsed.getFullYear() >= 1900 && parsed.getFullYear() <= 2100) {
      const yyyy = parsed.getFullYear();
      const mm = String(parsed.getMonth() + 1).padStart(2, '0');
      const dd = String(parsed.getDate()).padStart(2, '0');
      return { dateStr: `${yyyy}-${mm}-${dd}`, year: String(yyyy), dateObj: parsed };
    }

    // Match YYYY-MM-DD or DD/MM/YYYY or MM/DD/YYYY via regex
    const dmyMatch = trimmed.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
    if (dmyMatch) {
      const p1 = parseInt(dmyMatch[1], 10);
      const p2 = parseInt(dmyMatch[2], 10);
      const yyyy = dmyMatch[3];
      const mm = p1 > 12 ? String(p2).padStart(2, '0') : String(p1).padStart(2, '0');
      const dd = p1 > 12 ? String(p1).padStart(2, '0') : String(p2).padStart(2, '0');
      return { dateStr: `${yyyy}-${mm}-${dd}`, year: yyyy, dateObj: new Date(`${yyyy}-${mm}-${dd}`) };
    }

    // Extract any 4-digit year as fallback
    const yearMatch = trimmed.match(/\b(19\d{2}|20\d{2})\b/);
    if (yearMatch) {
      return { dateStr: trimmed, year: yearMatch[1], dateObj: null };
    }

    return { dateStr: trimmed, year: 'N/A', dateObj: null };
  }

  return { dateStr: String(val).trim() || 'N/A', year: 'N/A', dateObj: null };
}

// Compute Age from DOB - returns 0 if date is missing/invalid
export function computeAge(dobDateObj: Date | null, dobStr: string): number {
  if (!dobStr || dobStr === 'N/A') return 0;
  const currentYear = new Date().getFullYear();
  if (dobDateObj && !isNaN(dobDateObj.getTime())) {
    const now = new Date();
    let age = now.getFullYear() - dobDateObj.getFullYear();
    const m = now.getMonth() - dobDateObj.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dobDateObj.getDate())) {
      age--;
    }
    if (age >= 10 && age <= 120) return age;
  }
  const yearMatch = dobStr.match(/\b(19\d{2}|20\d{2})\b/);
  if (yearMatch) {
    const birthYear = parseInt(yearMatch[1], 10);
    const calculatedAge = currentYear - birthYear;
    if (calculatedAge >= 10 && calculatedAge <= 120) return calculatedAge;
  }
  return 0;
}

// Compute Tenure from Hire Date - returns 0 if date is missing/invalid
export function computeTenure(hireDateObj: Date | null, hireStr: string): number {
  if (!hireStr || hireStr === 'N/A') return 0;
  const currentYear = new Date().getFullYear();
  if (hireDateObj && !isNaN(hireDateObj.getTime())) {
    const diffMs = new Date().getTime() - hireDateObj.getTime();
    const years = diffMs / (1000 * 60 * 60 * 24 * 365.25);
    if (years >= 0 && years <= 70) {
      return Math.max(0, parseFloat(years.toFixed(1)));
    }
  }
  const yearMatch = hireStr.match(/\b(19\d{2}|20\d{2})\b/);
  if (yearMatch) {
    const hireYear = parseInt(yearMatch[1], 10);
    const calculatedTenure = Math.max(0, currentYear - hireYear);
    if (calculatedTenure <= 70) return parseFloat(calculatedTenure.toFixed(1));
  }
  return 0;
}

export function getAgeGroup(age: number): string {
  if (!age || age <= 0) return 'N/A';
  if (age < 25) return '< 25 yrs';
  if (age <= 34) return '25 - 34 yrs';
  if (age <= 44) return '35 - 44 yrs';
  if (age <= 54) return '45 - 54 yrs';
  return '55+ yrs';
}

export function getTenureGroup(tenureYears: number): string {
  if (!tenureYears || tenureYears <= 0) return 'N/A';
  if (tenureYears < 1) return '< 1 Year';
  if (tenureYears <= 3) return '1 - 3 Years';
  if (tenureYears <= 5) return '3 - 5 Years';
  if (tenureYears <= 10) return '5 - 10 Years';
  return '10+ Years';
}

// Normalize column key (removes special chars, extra spaces, lowercase)
function normalizeKey(key: string): string {
  return String(key)
    .toLowerCase()
    .replace(/[*_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Value extractor: returns exact string value from row or 'N/A' if missing / empty
function extractFieldValue(row: Record<string, any>, possibleKeys: string[]): string {
  if (!row || typeof row !== 'object') return 'N/A';

  const rowKeys = Object.keys(row);
  const normalizedRowKeyMap: Record<string, string> = {};
  for (const k of rowKeys) {
    normalizedRowKeyMap[normalizeKey(k)] = k;
  }

  // 1. Exact normalized match
  for (const targetKey of possibleKeys) {
    const normTarget = normalizeKey(targetKey);
    if (normalizedRowKeyMap[normTarget] !== undefined) {
      const origKey = normalizedRowKeyMap[normTarget];
      const val = row[origKey];
      if (val !== undefined && val !== null) {
        const strVal = String(val).trim();
        if (strVal !== '' && strVal.toLowerCase() !== 'null' && strVal.toLowerCase() !== 'undefined') {
          return strVal;
        }
      }
    }
  }

  // 2. Contains match fallback
  for (const targetKey of possibleKeys) {
    const normTarget = normalizeKey(targetKey);
    for (const [normRowKey, origKey] of Object.entries(normalizedRowKeyMap)) {
      if (normRowKey === normTarget || normRowKey.includes(normTarget) || normTarget.includes(normRowKey)) {
        const val = row[origKey];
        if (val !== undefined && val !== null) {
          const strVal = String(val).trim();
          if (strVal !== '' && strVal.toLowerCase() !== 'null' && strVal.toLowerCase() !== 'undefined') {
            return strVal;
          }
        }
      }
    }
  }

  return 'N/A';
}

// Convert a single raw Excel row into a typed EmployeeRecord matching the 29-column schema (NO auto-generated values)
export function mapRowToEmployeeRecord(row: Record<string, any>, index: number, sheetName: string): EmployeeRecord {
  // 1. EMPLOYEE_NUMBER
  const empNo = extractFieldValue(row, ['EMPLOYEE_NUMBER', 'EMPLOYEE NUMBER', 'EMP NO', 'EMP_NO', 'ID', 'EMPLOYEE ID']);

  // 2. TITLE
  const rawTitle = extractFieldValue(row, ['TITLE', 'SALUTATION', 'PREFIX']);
  const title = rawTitle !== 'N/A' ? rawTitle : '';

  // 3. FULL_NAME
  let fullName = extractFieldValue(row, ['FULL_NAME', 'FULL NAME', 'NAME', 'EMPLOYEE NAME', 'EMP NAME']);
  if (fullName === 'N/A') {
    const firstName = extractFieldValue(row, ['FIRST_NAME', 'FIRST NAME', 'FNAME']);
    const lastName = extractFieldValue(row, ['LAST_NAME', 'LAST NAME', 'LNAME']);
    if (firstName !== 'N/A' || lastName !== 'N/A') {
      fullName = `${firstName !== 'N/A' ? firstName : ''} ${lastName !== 'N/A' ? lastName : ''}`.trim() || 'N/A';
    }
  }

  // 4. USER_STATUS
  const rawStatus = extractFieldValue(row, ['USER_STATUS', 'USER STATUS', 'STATUS', 'EMPLOYEE STATUS']);
  const userStatus = rawStatus !== 'N/A' ? rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase() : 'N/A';

  // 5. GROUP
  const group = extractFieldValue(row, ['GROUP', 'GROUP *', 'BUSINESS GROUP', 'DIVISION', 'BUSINESS_GROUP']);

  // 6. SUB_GROUP
  const subGroup = extractFieldValue(row, ['SUB_GROUP', 'SUB GROUP', 'SUB GROUP *', 'DEPARTMENT', 'DEPT', 'SUB_DEPARTMENT']);

  // 7. DATE_OF_BIRTH
  const rawDob = row[Object.keys(row).find(k => normalizeKey(k).includes('birth') || normalizeKey(k).includes('dob')) || ''] || extractFieldValue(row, ['DATE_OF_BIRTH', 'DATE OF BIRTH', 'DOB']);
  const dobParsed = parseExcelDate(rawDob);
  const age = computeAge(dobParsed.dateObj, dobParsed.dateStr);

  // 8. HIRE_DATE
  const rawHireDate = row[Object.keys(row).find(k => normalizeKey(k).includes('hire') || normalizeKey(k).includes('join')) || ''] || extractFieldValue(row, ['HIRE_DATE', 'HIRE DATE', 'JOINING DATE', 'JOIN_DATE']);
  const hireParsed = parseExcelDate(rawHireDate);
  const tenureYears = computeTenure(hireParsed.dateObj, hireParsed.dateStr);

  // 9. BRANCH_CODE
  const branchCode = extractFieldValue(row, ['BRANCH_CODE', 'BRANCH_CODE *', 'BRANCH CODE', 'BRANCH ID', 'BRANCH']);

  // 10. ACCOUNT_NO
  const accountNo = extractFieldValue(row, ['ACCOUNT_NO', 'ACCOUNT NO', 'ACC NO', 'ACCOUNT NUMBER', 'BANK_ACCOUNT']);

  // 11. CADRE
  const cadre = extractFieldValue(row, ['CADRE', 'STAFF CADRE', 'CATEGORY', 'STAFF_CATEGORY']);

  // 12. Grade
  const grade = extractFieldValue(row, ['Grade', 'GRADE', 'PAY GRADE', 'JOB GRADE', 'LEVEL']);

  // 13. LOCATION_CODE
  const locationCode = extractFieldValue(row, ['LOCATION_CODE', 'LOCATION CODE', 'LOCATION', 'LOC CODE']);

  // 14. FLAGSHIP
  const flagship = extractFieldValue(row, ['FLAGSHIP', 'FLAGSHIP BRANCH', 'IS FLAGSHIP', 'FLAGSHIP STATUS']);

  // 15. BRANCH_CATEGORY
  const branchCategory = extractFieldValue(row, ['BRANCH_CATEGORY', 'BRANCH CATEGORY', 'CATEGORY', 'BRANCH TYPE']);

  // 16. Region
  const region = extractFieldValue(row, ['Region', 'REGION', 'ZONE', 'PROVINCE', 'TERRITORY']);

  // 17. CLUS
  const cluster = extractFieldValue(row, ['CLUS', 'CLUSTER', 'SUB REGION', 'AREA']);

  // 18. JOB
  const job = extractFieldValue(row, ['JOB', 'JOB ROLE', 'JOB TITLE', 'ROLE']);

  // 19. Pos_name
  const positionName = extractFieldValue(row, ['Pos_name', 'POS_NAME', 'POS NAME', 'POSITION NAME', 'DESIGNATION', 'TITLE_NAME']);

  // 20. ORG
  const org = extractFieldValue(row, ['ORG', 'ORGANIZATION', 'COMPANY', 'ENTITY', 'BANK']);

  // 21. SUPERVISOR
  const supervisor = extractFieldValue(row, ['SUPERVISOR', 'REPORTING MANAGER', 'MANAGER', 'LINE MANAGER']);

  // 22. FATHER_NAME
  const fatherName = extractFieldValue(row, ['FATHER_NAME', 'FATHER NAME', 'GUARDIAN', 'FATHERS_NAME']);

  // 23. GENDER
  const genderRaw = extractFieldValue(row, ['GENDER', 'SEX']);
  let gender = genderRaw;
  if (genderRaw !== 'N/A') {
    if (genderRaw.toLowerCase().startsWith('f')) gender = 'Female';
    else if (genderRaw.toLowerCase().startsWith('m')) gender = 'Male';
    else gender = genderRaw.charAt(0).toUpperCase() + genderRaw.slice(1).toLowerCase();
  }

  // 24. EMPLOYMENT_CATEGORY
  const employmentCategory = extractFieldValue(row, ['EMPLOYMENT_CATEGORY', 'EMPLOYMENT CATEGORY', 'EMPL', 'EMPLOYMENT TYPE', 'EMP TYPE', 'EMPLOYEE_TYPE']);

  // 25. EMAIL_ADDRESS
  const emailAddress = extractFieldValue(row, ['EMAIL_ADDRESS', 'EMAIL ADDRESS', 'EMAIL', 'WORK EMAIL', 'OFFICIAL_EMAIL']);

  // 26. MARITAL_STATUS
  const maritalStatus = extractFieldValue(row, ['MARITAL_STATUS', 'MARITAL STATUS', 'MARITAL']);

  // 27. NATIONALITY
  const nationality = extractFieldValue(row, ['NATIONALITY', 'CITIZENSHIP', 'COUNTRY']);

  // 28. RELIGION
  const religion = extractFieldValue(row, ['RELIGION', 'FAITH']);

  // 29. NATIONAL_ID
  const nationalId = extractFieldValue(row, ['NATIONAL_ID', 'NATIONAL ID', 'NATIONAL_IDENTITY', 'CNIC', 'SSN', 'PASSPORT_NO', 'IDENTITY_NO']);

  // 30. CONTACT (Phone / Mobile Number)
  const contact = extractFieldValue(row, ['CONTACT', 'CONTACT_NO', 'CONTACT_NUMBER', 'PHONE', 'PHONE_NUMBER', 'MOBILE', 'CELL_NO', 'MOBILE_NO', 'CONTACT NO', 'PHONE NO', 'TEL', 'TELEPHONE']);

  return {
    employeeNumber: empNo,
    title,
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
    employmentCategory,
    emailAddress,
    maritalStatus,
    nationality,
    religion,
    nationalId,
    contact,

    // Derived fields
    age,
    tenureYears,
    ageGroup: getAgeGroup(age),
    tenureGroup: getTenureGroup(tenureYears),
    hireYear: hireParsed.year,
    sheetOrigin: sheetName || 'Default'
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

// Export records to Excel file matching the schema
export function exportRecordsToExcel(records: EmployeeRecord[], filename: string = 'HR_Workforce_Export.xlsx') {
  const exportData = records.map(r => ({
    'EMPLOYEE_NUMBER': r.employeeNumber,
    'TITLE': r.title,
    'FULL_NAME': r.fullName,
    'USER_STATUS': r.userStatus,
    'GROUP': r.group,
    'SUB_GROUP': r.subGroup,
    'DATE_OF_BIRTH': r.dateOfBirth,
    'HIRE_DATE': r.hireDate,
    'BRANCH_CODE': r.branchCode,
    'ACCOUNT_NO': r.accountNo,
    'CADRE': r.cadre,
    'Grade': r.grade,
    'LOCATION_CODE': r.locationCode,
    'FLAGSHIP': r.flagship,
    'BRANCH_CATEGORY': r.branchCategory,
    'Region': r.region,
    'CLUS': r.cluster,
    'JOB': r.job,
    'Pos_name': r.positionName,
    'ORG': r.org,
    'SUPERVISOR': r.supervisor,
    'FATHER_NAME': r.fatherName,
    'GENDER': r.gender,
    'EMPLOYMENT_CATEGORY': r.employmentCategory,
    'EMAIL_ADDRESS': r.emailAddress,
    'CONTACT': r.contact,
    'MARITAL_STATUS': r.maritalStatus,
    'NATIONALITY': r.nationality,
    'RELIGION': r.religion,
    'NATIONAL_ID': r.nationalId
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');
  XLSX.writeFile(workbook, filename);
}

// Export records to CSV file matching the schema
export function exportRecordsToCSV(records: EmployeeRecord[], filename: string = 'HR_Workforce_Export.csv') {
  const exportData = records.map(r => ({
    'EMPLOYEE_NUMBER': r.employeeNumber,
    'TITLE': r.title,
    'FULL_NAME': r.fullName,
    'USER_STATUS': r.userStatus,
    'GROUP': r.group,
    'SUB_GROUP': r.subGroup,
    'DATE_OF_BIRTH': r.dateOfBirth,
    'HIRE_DATE': r.hireDate,
    'BRANCH_CODE': r.branchCode,
    'ACCOUNT_NO': r.accountNo,
    'CADRE': r.cadre,
    'Grade': r.grade,
    'LOCATION_CODE': r.locationCode,
    'FLAGSHIP': r.flagship,
    'BRANCH_CATEGORY': r.branchCategory,
    'Region': r.region,
    'CLUS': r.cluster,
    'JOB': r.job,
    'Pos_name': r.positionName,
    'ORG': r.org,
    'SUPERVISOR': r.supervisor,
    'FATHER_NAME': r.fatherName,
    'GENDER': r.gender,
    'EMPLOYMENT_CATEGORY': r.employmentCategory,
    'EMAIL_ADDRESS': r.emailAddress,
    'CONTACT': r.contact,
    'MARITAL_STATUS': r.maritalStatus,
    'NATIONALITY': r.nationality,
    'RELIGION': r.religion,
    'NATIONAL_ID': r.nationalId
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
