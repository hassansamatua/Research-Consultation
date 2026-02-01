'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Guideline {
  id: number;
  title: string;
  content: string;
  target_role: string;
  is_active: boolean;
  created_at: string;
}

export default function GuidelinesPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [guidelines, setGuidelines] = useState<Guideline[]>([]);
  const [selectedGuideline, setSelectedGuideline] = useState<Guideline | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    target_role: 'all'
  });
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchGuidelines();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchGuidelines = async () => {
    // Mock guidelines for now
    const mockGuidelines: Guideline[] = [
      {
        id: 1,
        title: 'Research Proposal Guidelines',
        content: `## Research Proposal Guidelines

### 1. Format Requirements
- Length: 15-20 pages (excluding references)
- Font: Times New Roman, 12pt
- Spacing: Double-spaced
- Margins: 1 inch on all sides

### 2. Structure
- Title Page
- Abstract (250-300 words)
- Introduction
- Literature Review
- Methodology
- Expected Outcomes
- Timeline
- References

### 3. Evaluation Criteria
- Originality and significance
- Literature review quality
- Methodological soundness
- Feasibility
- Clarity of writing

### 4. Submission Process
- Submit via the online portal
- Include signed supervisor approval form
- Deadline: End of semester`,
        target_role: 'all',
        is_active: true,
        created_at: '2024-01-10T10:00:00Z'
      },
      {
        id: 2,
        title: 'Thesis Formatting Requirements',
        content: `## Thesis Formatting Guidelines

### General Requirements
- Page limit: Masters 100 pages, PhD 200 pages
- Language: English
- Citation style: APA 7th edition

### Document Structure
1. Preliminary Pages
   - Title page
   - Abstract
   - Acknowledgments
   - Table of contents
   - List of tables
   - List of figures

2. Main Body
   - Introduction
   - Literature review
   - Methodology
   - Results
   - Discussion
   - Conclusion

3. End Matter
   - References
   - Appendices

### Formatting Details
- Headings: Use consistent hierarchy
- Tables: Numbered consecutively
- Figures: High resolution, numbered
- References: Alphabetical order`,
        target_role: 'student',
        is_active: true,
        created_at: '2024-01-08T14:30:00Z'
      },
      {
        id: 3,
        title: 'Supervisor Responsibilities',
        content: `## Supervisor Guidelines

### Primary Responsibilities
- Provide academic guidance and mentorship
- Review and provide feedback on submissions
- Monitor student progress
- Ensure research quality and ethics

### Time Commitment
- Minimum 2 hours per month per student
- Response time: Within 2 weeks for submissions
- Meeting frequency: At least monthly

### Evaluation Duties
- Assess proposal quality
- Monitor research milestones
- Evaluate final thesis
- Provide grade recommendations

### Professional Conduct
- Maintain confidentiality
- Avoid conflicts of interest
- Follow university policies
- Report academic misconduct`,
        target_role: 'supervisor',
        is_active: true,
        created_at: '2024-01-05T09:15:00Z'
      }
    ];
    setGuidelines(mockGuidelines);
  };

  const handleGuidelineClick = (guideline: Guideline) => {
    setSelectedGuideline(guideline);
    setEditing(false);
    setFormData({
      title: guideline.title,
      content: guideline.content,
      target_role: guideline.target_role
    });
  };

  const handleEdit = () => {
    if (selectedGuideline) {
      setEditing(true);
    }
  };

  const handleSave = async () => {
    // TODO: Implement save API
    console.log('Saving guideline:', formData);
    setEditing(false);
  };

  const handleCreateNew = () => {
    setSelectedGuideline(null);
    setFormData({
      title: '',
      content: '',
      target_role: 'all'
    });
    setEditing(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Guidelines</h1>
          <p className="mt-2 text-gray-600">Research guidelines and policies</p>
        </div>
        {(user.role_name === 'admin' || user.role_name === 'super_admin') && (
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Create New Guideline
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Guidelines List */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Available Guidelines
              </h3>
              <div className="space-y-2">
                {guidelines.map((guideline) => (
                  <div
                    key={guideline.id}
                    onClick={() => handleGuidelineClick(guideline)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedGuideline?.id === guideline.id
                        ? 'bg-green-50 border-green-200 border'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {guideline.title}
                      </p>
                      {guideline.is_active && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Target: {guideline.target_role === 'all' ? 'All Users' : guideline.target_role}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(guideline.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Guideline Content */}
        <div className="lg:col-span-2">
          {editing ? (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {selectedGuideline ? 'Edit Guideline' : 'Create New Guideline'}
                </h3>
                <form className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      placeholder="Guideline title"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="target_role" className="block text-sm font-medium text-gray-700">
                      Target Audience
                    </label>
                    <select
                      name="target_role"
                      id="target_role"
                      value={formData.target_role}
                      onChange={(e) => setFormData({...formData, target_role: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    >
                      <option value="all">All Users</option>
                      <option value="student">Students</option>
                      <option value="supervisor">Supervisors</option>
                      <option value="admin">Administrators</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                      Content
                    </label>
                    <textarea
                      name="content"
                      id="content"
                      rows={12}
                      value={formData.content}
                      onChange={(e) => setFormData({...formData, content: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      placeholder="Enter guideline content (supports Markdown)"
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Save Guideline
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : selectedGuideline ? (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {selectedGuideline.title}
                    </h3>
                    <div className="mt-2 flex items-center space-x-4">
                      <span className="text-sm text-gray-600">
                        Target: {selectedGuideline.target_role === 'all' ? 'All Users' : selectedGuideline.target_role}
                      </span>
                      <span className="text-sm text-gray-500">
                        Updated: {new Date(selectedGuideline.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {(user.role_name === 'admin' || user.role_name === 'super_admin') && (
                    <button
                      onClick={handleEdit}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Edit
                    </button>
                  )}
                </div>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700">
                    {selectedGuideline.content}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6 text-center">
                <div className="text-gray-400">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No guideline selected</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Choose a guideline from the list to view
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
