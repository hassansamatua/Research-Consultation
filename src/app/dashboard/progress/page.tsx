'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ResearchStage {
  id: number;
  name: string;
  description: string;
  stage_order: number;
  is_required: boolean;
  completed_count: number;
  status: 'completed' | 'in_progress' | 'locked' | 'upcoming';
}

interface Submission {
  id: number;
  title: string;
  document_type: string;
  status: string;
  submitted_at: string;
  research_stage_name: string;
  reviews?: any[];
}

export default function ProgressPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stages, setStages] = useState<ResearchStage[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchProgressData();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        
        // Check if user is a student
        if (data.user.role_name !== 'student') {
          router.push('/dashboard');
        }
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchProgressData = async () => {
    try {
      // Mock research stages data
      const mockStages: ResearchStage[] = [
        {
          id: 1,
          name: 'Research Proposal',
          description: 'Submit your initial research proposal',
          stage_order: 1,
          is_required: true,
          completed_count: 1,
          status: 'completed'
        },
        {
          id: 2,
          name: 'Literature Review',
          description: 'Complete comprehensive literature review',
          stage_order: 2,
          is_required: true,
          completed_count: 1,
          status: 'completed'
        },
        {
          id: 3,
          name: 'Chapter 1: Introduction',
          description: 'Write the introduction chapter',
          stage_order: 3,
          is_required: true,
          completed_count: 1,
          status: 'completed'
        },
        {
          id: 4,
          name: 'Chapter 2: Literature Review',
          description: 'Expand literature review into full chapter',
          stage_order: 4,
          is_required: true,
          completed_count: 1,
          status: 'in_progress'
        },
        {
          id: 5,
          name: 'Chapter 3: Methodology',
          description: 'Describe research methodology',
          stage_order: 5,
          is_required: true,
          completed_count: 0,
          status: 'upcoming'
        },
        {
          id: 6,
          name: 'Data Collection',
          description: 'Collect and analyze research data',
          stage_order: 6,
          is_required: true,
          completed_count: 0,
          status: 'locked'
        },
        {
          id: 7,
          name: 'Final Thesis',
          description: 'Complete and submit final thesis',
          stage_order: 7,
          is_required: true,
          completed_count: 0,
          status: 'locked'
        }
      ];

      // Mock submissions data
      const mockSubmissions: Submission[] = [
        {
          id: 1,
          title: 'Research Proposal Draft',
          document_type: 'Proposal',
          status: 'approved',
          submitted_at: '2024-01-10T10:30:00Z',
          research_stage_name: 'Research Proposal'
        },
        {
          id: 2,
          title: 'Literature Review Document',
          document_type: 'Literature Review',
          status: 'approved',
          submitted_at: '2024-01-15T14:20:00Z',
          research_stage_name: 'Literature Review'
        },
        {
          id: 3,
          title: 'Chapter 1 - Introduction',
          document_type: 'Chapter',
          status: 'approved',
          submitted_at: '2024-01-20T09:15:00Z',
          research_stage_name: 'Chapter 1: Introduction'
        },
        {
          id: 4,
          title: 'Chapter 2 - Literature Review',
          document_type: 'Chapter',
          status: 'pending',
          submitted_at: '2024-01-25T16:45:00Z',
          research_stage_name: 'Chapter 2: Literature Review'
        }
      ];

      setStages(mockStages);
      setSubmissions(mockSubmissions);
    } catch (error) {
      console.error('Failed to fetch progress data:', error);
    }
  };

  const getStageColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'upcoming': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'locked': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStageIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'in_progress': return '🔄';
      case 'upcoming': return '⏳';
      case 'locked': return '🔒';
      default: return '📋';
    }
  };

  const calculateProgress = () => {
    const completedStages = stages.filter(stage => stage.status === 'completed').length;
    return Math.round((completedStages / stages.length) * 100);
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Research Progress</h1>
        <p className="mt-2 text-gray-600">Track your research journey and milestones</p>
      </div>

      {/* Overall Progress */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Overall Progress</h3>
            <span className="text-2xl font-bold text-green-600">{calculateProgress()}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className="bg-green-600 h-4 rounded-full transition-all duration-300"
              style={{ width: `${calculateProgress()}%` }}
            ></div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{stages.filter(s => s.status === 'completed').length}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{stages.filter(s => s.status === 'in_progress').length}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-600">{stages.filter(s => s.status === 'locked').length}</div>
              <div className="text-sm text-gray-600">Remaining</div>
            </div>
          </div>
        </div>
      </div>

      {/* Research Stages */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Research Stages</h3>
          <div className="space-y-4">
            {stages.map((stage, index) => (
              <div key={stage.id} className={`border rounded-lg p-4 ${getStageColor(stage.status)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">{getStageIcon(stage.status)}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900">{stage.name}</h4>
                      <p className="text-sm text-gray-600">{stage.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 text-sm font-medium rounded-full bg-white bg-opacity-60">
                      Stage {stage.stage_order}
                    </span>
                    {stage.status === 'in_progress' && (
                      <button 
                        onClick={() => router.push('/dashboard/submissions')}
                        className="px-3 py-1 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Submit Work
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Submissions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Submissions</h3>
            <button 
              onClick={() => router.push('/dashboard/submissions')}
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div key={submission.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{submission.title}</h4>
                    <p className="text-sm text-gray-600">{submission.document_type} • {submission.research_stage_name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Submitted: {new Date(submission.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                    submission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {submission.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
