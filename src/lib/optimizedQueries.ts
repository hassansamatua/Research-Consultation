// Optimized Database Queries with Caching and Performance Enhancements

import { getOne, getMany, executeQuery } from './db';

// Query cache with TTL (Time To Live)
const queryCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

// Generic cached query function
export async function cachedQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  ttl: number = DEFAULT_TTL
): Promise<T> {
  const cached = queryCache.get(key);
  const now = Date.now();

  // Return cached data if still valid
  if (cached && (now - cached.timestamp) < cached.ttl) {
    console.log(`📦 Cache hit for: ${key}`);
    return cached.data;
  }

  // Execute query and cache result
  console.log(`🔍 Cache miss, executing: ${key}`);
  const data = await queryFn();
  queryCache.set(key, { data, timestamp: now, ttl });
  
  // Clean up expired cache entries periodically
  if (queryCache.size > 50) {
    for (const [cacheKey, entry] of queryCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        queryCache.delete(cacheKey);
      }
    }
  }

  return data;
}

// Clear cache for specific key or all
export function clearCache(key?: string) {
  if (key) {
    queryCache.delete(key);
    console.log(`🗑️ Cache cleared for: ${key}`);
  } else {
    queryCache.clear();
    console.log(`🗑️ All cache cleared`);
  }
}

// Optimized supervisor profile query
export async function getSupervisorProfileOptimized(userId: number) {
  return cachedQuery(
    `supervisor_profile_${userId}`,
    async () => {
      const result = await getOne(`
        SELECT 
          s.id,
          s.user_id,
          s.first_name,
          s.last_name,
          s.email,
          s.phone,
          s.department,
          s.specialization,
          s.max_students,
          s.staff_id,
          u.is_active,
          (SELECT COUNT(*) FROM supervisor_allocations sa WHERE sa.supervisor_id = s.id AND sa.status = 'active') as current_students
        FROM supervisors s
        JOIN users u ON s.user_id = u.id
        WHERE s.user_id = ?
      `, [userId]);
      return result;
    },
    10 * 60 * 1000 // 10 minutes cache for profile
  );
}

// Optimized supervisor allocations with pagination
export async function getSupervisorAllocationsOptimized(
  userId: number, 
  page: number = 1, 
  limit: number = 10
) {
  const cacheKey = `supervisor_allocations_${userId}_${page}_${limit}`;
  
  return cachedQuery(
    cacheKey,
    async () => {
      const offset = (page - 1) * limit;
      
      // Single query with all joins
      const allocations = await getMany(`
        SELECT 
          sa.id,
          sa.allocated_at,
          sa.status,
          st.id as student_id,
          st.registration_number,
          st.program,
          st.enrollment_date,
          st.expected_completion_date,
          u.first_name as student_first_name,
          u.last_name as student_last_name,
          u.email as student_email,
          u.phone as student_phone,
          (SELECT COUNT(*) FROM submissions sub WHERE sub.student_id = st.id) as submission_count,
          (SELECT COUNT(*) FROM meetings m WHERE m.student_id = st.id AND m.status = 'completed') as completed_meetings
        FROM supervisor_allocations sa
        JOIN supervisors s ON sa.supervisor_id = s.id
        JOIN students st ON sa.student_id = st.id
        JOIN users u ON st.user_id = u.id
        WHERE s.user_id = ? AND sa.status = 'active'
        ORDER BY sa.allocated_at DESC
        LIMIT ? OFFSET ?
      `, [userId, limit, offset]);

      // Get total count in parallel
      const totalCount = await getOne(`
        SELECT COUNT(*) as total
        FROM supervisor_allocations sa
        JOIN supervisors s ON sa.supervisor_id = s.id
        WHERE s.user_id = ? AND sa.status = 'active'
      `, [userId]);

      return {
        allocations,
        pagination: {
          page,
          limit,
          total: totalCount.total,
          totalPages: Math.ceil(totalCount.total / limit)
        }
      };
    },
    2 * 60 * 1000 // 2 minutes cache for allocations
  );
}

