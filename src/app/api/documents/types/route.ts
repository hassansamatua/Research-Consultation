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

    // Get all document types
    try {
      const documentTypes = await getMany(`
        SELECT * FROM document_types
        ORDER BY name ASC
      `);
      return NextResponse.json({ documentTypes });
    } catch (error) {
      // Fallback to hardcoded document types if table doesn't exist
      console.log('Document types table not found, using fallback data');
      const fallbackDocumentTypes = [
        { id: 1, name: 'Proposal', description: 'Research proposal document' },
        { id: 2, name: 'Literature Review', description: 'Literature review document' },
        { id: 3, name: 'Chapter', description: 'Research chapter document' },
        { id: 4, name: 'Thesis', description: 'Final thesis document' },
        { id: 5, name: 'Report', description: 'Progress report document' },
        { id: 6, name: 'Presentation', description: 'Presentation slides' }
      ];
      return NextResponse.json({ documentTypes: fallbackDocumentTypes });
    }

  } catch (error) {
    console.error('Get document types error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
