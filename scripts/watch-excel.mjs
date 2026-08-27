import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import * as XLSX from 'xlsx';

// Initialize data directory & database
const DB_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'workforce.db');
const db = new DatabaseSync(DB_PATH);

// Ensure tables exist
db.exec(`
  CREATE TABLE IF NOT EXISTS workforce_metadata (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_number TEXT NOT NULL,
    full_name TEXT NOT NULL,
    user_status TEXT NOT NULL,
    group_name TEXT NOT NULL,
    sub_group TEXT NOT NULL,
    date_of_birth TEXT NOT NULL,
    hire_date TEXT NOT NULL,
    branch_code TEXT NOT NULL,
    account_no TEXT,
    cadre TEXT NOT NULL,
    grade TEXT NOT NULL,
    location_code TEXT,
    flagship TEXT,
    branch_category TEXT,
    region TEXT NOT NULL,
    cluster TEXT NOT NULL,
    job TEXT NOT NULL,
    position_name TEXT NOT NULL,
    org TEXT NOT NULL,
    supervisor TEXT,
    father_name TEXT,
    gender TEXT NOT NULL,
    national_identity TEXT,
    employment_type TEXT NOT NULL,
    email_address TEXT,
    contact_id TEXT,
    marital_status TEXT,
    religion TEXT,
    age INTEGER NOT NULL,
    tenure_years REAL NOT NULL,
    age_group TEXT NOT NULL,
    tenure_group TEXT NOT NULL,
    hire_year TEXT NOT NULL,
    sheet_origin TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_sheet_origin ON employees(sheet_origin);
  CREATE INDEX IF NOT EXISTS idx_employee_number ON employees(employee_number);
`);

// Date & Demographic helpers
function parseExcelDate(val) {
  if (!val) return { dateStr: 'N/A', year: 'N/A' };
  if (val instanceof Date && !isNaN(val.getTime())) {
    const yyyy = val.getFullYear();
    const mm = String(val.getMonth() + 1).padStart(2, '0');
    const dd = String(val.getDate()).padStart(2, '0');
    return { dateStr: `${yyyy}-${mm}-${dd}`, year: String(yyyy) };
  }
  if (typeof val === 'number') {
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    if (!isNaN(date.getTime())) {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      return { dateStr: `${yyyy}-${mm}-${dd}`, year: String(yyyy) };
    }
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      const yyyy = parsed.getFullYear();
      const mm = String(parsed.getMonth() + 1).padStart(2, '0');
      const dd = String(parsed.getDate()).padStart(2, '0');
      return { dateStr: `${yyyy}-${mm}-${dd}`, year: String(yyyy) };
    }
    return { dateStr: trimmed, year: trimmed.substring(0, 4) || 'N/A' };
  }
  return { dateStr: String(val), year: 'N/A' };
}

function computeAge(dobStr) {
  const now = new Date();
  const yearMatch = dobStr.match(/\b(19\d{2}|20\d{2})\b/);
  if (yearMatch) {
    const birthYear = parseInt(yearMatch[1], 10);
    return Math.max(18, Math.min(80, now.getFullYear() - birthYear));
  }
  return 32;
}

function computeTenure(hireStr) {
  const now = new Date();
  const yearMatch = hireStr.match(/\b(19\d{2}|20\d{2})\b/);
  if (yearMatch) {
    const hireYear = parseInt(yearMatch[1], 10);
    return Math.max(0, now.getFullYear() - hireYear);
  }
  return 3.0;
}

function getAgeGroup(age) {
  if (age < 25) return '< 25 yrs';
  if (age <= 34) return '25 - 34 yrs';
  if (age <= 44) return '35 - 44 yrs';
  if (age <= 54) return '45 - 54 yrs';
  return '55+ yrs';
}

function getTenureGroup(tenureYears) {
  if (tenureYears < 1) return '< 1 Year';
  if (tenureYears <= 3) return '1 - 3 Years';
  if (tenureYears <= 5) return '3 - 5 Years';
  if (tenureYears <= 10) return '5 - 10 Years';
  return '10+ Years';
}

