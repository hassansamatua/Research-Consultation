import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { getOne } from './db';

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

// Password verification
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// JWT token generation
export function generateToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

// JWT token verification
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// User authentication
export async function authenticateUser(email: string, password: string) {
  const query = `
    SELECT u.*, r.name as role_name 
    FROM users u 
    JOIN roles r ON u.role_id = r.id 
    WHERE u.email = ? AND u.is_active = 1
  `;
  
  const user = await getOne(query, [email]);
  
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  const isPasswordValid = await verifyPassword(password, user.password);
  
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }
  
  // Remove password from user object
  const { password: _, ...userWithoutPassword } = user;
  
  // Generate JWT token
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role_name,
    firstName: user.first_name,
    lastName: user.last_name
  });
  
  return {
    user: userWithoutPassword,
    token
  };
}

// Get user by ID
export async function getUserById(id: number) {
  const query = `
    SELECT u.*, r.name as role_name 
    FROM users u 
    JOIN roles r ON u.role_id = r.id 
    WHERE u.id = ? AND u.is_active = 1
  `;
  
  const user = await getOne(query, [id]);
  
  if (user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  
  return null;
}

// Get user profile with role-specific data
export async function getUserProfile(userId: number, role: string) {
  let profileQuery = '';
  
  switch (role) {
    case 'student':
      profileQuery = `
        SELECT u.*, s.registration_number, s.program, s.degree_level, 
               s.enrollment_date, s.expected_completion_date
        FROM users u
        JOIN students s ON u.id = s.user_id
        WHERE u.id = ?
      `;
      break;
      
    case 'supervisor':
      profileQuery = `
        SELECT u.*, sup.staff_id, sup.department, sup.specialization,
               sup.academic_rank, sup.max_students, sup.current_students
        FROM users u
        JOIN supervisors sup ON u.id = sup.user_id
        WHERE u.id = ?
      `;
      break;
      
    case 'admin':
    case 'super_admin':
      profileQuery = `
        SELECT u.*, r.name as role_name
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = ?
      `;
      break;
      
    default:
      throw new Error('Invalid role');
  }
  
  const profile = await getOne(profileQuery, [userId]);
  
  if (profile) {
    const { password, ...profileWithoutPassword } = profile;
    return profileWithoutPassword;
  }
  
  return null;
}

// middleware for API routes
export async function requireAuth(request: Request) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Authorization header required');
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = verifyToken(token);
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

// Role-based access control
export function hasRole(userRole: string, requiredRoles: string | string[]): boolean {
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  return roles.includes(userRole);
}

// Check if user can access resource
export function canAccessResource(userRole: string, resource: string, action: string): boolean {
  const permissions: Record<string, Record<string, string[]>> = {
    student: {
      submissions: ['read', 'create'],
      messages: ['read', 'create'],
      profile: ['read', 'update'],
      guidelines: ['read'],
      deadlines: ['read']
    },
    supervisor: {
      submissions: ['read', 'update'],
      comments: ['read', 'create', 'update'],
      messages: ['read', 'create'],
      profile: ['read', 'update'],
      students: ['read'],
      guidelines: ['read'],
      deadlines: ['read']
    },
    admin: {
      submissions: ['read', 'update'],
      supervisor_allocations: ['read', 'create', 'update'],
      students: ['read', 'update'],
      supervisors: ['read'],
      messages: ['read', 'create'],
      profile: ['read', 'update'],
      guidelines: ['read', 'create', 'update'],
      deadlines: ['read', 'create', 'update'],
      reports: ['read', 'create']
    },
    super_admin: {
      all: ['*'] // Full access
    }
  };
  
  if (userRole === 'super_admin') {
    return true;
  }
  
  const userPermissions = permissions[userRole];
  
  if (!userPermissions) {
    return false;
  }
  
  if (userPermissions.all && userPermissions.all.includes('*')) {
    return true;
  }
  
  const resourcePermissions = userPermissions[resource];
  
  if (!resourcePermissions) {
    return false;
  }
  
  return resourcePermissions.includes(action);
}
