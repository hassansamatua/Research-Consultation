import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getOne } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

interface AuthenticatedUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role_name: string;
  is_active: boolean;
}

export async function authenticateRequest(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    // Try to get token from cookie first
    let token: string | undefined;
    const cookieToken = request.cookies.get('token');
    
    if (cookieToken) {
      token = cookieToken.value;
    }
    
    // If not in cookie, try Authorization header
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token || typeof token !== 'string') {
      console.log('No valid token found');
      return null;
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Get user from database
    const query = `
      SELECT u.*, r.name as role_name 
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE u.id = ? AND u.is_active = 1
    `;
    
    const user = await getOne(query, [decoded.id]);
    
    if (!user) {
      return null;
    }

    // Remove password from user object
    const { password, ...userWithoutPassword } = user;
    
    return userWithoutPassword as AuthenticatedUser;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export function requireAuth(roles: string[] = []) {
  return async (request: NextRequest, response: NextResponse, next: Function) => {
    const user = await authenticateRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (roles.length > 0 && !roles.includes(user.role_name)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Add user to request object for use in route handlers
    (request as any).user = user;
    
    next();
  };
}
