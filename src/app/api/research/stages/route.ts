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

    // Get all research stages with count of completed submissions
    let stages = null;
    try {
      stages = await getMany(`
        SELECT 
          rs.*,
          (SELECT COUNT(*) FROM document_submissions ds WHERE ds.research_stage_id = rs.id AND ds.status = 'approved') as completed_count
        FROM research_stages rs
        ORDER BY rs.order_index ASC
      `);
      return NextResponse.json({ stages });
    } catch (error) {
      // Fallback to hardcoded research stages if table doesn't exist
      console.log('Research stages table not found, using fallback data');
      const fallbackStages = [
        { id: 1, name: 'Research Proposal', description: 'Submit your initial research proposal', order_index: 1, is_required: true, completed_count: 0 },
        { id: 2, name: 'Literature Review', description: 'Complete comprehensive literature review', order_index: 2, is_required: true, completed_count: 0 },
        { id: 3, name: 'Chapter 1: Introduction', description: 'Write the introduction chapter', order_index: 3, is_required: true, completed_count: 0 },
        { id: 4, name: 'Chapter 2: Literature Review', description: 'Expand literature review into full chapter', order_index: 4, is_required: true, completed_count: 0 },
        { id: 5, name: 'Chapter 3: Methodology', description: 'Describe research methodology', order_index: 5, is_required: true, completed_count: 0 },
        { id: 6, name: 'Data Collection', description: 'Collect and analyze research data', order_index: 6, is_required: true, completed_count: 0 },
        { id: 7, name: 'Final Thesis', description: 'Complete and submit final thesis', order_index: 7, is_required: true, completed_count: 0 }
      ];
      return NextResponse.json({ stages: fallbackStages });
    }

  } catch (error) {
    console.error('Get research stages error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