function normalizeKey(key) {
  return String(key).toLowerCase().replace(/[*_]/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractFieldValue(row, possibleKeys) {
  const rowKeys = Object.keys(row);
  const map = {};
  for (const k of rowKeys) {
    map[normalizeKey(k)] = k;
  }
  for (const targetKey of possibleKeys) {
    const normTarget = normalizeKey(targetKey);
    if (map[normTarget]) {
      const val = row[map[normTarget]];
      return val !== undefined && val !== null ? String(val).trim() : '';
    }
  }
  return '';
}

// Function to sync an Excel file into SQLite
export function syncExcelToSQLite(filePath) {
  const resolvedPath = path.resolve(filePath);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`\x1b[31m[Excel Watcher Error]\x1b[0m File not found: ${resolvedPath}`);
    return false;
  }

  const startTime = Date.now();
  const fileName = path.basename(resolvedPath);

  try {
    const buffer = fs.readFileSync(resolvedPath);
    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });

    db.exec('BEGIN TRANSACTION;');
    db.exec('DELETE FROM employees;');
    db.exec('DELETE FROM workforce_metadata;');

    const now = new Date().toISOString();
    const insertMeta = db.prepare('INSERT INTO workforce_metadata (key, value, updated_at) VALUES (?, ?, ?)');
    insertMeta.run('file_name', fileName, now);
    insertMeta.run('last_updated', now, now);

    const insertEmp = db.prepare(`
      INSERT INTO employees (
        employee_number, full_name, user_status, group_name, sub_group,
        date_of_birth, hire_date, branch_code, account_no, cadre, grade,
        location_code, flagship, branch_category, region, cluster, job,
        position_name, org, supervisor, father_name, gender, national_identity,
        employment_type, email_address, contact_id, marital_status, religion,
        age, tenure_years, age_group, tenure_group, hire_year, sheet_origin
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?
      )
    `);

    let totalCount = 0;
    const sheetNames = workbook.SheetNames;

    for (const sheetName of sheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      for (let i = 0; i < rawRows.length; i++) {
        const row = rawRows[i];
        const empNo = extractFieldValue(row, ['EMPLOYEE_NUMBER', 'EMPLOYEE NUMBER', 'EMP NO', 'ID']) || `EMP-${totalCount + 1}`;
        const fullName = extractFieldValue(row, ['FULL NAME', 'NAME', 'EMPLOYEE NAME']) || `Employee ${totalCount + 1}`;
        const userStatus = extractFieldValue(row, ['USER STATUS', 'STATUS']) || 'Active';
        const group = extractFieldValue(row, ['GROUP *', 'GROUP', 'DIVISION']) || 'General';
        const subGroup = extractFieldValue(row, ['SUB GROUP *', 'SUB GROUP', 'DEPARTMENT']) || 'Operations';
        
        const dobParsed = parseExcelDate(row[Object.keys(row).find(k => normalizeKey(k).includes('birth') || normalizeKey(k).includes('dob'))] || extractFieldValue(row, ['DATE_OF_BIRTH', 'DOB']));
        const hireParsed = parseExcelDate(row[Object.keys(row).find(k => normalizeKey(k).includes('hire') || normalizeKey(k).includes('join'))] || extractFieldValue(row, ['HIRE_DATE']));

        const age = computeAge(dobParsed.dateStr);
        const tenureYears = computeTenure(hireParsed.dateStr);

        const branchCode = extractFieldValue(row, ['BRANCH_CODE *', 'BRANCH CODE', 'BRANCH_CODE']) || 'BR-001';
        const accountNo = extractFieldValue(row, ['ACCOUNT_NO', 'ACCOUNT NO']);
        const cadre = extractFieldValue(row, ['CADRE', 'CATEGORY']) || 'Officer';
        const grade = extractFieldValue(row, ['GRADE', 'JOB GRADE']) || 'Officer Grade I';
        const locationCode = extractFieldValue(row, ['LOCATION_CODE', 'LOCATION']) || 'LOC-01';
        const flagship = extractFieldValue(row, ['FLAGSHIP']) || 'Standard';
        const branchCategory = extractFieldValue(row, ['BRANCH_CATEGORY']) || 'Urban';
        const region = extractFieldValue(row, ['REGION', 'ZONE']) || 'Central';
        const cluster = extractFieldValue(row, ['CLUS', 'CLUSTER']) || 'Cluster 1';
        const job = extractFieldValue(row, ['JOB', 'JOB ROLE']) || 'Banking Officer';
        const positionName = extractFieldValue(row, ['Pos_name', 'POSITION NAME']) || job;
        const org = extractFieldValue(row, ['ORG', 'COMPANY']) || 'Organization Ltd';
        const supervisor = extractFieldValue(row, ['SUPERVISOR', 'MANAGER']) || '';
        const fatherName = extractFieldValue(row, ['FATHER_NAME', 'FATHER NAME']);

        let gender = extractFieldValue(row, ['GENDER', 'SEX']) || 'Male';
        if (gender.toLowerCase().startsWith('m')) gender = 'Male';
        else if (gender.toLowerCase().startsWith('f')) gender = 'Female';

        const nationalIdentity = extractFieldValue(row, ['NATIONAL_IDENTITY', 'CNIC']);
        const employmentType = extractFieldValue(row, ['EMPL', 'EMPLOYMENT TYPE']) || 'Permanent';
        const emailAddress = extractFieldValue(row, ['EMAIL_ADDRESS', 'EMAIL']) || `${empNo.toLowerCase()}@organization.com`;
        const contactId = extractFieldValue(row, ['CONTACT_ID', 'PHONE']);
        const maritalStatus = extractFieldValue(row, ['MARITAL_STATUS', 'MARITAL']) || 'Married';
        const religion = extractFieldValue(row, ['RELIGION']) || 'Islam';

        insertEmp.run(
          empNo, fullName, userStatus, group, subGroup,
          dobParsed.dateStr, hireParsed.dateStr, branchCode, accountNo, cadre, grade,
          locationCode, flagship, branchCategory, region, cluster, job,
          positionName, org, supervisor, fatherName, gender, nationalIdentity,
          employmentType, emailAddress, contactId, maritalStatus, religion,
          age, tenureYears, getAgeGroup(age), getTenureGroup(tenureYears), hireParsed.year,
          sheetName
        );
        totalCount++;
      }
    }

    db.exec('COMMIT;');
    const duration = Date.now() - startTime;
    console.log(`\x1b[32m[Excel Watcher]\x1b[0m ✅ Synced \x1b[1m${totalCount} records\x1b[0m across \x1b[1m${sheetNames.length} sheet(s)\x1b[0m from "${fileName}" to SQLite in ${duration}ms (${new Date().toLocaleTimeString()})`);
    return true;
  } catch (err) {
    db.exec('ROLLBACK;');
    console.error(`\x1b[31m[Excel Watcher Error]\x1b[0m Failed to sync spreadsheet:`, err.message);
    return false;
  }
}