// Optimized messages query with unread count
export async function getMessagesOptimized(userId: number, unreadOnly: boolean = false) {
  const cacheKey = `messages_${userId}_${unreadOnly ? 'unread' : 'all'}`;
  
  return cachedQuery(
    cacheKey,
    async () => {
      const unreadFilter = unreadOnly ? 'AND m.is_read = FALSE' : '';
      
      const messages = await getMany(`
        SELECT 
          m.id,
          m.sender_id,
          m.receiver_id,
          m.subject,
          m.message_text,
          m.is_read,
          m.created_at,
          u1.first_name as sender_first_name,
          u1.last_name as sender_last_name,
          u1.email as sender_email,
          r1.name as sender_role,
          u2.first_name as receiver_first_name,
          u2.last_name as receiver_last_name,
          u2.email as receiver_email,
          r2.name as receiver_role
        FROM messages m
        JOIN users u1 ON m.sender_id = u1.id
        JOIN roles r1 ON u1.role_id = r1.id
        JOIN users u2 ON m.receiver_id = u2.id
        JOIN roles r2 ON u2.role_id = r2.id
        WHERE (m.sender_id = ? OR m.receiver_id = ?) ${unreadFilter}
        ORDER BY m.created_at DESC
        LIMIT 50
      `, [userId, userId]);

      // Get unread count in parallel
      const unreadCount = await getOne(`
        SELECT COUNT(*) as count
        FROM messages m
        WHERE m.receiver_id = ? AND m.is_read = FALSE
      `, [userId]);

      return {
        messages,
        unreadCount: unreadCount.count
      };
    },
    30 * 1000 // 30 seconds cache for messages
  );
}

// Optimized meetings query
export async function getMeetingsOptimized(userId: number, userRole: string) {
  const cacheKey = `meetings_${userId}_${userRole}`;
  
  return cachedQuery(
    cacheKey,
    async () => {
      let whereClause = '';
      let joinClause = '';
      
      if (userRole === 'supervisor') {
        whereClause = 'WHERE s.user_id = ?';
        joinClause = 'JOIN supervisors s ON m.supervisor_id = s.id';
      } else {
        whereClause = 'WHERE 1=1'; // Admin gets all meetings
      }

      const meetings = await getMany(`
        SELECT 
          m.*,
          m.requested_by,
          m.approval_status,
          m.rejection_reason,
          m.request_date,
          s.first_name as supervisor_first_name,
          s.last_name as supervisor_last_name,
          s.email as supervisor_email,
          st.first_name as student_first_name,
          st.last_name as student_last_name,
          st.email as student_email,
          st.registration_number
        FROM meetings m
        ${joinClause}
        JOIN supervisors sp ON m.supervisor_id = sp.id
        JOIN users s ON sp.user_id = s.id
        JOIN students st ON m.student_id = st.id
        JOIN users u ON st.user_id = u.id
        ${whereClause}
        ORDER BY m.meeting_date ASC, m.meeting_time ASC
        LIMIT 100
      `, userRole === 'supervisor' ? [userId] : []);

      return { meetings };
    },
    60 * 1000 // 1 minute cache for meetings
  );
}

// Batch data fetching for dashboard
export async function getDashboardDataOptimized(userId: number, userRole: string) {
  const cacheKey = `dashboard_${userId}_${userRole}`;
  
  return cachedQuery(
    cacheKey,
    async () => {
      // Execute all queries in parallel using Promise.all
      const [
        supervisor,
        allocations,
        messagesData,
        meetingsData
      ] = await Promise.all([
        userRole === 'supervisor' ? getSupervisorProfileOptimized(userId) : Promise.resolve(null),
        userRole === 'supervisor' ? getSupervisorAllocationsOptimized(userId, 1, 50) : Promise.resolve(null),
        getMessagesOptimized(userId),
        getMeetingsOptimized(userId, userRole)
      ]);

      return {
        supervisor,
        allocations: allocations?.allocations || [],
        messages: messagesData.messages || [],
        unreadCount: messagesData.unreadCount || 0,
        meetings: meetingsData.meetings || []
      };
    },
    30 * 1000 // 30 seconds cache for dashboard
  );
}
