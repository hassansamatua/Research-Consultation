import { NextRequest, NextResponse } from 'next/server';
import { getMany } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get all research stages to understand the progression
    const stages = await getMany(`
      SELECT id, name, order_index
      FROM research_stages
      ORDER BY order_index
    `);

    // Get all submissions with student and stage information
    const submissions = await getMany(`
      SELECT 
        s.student_id,
        s.research_stage_id,
        s.status,
        st.registration_number,
        u.first_name,
        u.last_name,
        rs.name as stage_name,
        rs.order_index as stage_order
      FROM submissions s
      JOIN students st ON s.student_id = st.id
      JOIN users u ON st.user_id = u.id
      LEFT JOIN research_stages rs ON s.research_stage_id = rs.id
      ORDER BY st.registration_number, rs.order_index
    `);

    // Get all students to include those with no submissions
    const allStudents = await getMany(`
      SELECT 
        st.id as student_id,
        st.registration_number,
        u.first_name,
        u.last_name,
        st.program
      FROM students st
      JOIN users u ON st.user_id = u.id
    `);

    // Calculate progress for each student
    const studentProgress = allStudents.map(student => {
      const studentSubmissions = submissions.filter(sub => sub.student_id === student.student_id);
      const totalStages = stages.length;
      
      if (totalStages === 0) {
        return {
          ...student,
          total_stages: totalStages,
          completed_stages: 0,
          progress_percentage: 0
        };
      }

      // Count completed stages (status = 'approved')
      const completedStages = studentSubmissions.filter(sub => sub.status === 'approved').length;
      
      // Count in-progress stages (status = 'submitted' or 'under_review')
      const inProgressStages = studentSubmissions.filter(sub => 
        sub.status === 'submitted' || sub.status === 'under_review'
      ).length;

      // Calculate progress: completed stages get full credit, in-progress get half credit
      const progressPoints = (completedStages * 100) + (inProgressStages * 50);
      const maxPoints = totalStages * 100;
      const progressPercentage = Math.round((progressPoints / maxPoints) * 100);

      return {
        ...student,
        total_stages: totalStages,
        completed_stages: completedStages,
        in_progress_stages: inProgressStages,
        progress_percentage: Math.min(progressPercentage, 100)
      };
    });

    // Calculate overall statistics
    const totalStudents = studentProgress.length;
    const averageProgress = totalStudents > 0 
      ? Math.round(studentProgress.reduce((sum, student) => sum + student.progress_percentage, 0) / totalStudents)
      : 0;

    const activeStudents = studentProgress.filter(student => student.progress_percentage > 0).length;
    const completedStudents = studentProgress.filter(student => student.progress_percentage === 100).length;

    return NextResponse.json({
      success: true,
      statistics: {
        total_students: totalStudents,
        active_students: activeStudents,
        completed_students: completedStudents,
        average_progress: averageProgress,
        total_stages: stages.length
      },
      student_progress: studentProgress,
      stages: stages
    });

  } catch (error) {
    console.error('Error calculating student progress:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to calculate student progress',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
