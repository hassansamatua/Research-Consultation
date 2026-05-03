import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Check if supervisor_allocations table exists and get its structure
    let tableStructure = null;
    try {
      tableStructure = await executeQuery('DESCRIBE supervisor_allocations');
    } catch (error) {
      tableStructure = { error: 'supervisor_allocations table does not exist' };
    }

    // Try to get some sample data if table exists
    let sampleData = null;
    try {
      sampleData = await executeQuery('SELECT * FROM supervisor_allocations LIMIT 5');
    } catch (error) {
      sampleData = { error: 'Could not fetch sample data' };
    }

    return NextResponse.json({
      tableStructure: tableStructure,
      sampleData: sampleData,
      message: 'Supervisor allocations table information'
    });

  } catch (error) {
    console.error('Debug supervisor allocations table error:', error);
    return NextResponse.json(
      { error: 'Failed to debug table', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
