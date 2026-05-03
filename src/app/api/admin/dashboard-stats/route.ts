import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware';
import { getMany } from '@/lib/db';

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

    if (user.role_name !== 'admin' && user.role_name !== 'super_admin') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get total students
    const totalStudents = await getMany(`
      SELECT COUNT(*) as count FROM students st
      JOIN users u ON st.user_id = u.id
    `);

    // Get active supervisors
    const activeSupervisors = await getMany(`
      SELECT COUNT(*) as count FROM supervisors sup
      JOIN users u ON sup.user_id = u.id
      WHERE u.is_active = true
    `);

    // Get pending submissions
    const pendingSubmissions = await getMany(`
      SELECT COUNT(*) as count FROM submissions 
      WHERE status IN ('submitted', 'under_review')
    `);

    // Get completed projects this year
    const completedThisYear = await getMany(`
      SELECT COUNT(*) as count FROM research_projects 
      WHERE status = 'completed' 
      AND YEAR(actual_completion_date) = YEAR(CURRENT_DATE)
    `);

    // Get degree breakdown for completed projects
    const degreeBreakdown = await getMany(`
      SELECT 
        st.degree_level,
        COUNT(*) as count
      FROM research_projects rp
      JOIN students st ON rp.student_id = st.id
      WHERE rp.status = 'completed' 
      AND YEAR(rp.actual_completion_date) = YEAR(CURRENT_DATE)
      GROUP BY st.degree_level
    `);

    const mastersCount = degreeBreakdown.find(d => d.degree_level === 'Masters')?.count || 0;
    const phdCount = degreeBreakdown.find(d => d.degree_level === 'PhD')?.count || 0;

    // Calculate percentage change from last semester (simplified)
    const lastSemesterStudents = await getMany(`
      SELECT COUNT(*) as count FROM students st
      JOIN users u ON st.user_id = u.id
      WHERE st.enrollment_date < DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH)
    `);

    const percentageChange = lastSemesterStudents[0].count > 0 
      ? Math.round(((totalStudents[0].count - lastSemesterStudents[0].count) / lastSemesterStudents[0].count) * 100)
      : 0;

    // Calculate average students per supervisor
    const avgStudentsPerSupervisor = activeSupervisors[0].count > 0 
      ? (totalStudents[0].count / activeSupervisors[0].count).toFixed(1)
      : 0;

    return NextResponse.json({
      success: true,
      statistics: {
        total_students: totalStudents[0].count,
        active_supervisors: activeSupervisors[0].count,
        pending_submissions: pendingSubmissions[0].count,
        completed_this_year: completedThisYear[0].count,
        masters_completed: mastersCount,
        phd_completed: phdCount,
        percentage_change: percentageChange,
        avg_students_per_supervisor: avgStudentsPerSupervisor
      }
    });

  } catch (error) {
    console.error('Get admin dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
