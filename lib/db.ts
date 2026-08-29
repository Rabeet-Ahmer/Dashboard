import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { EmployeeRecord, SheetCollection } from '@/types/hr';

function getDbPath(): string {
  // On Vercel or AWS serverless environments, /tmp is the only writable filesystem location
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === 'production') {
    return path.join(os.tmpdir(), 'workforce.db');
  }

  // Local development fallback
  try {
    const localDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    return path.join(localDir, 'workforce.db');
  } catch (e) {
    return path.join(os.tmpdir(), 'workforce.db');
  }
}

let _db: DatabaseSync | null = null;

export function getDatabase(): DatabaseSync {
  if (!_db) {
    const dbPath = getDbPath();
    _db = new DatabaseSync(dbPath);
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

  // Check if existing employees table has old schema missing newly added columns
  try {
    const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='employees'").all();
    if (tableCheck.length > 0) {
      const cols = db.prepare("PRAGMA table_info(employees)").all() as { name: string }[];
      const colNames = new Set(cols.map(c => c.name));
      const requiredCols = ['title', 'nationality', 'religion', 'national_id', 'employment_category'];
      const isMissingColumns = requiredCols.some(c => !colNames.has(c));
      if (isMissingColumns) {
        db.exec('DROP TABLE IF EXISTS employees;');
        db.exec('DELETE FROM workforce_metadata;');
      }
    }
  } catch (e) {
    // If error inspecting schema, safely reset
    try {
      db.exec('DROP TABLE IF EXISTS employees;');
    } catch (_) {}
  }

  // Create Employees table with full 29 schema fields
  db.exec(`
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_number TEXT NOT NULL,
      title TEXT,
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
      employment_category TEXT NOT NULL,
      email_address TEXT,
      marital_status TEXT,
      nationality TEXT,
      religion TEXT,
      national_id TEXT,
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
  try {
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
        title,
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
        employment_category as employmentCategory,
        email_address as emailAddress,
        marital_status as maritalStatus,
        nationality,
        religion,
        national_id as nationalId,
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
  } catch (error) {
    console.warn('Notice: SQLite workforce database uninitialized or empty:', error);
    return {
      sheets: {},
      fileName: '',
      totalCount: 0,
      updatedAt: ''
    };
  }
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

    // 3. Insert employees with strict N/A for missing fields
    const insertEmp = db.prepare(`
      INSERT INTO employees (
        employee_number, title, full_name, user_status, group_name, sub_group,
        date_of_birth, hire_date, branch_code, account_no, cadre, grade,
        location_code, flagship, branch_category, region, cluster, job,
        position_name, org, supervisor, father_name, gender, employment_category,
        email_address, marital_status, nationality, religion, national_id,
        age, tenure_years, age_group, tenure_group, hire_year, sheet_origin
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
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
          r.employeeNumber || 'N/A',
          r.title || '',
          r.fullName || 'N/A',
          r.userStatus || 'N/A',
          r.group || 'N/A',
          r.subGroup || 'N/A',
          r.dateOfBirth || 'N/A',
          r.hireDate || 'N/A',
          r.branchCode || 'N/A',
          r.accountNo || 'N/A',
          r.cadre || 'N/A',
          r.grade || 'N/A',
          r.locationCode || 'N/A',
          r.flagship || 'N/A',
          r.branchCategory || 'N/A',
          r.region || 'N/A',
          r.cluster || 'N/A',
          r.job || 'N/A',
          r.positionName || 'N/A',
          r.org || 'N/A',
          r.supervisor || 'N/A',
          r.fatherName || 'N/A',
          r.gender || 'N/A',
          r.employmentCategory || 'N/A',
          r.emailAddress || 'N/A',
          r.maritalStatus || 'N/A',
          r.nationality || 'N/A',
          r.religion || 'N/A',
          r.nationalId || 'N/A',
          r.age || 0,
          r.tenureYears || 0,
          r.ageGroup || 'N/A',
          r.tenureGroup || 'N/A',
          r.hireYear || 'N/A',
          sheetName || 'Default'
        );
        count++;
      }
    }

    db.exec('COMMIT;');
    return { totalCount: count };
  } catch (error) {
    try {
      db.exec('ROLLBACK;');
    } catch (_) {}
    throw error;
  }
}

export function clearWorkforceData(): void {
  try {
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
  } catch (e) {
    console.warn('Notice: Could not clear SQLite database:', e);
  }
}