// Watcher execution
const targetPath = process.env.EXCEL_SOURCE_PATH || process.argv[2] || path.join(process.cwd(), 'data', 'workforce.xlsx');
const resolvedTarget = path.resolve(targetPath);

console.log(`\n\x1b[36m===================================================\x1b[0m`);
console.log(`\x1b[36m  Apex HR • Excel to SQLite Auto-Sync Engine\x1b[0m`);
console.log(`\x1b[36m===================================================\x1b[0m`);
console.log(`\x1b[33m[Target Spreadsheet]:\x1b[0m ${resolvedTarget}`);
console.log(`\x1b[33m[SQLite Database]:\x1b[0m    ${DB_PATH}\n`);

// Perform initial sync if file exists
if (fs.existsSync(resolvedTarget)) {
  syncExcelToSQLite(resolvedTarget);
} else {
  console.log(`\x1b[33m[Notice]\x1b[0m Target file does not exist yet. Waiting for you to save it at:\n  -> ${resolvedTarget}`);
}

console.log(`\n\x1b[32m[Watching Active]\x1b[0m Whenever you press [Ctrl + S] in Excel, your database will update automatically.\n`);

let debounceTimer = null;

// Watch file for changes
fs.watchFile(resolvedTarget, { interval: 800 }, (curr, prev) => {
  if (curr.mtimeMs !== prev.mtimeMs && curr.size > 0) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      syncExcelToSQLite(resolvedTarget);
    }, 400);
  }
});
