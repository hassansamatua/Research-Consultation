import { NextRequest, NextResponse } from 'next/server';
import { getOne, insert } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Check if default project already exists
    const existingProject = await getOne(
      'SELECT id FROM research_projects WHERE title = "Default Research Project"'
    );

    if (existingProject) {
      return NextResponse.json({
        message: 'Default project already exists',
        projectId: existingProject.id
      });
    }

    // Create default research project
    const projectData = {
      student_id: 1, // Default student ID
      title: 'Default Research Project',
      description: 'Default research project for supervisor allocations',
      research_area: 'General Research',
      start_date: new Date(),
      expected_completion_date: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000),
      status: 'ongoing',
      created_at: new Date(),
      updated_at: new Date()
    };

    const projectId = await insert('research_projects', projectData);

    return NextResponse.json({
      message: 'Default research project created successfully',
      projectId: projectId,
      projectData: projectData
    });

  } catch (error) {
    console.error('Default project creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create default project', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
