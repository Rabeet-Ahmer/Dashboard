import { NextRequest, NextResponse } from 'next/server';
import { parseExcelWorkbook } from '@/lib/excel-parser';
import { saveWorkforceData } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No spreadsheet file provided.' },
        { status: 400 }
      );
    }

    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file format. Please upload .xlsx, .xls, or .csv' },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const parsedSheets = parseExcelWorkbook(buffer);

    const sheetNames = Object.keys(parsedSheets);
    if (sheetNames.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid data or sheets found in uploaded spreadsheet.' },
        { status: 400 }
      );
    }

    const { totalCount } = saveWorkforceData(parsedSheets, file.name);

    return NextResponse.json({
      success: true,
      fileName: file.name,
      sheets: parsedSheets,
      totalCount,
      message: `Successfully synced ${totalCount} records across ${sheetNames.length} sheet(s) to SQLite database.`
    });
  } catch (error: any) {
    console.error('Error handling upload:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to process and store spreadsheet.' },
      { status: 500 }
    );
  }
}
