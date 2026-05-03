import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware';
import { runAllIntegrityChecks } from '@/lib/dataIntegrity';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user (only admin can run integrity checks)
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!['admin', 'super_admin'].includes(user.role_name)) {
      return NextResponse.json(
        { error: 'Access denied. Only administrators can run integrity checks.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const autoFix = searchParams.get('autoFix') === 'true';

    console.log('🔧 Admin user requested integrity check:', user.first_name, user.last_name, 'autoFix:', autoFix);

    // Run integrity checks
    const result = await runAllIntegrityChecks(autoFix);

    return NextResponse.json({
      success: true,
      message: `Integrity check completed. Overall status: ${result.overall}`,
      result
    });

  } catch (error) {
    console.error('❌ Integrity check API error:', error);
    return NextResponse.json(
      { error: 'Failed to run integrity check', details: error instanceof Error ? error.message : 'Unknown error' },
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
        { error: 'Access denied. Only administrators can view integrity status.' },
        { status: 403 }
      );
    }

    // Check integrity status without fixing
    const result = await runAllIntegrityChecks(false);

    return NextResponse.json({
      success: true,
      message: 'Integrity status retrieved',
      result
    });

  } catch (error) {
    console.error('❌ Integrity status API error:', error);
    return NextResponse.json(
      { error: 'Failed to get integrity status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
