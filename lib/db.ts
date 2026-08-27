// `node:sqlite` is available at runtime in supported Node.js versions, but
// older Node.js type definitions may not declare the built-in module yet.
// @ts-expect-error -- supported runtime module missing from older type definitions
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { EmployeeRecord, SheetCollection } from '@/types/hr';

// Ensure data directory exists in project root
const DB_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'workforce.db');

let _db: DatabaseSync | null = null;

export function getDatabase(): DatabaseSync {
  if (!_db) {
    _db = new DatabaseSync(DB_PATH);
    initSchema(_db);
  }
  return _db;
}

function initSchema(db: DatabaseSync) {
  // Metadata table
  db.exec(`
    CREATE TABLE IF NOT EXISTS workforce_metadata (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Employees table
  db.exec(`
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
    CREATE INDEX IF NOT EXISTS idx_region ON employees(region);
  `);
}

export interface WorkforceDBResponse {
  sheets: SheetCollection;
  fileName: string;
  totalCount: number;
  updatedAt: string;
}

export function getWorkforceData(): WorkforceDBResponse {
  const db = getDatabase();

  // Get metadata
  const metaStmt = db.prepare('SELECT key, value, updated_at FROM workforce_metadata');
  const metaRows = metaStmt.all() as { key: string; value: string; updated_at: string }[];
  
  let fileName = 'workforce.xlsx';
  let updatedAt = '';

  for (const row of metaRows) {
    if (row.key === 'file_name') fileName = row.value;
    if (row.key === 'last_updated') updatedAt = row.value;
  }

  // Get all employees
  const empStmt = db.prepare(`
    SELECT
      employee_number as employeeNumber,
      full_name as fullName,
      user_status as userStatus,
      group_name as "group",
      sub_group as subGroup,
      date_of_birth as dateOfBirth,
      hire_date as hireDate,
      branch_code as branchCode,
      account_no as accountNo,
      cadre,
      grade,
      location_code as locationCode,
      flagship,
      branch_category as branchCategory,
      region,
      cluster,
      job,
      position_name as positionName,
      org,
      supervisor,
      father_name as fatherName,
      gender,
      national_identity as nationalIdentity,
      employment_type as employmentType,
      email_address as emailAddress,
      contact_id as contactId,
      marital_status as maritalStatus,
      religion,
      age,
      tenure_years as tenureYears,
      age_group as ageGroup,
      tenure_group as tenureGroup,
      hire_year as hireYear,
      sheet_origin as sheetOrigin
    FROM employees
    ORDER BY id ASC
  `);

  const rows = empStmt.all() as EmployeeRecord[];
  const sheets: SheetCollection = {};

  for (const row of rows) {
    const origin = row.sheetOrigin || 'Default';
    if (!sheets[origin]) {
      sheets[origin] = [];
    }
    sheets[origin].push(row);
  }

  return {
    sheets,
    fileName,
    totalCount: rows.length,
    updatedAt
  };
}

export function saveWorkforceData(sheets: SheetCollection, fileName: string): { totalCount: number } {
  const db = getDatabase();
  const now = new Date().toISOString();

  // Begin transaction
  db.exec('BEGIN TRANSACTION;');

  try {
    // 1. Wipe existing data
    db.exec('DELETE FROM employees;');
    db.exec('DELETE FROM workforce_metadata;');

    // 2. Insert metadata
    const insertMeta = db.prepare('INSERT INTO workforce_metadata (key, value, updated_at) VALUES (?, ?, ?)');
    insertMeta.run('file_name', fileName, now);
    insertMeta.run('last_updated', now, now);

    // 3. Insert employees
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

    let count = 0;
    for (const [sheetName, records] of Object.entries(sheets)) {
      for (const r of records) {
        insertEmp.run(
          r.employeeNumber || `EMP-${count + 1}`,
          r.fullName || '',
          r.userStatus || 'Active',
          r.group || '',
          r.subGroup || '',
          r.dateOfBirth || '',
          r.hireDate || '',
          r.branchCode || '',
          r.accountNo || '',
          r.cadre || '',
          r.grade || '',
          r.locationCode || '',
          r.flagship || '',
          r.branchCategory || '',
          r.region || '',
          r.cluster || '',
          r.job || '',
          r.positionName || '',
          r.org || '',
          r.supervisor || '',
          r.fatherName || '',
          r.gender || 'Male',
          r.nationalIdentity || '',
          r.employmentType || 'Permanent',
          r.emailAddress || '',
          r.contactId || '',
          r.maritalStatus || '',
          r.religion || '',
          r.age || 30,
          r.tenureYears || 1.0,
          r.ageGroup || '',
          r.tenureGroup || '',
          r.hireYear || '',
          sheetName
        );
        count++;
      }
    }

    db.exec('COMMIT;');
    return { totalCount: count };
  } catch (error) {
    db.exec('ROLLBACK;');
    throw error;
  }
}

export function clearWorkforceData(): void {
  const db = getDatabase();
  db.exec('BEGIN TRANSACTION;');
  try {
    db.exec('DELETE FROM employees;');
    db.exec('DELETE FROM workforce_metadata;');
    db.exec('COMMIT;');
  } catch (error) {
    db.exec('ROLLBACK;');
    throw error;
  }
}
