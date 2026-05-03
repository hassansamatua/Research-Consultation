import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Check if tables exist
    const tables = await executeQuery(`
      SHOW TABLES LIKE '%student%' OR SHOW TABLES LIKE '%user%' OR SHOW TABLES LIKE '%supervisor%'
    `);

    // Check students table structure
    let studentsStructure = null;
    try {
      studentsStructure = await executeQuery('DESCRIBE students');
    } catch (error) {
      studentsStructure = { error: 'Students table does not exist' };
    }

    // Check users table structure
    let usersStructure = null;
    try {
      usersStructure = await executeQuery('DESCRIBE users');
    } catch (error) {
      usersStructure = { error: 'Users table does not exist' };
    }

    // Check supervisors table structure
    let supervisorsStructure = null;
    try {
      supervisorsStructure = await executeQuery('DESCRIBE supervisors');
    } catch (error) {
      supervisorsStructure = { error: 'Supervisors table does not exist' };
    }

    return NextResponse.json({
      tables: tables,
      studentsStructure: studentsStructure,
      usersStructure: usersStructure,
      supervisorsStructure: supervisorsStructure,
      message: 'Database table information'
    });

  } catch (error) {
    console.error('Check tables error:', error);
    return NextResponse.json(
      { error: 'Failed to check tables', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
