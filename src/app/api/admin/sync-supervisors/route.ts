import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware';
import { syncSupervisorRecords } from '@/lib/supervisorSync';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user (only admin can sync)
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!['admin', 'super_admin'].includes(user.role_name)) {
      return NextResponse.json(
        { error: 'Access denied. Only administrators can sync supervisor records.' },
        { status: 403 }
      );
    }

    console.log('🔧 Admin user requested supervisor sync:', user.first_name, user.last_name);

    // Sync supervisor records
    const result = await syncSupervisorRecords();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Successfully synced ${result.syncedCount} supervisor records`,
        syncedCount: result.syncedCount
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to sync supervisor records', details: result.error },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Supervisor sync API error:', error);
    return NextResponse.json(
      { error: 'Failed to sync supervisor records', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!['admin', 'super_admin'].includes(user.role_name)) {
      return NextResponse.json(
        { error: 'Access denied. Only administrators can view sync status.' },
        { status: 403 }
      );
    }

    // Check for users with supervisor role but no supervisor records
    const { getMany } = await import('@/lib/db');
    const usersWithoutSupervisorRecord = await getMany(`
      SELECT u.id, u.first_name, u.last_name, u.email, r.name as role_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN supervisors s ON u.id = s.user_id
      WHERE r.name = 'supervisor' AND s.id IS NULL
    `);

    return NextResponse.json({
      success: true,
      usersNeedingSync: usersWithoutSupervisorRecord.length,
      users: usersWithoutSupervisorRecord
    });

  } catch (error) {
    console.error('❌ Supervisor sync status API error:', error);
    return NextResponse.json(
      { error: 'Failed to get sync status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
