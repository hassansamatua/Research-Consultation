import { NextRequest, NextResponse } from 'next/server';
import { getMany } from '@/lib/db';
import { authenticateRequest } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user (admin or super_admin only)
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (user.role_name !== 'admin' && user.role_name !== 'super_admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get available roles
    const roles = await getMany('SELECT id, name, description FROM roles ORDER BY id');
    
    return NextResponse.json({
      roles
    });

  } catch (error) {
    console.error('Get roles error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
