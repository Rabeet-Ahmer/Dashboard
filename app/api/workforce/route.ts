import { NextResponse } from 'next/server';
import { getWorkforceData, clearWorkforceData } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = getWorkforceData();
    return NextResponse.json({
      success: true,
      data
    });
  } catch (error: any) {
    console.error('Error in /api/workforce GET:', error);
    // Graceful fallback so first-load never crashes with 500
    return NextResponse.json({
      success: true,
      data: {
        sheets: {},
        fileName: '',
        totalCount: 0,
        updatedAt: ''
      }
    });
  }
}

export async function DELETE() {
  try {
    clearWorkforceData();
    return NextResponse.json({
      success: true,
      message: 'Workforce data cleared from SQLite database.'
    });
  } catch (error: any) {
    console.error('Error clearing workforce data:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to clear workforce data' },
      { status: 500 }
    );
  }
}
