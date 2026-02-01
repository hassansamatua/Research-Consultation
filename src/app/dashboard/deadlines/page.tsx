'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Deadline {
  id: number;
  title: string;
  description: string;
  deadline_date: string;
  target_role: string;
  research_stage_id?: number;
  is_active: boolean;
  created_at: string;
}

export default function DeadlinesPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [selectedDeadline, setSelectedDeadline] = useState<Deadline | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline_date: '',
    target_role: 'all',
    research_stage_id: ''
  });
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchDeadlines();
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

  const fetchDeadlines = async () => {
    // Mock deadlines for now
    const mockDeadlines: Deadline[] = [
      {
        id: 1,
        title: 'Research Proposal Submission',
        description: 'Final deadline for submitting research proposals for the current academic year. All proposals must be reviewed and approved by supervisors before submission.',
        deadline_date: '2024-03-31',
        target_role: 'student',
        research_stage_id: 1,
        is_active: true,
        created_at: '2024-01-10T10:00:00Z'
      },
      {
        id: 2,
        title: 'Chapter 1 Submission',
        description: 'Submit Chapter 1 (Introduction) of your research. Include research questions, objectives, and significance of the study.',
        deadline_date: '2024-05-31',
        target_role: 'student',
        research_stage_id: 2,
        is_active: true,
        created_at: '2024-01-12T14:30:00Z'
      },
      {
        id: 3,
        title: 'Mid-Year Progress Reports',
        description: 'All supervisors must submit mid-year progress reports for their assigned students. Include completion status and recommendations.',
        deadline_date: '2024-06-30',
        target_role: 'supervisor',
        is_active: true,
        created_at: '2024-01-15T09:15:00Z'
      },
      {
        id: 4,
        title: 'Final Thesis Submission',
        description: 'Complete thesis submission for graduation consideration. Ensure all formatting requirements are met and all signatures are obtained.',
        deadline_date: '2024-07-31',
        target_role: 'student',
        research_stage_id: 7,
        is_active: true,
        created_at: '2024-01-08T11:20:00Z'
      },
      {
        id: 5,
        title: 'Supervisor Allocation',
        description: 'Complete allocation of supervisors to new students for the upcoming academic year. Consider specialization and workload.',
        deadline_date: '2024-02-28',
        target_role: 'admin',
        is_active: true,
        created_at: '2024-01-05T16:45:00Z'
      }
    ];
    setDeadlines(mockDeadlines);
  };

  const handleDeadlineClick = (deadline: Deadline) => {
    setSelectedDeadline(deadline);
    setEditing(false);
    setFormData({
      title: deadline.title,
      description: deadline.description,
      deadline_date: deadline.deadline_date,
      target_role: deadline.target_role,
      research_stage_id: deadline.research_stage_id?.toString() || ''
    });
  };

  const handleEdit = () => {
    if (selectedDeadline) {
      setEditing(true);
    }
  };

  const handleSave = async () => {
    // TODO: Implement save API
    console.log('Saving deadline:', formData);
    setEditing(false);
  };

  const handleCreateNew = () => {
    setSelectedDeadline(null);
    setFormData({
      title: '',
      description: '',
      deadline_date: '',
      target_role: 'all',
      research_stage_id: ''
    });
    setEditing(true);
  };

  const getDaysRemaining = (deadlineDate: string) => {
    const today = new Date();
    const deadline = new Date(deadlineDate);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDeadlineStatus = (deadlineDate: string) => {
    const daysRemaining = getDaysRemaining(deadlineDate);
    if (daysRemaining < 0) return 'overdue';
    if (daysRemaining <= 7) return 'urgent';
    if (daysRemaining <= 30) return 'approaching';
    return 'normal';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'urgent': return 'bg-orange-100 text-orange-800';
      case 'approaching': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
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

  const filteredDeadlines = user.role_name === 'super_admin' 
    ? deadlines 
    : deadlines.filter(d => d.target_role === 'all' || d.target_role === user.role_name);

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deadlines</h1>
          <p className="mt-2 text-gray-600">Academic deadlines and important dates</p>
        </div>
        {(user.role_name === 'admin' || user.role_name === 'super_admin') && (
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Add New Deadline
          </button>
        )}
      </div>

      {/* Upcoming Deadlines Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Overdue</h3>
          <div className="text-3xl font-bold text-red-600 mb-2">
            {filteredDeadlines.filter(d => getDeadlineStatus(d.deadline_date) === 'overdue').length}
          </div>
          <p className="text-sm text-gray-600">Deadlines passed</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">This Month</h3>
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {filteredDeadlines.filter(d => {
              const days = getDaysRemaining(d.deadline_date);
              return days >= 0 && days <= 30;
            }).length}
          </div>
          <p className="text-sm text-gray-600">Deadlines approaching</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Active</h3>
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {filteredDeadlines.filter(d => d.is_active).length}
          </div>
          <p className="text-sm text-gray-600">Active deadlines</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deadlines List */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                All Deadlines
              </h3>
              <div className="space-y-2">
                {filteredDeadlines.map((deadline) => {
                  const status = getDeadlineStatus(deadline.deadline_date);
                  const daysRemaining = getDaysRemaining(deadline.deadline_date);
                  
                  return (
                    <div
                      key={deadline.id}
                      onClick={() => handleDeadlineClick(deadline)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedDeadline?.id === deadline.id
                          ? 'bg-green-50 border-green-200 border'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {deadline.title}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                          {status === 'overdue' ? 'Overdue' : 
                           status === 'urgent' ? `${daysRemaining} days` :
                           status === 'approaching' ? `${daysRemaining} days` :
                           'Normal'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Target: {deadline.target_role === 'all' ? 'All Users' : deadline.target_role}
                      </p>
                      <p className="text-xs text-gray-500">
                        Due: {new Date(deadline.deadline_date).toLocaleDateString()}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Deadline Details */}
        <div className="lg:col-span-2">
          {editing ? (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {selectedDeadline ? 'Edit Deadline' : 'Create New Deadline'}
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
                      placeholder="Deadline title"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      placeholder="Detailed description of the deadline"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="deadline_date" className="block text-sm font-medium text-gray-700">
                        Deadline Date
                      </label>
                      <input
                        type="date"
                        name="deadline_date"
                        id="deadline_date"
                        value={formData.deadline_date}
                        onChange={(e) => setFormData({...formData, deadline_date: e.target.value})}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
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
                      Save Deadline
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : selectedDeadline ? (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {selectedDeadline.title}
                    </h3>
                    <div className="mt-2 flex items-center space-x-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(getDeadlineStatus(selectedDeadline.deadline_date))}`}>
                        {getDeadlineStatus(selectedDeadline.deadline_date) === 'overdue' ? 'Overdue' : 
                         getDeadlineStatus(selectedDeadline.deadline_date) === 'urgent' ? `${getDaysRemaining(selectedDeadline.deadline_date)} days remaining` :
                         getDeadlineStatus(selectedDeadline.deadline_date) === 'approaching' ? `${getDaysRemaining(selectedDeadline.deadline_date)} days remaining` :
                         'Normal'}
                      </span>
                      <span className="text-sm text-gray-600">
                        Target: {selectedDeadline.target_role === 'all' ? 'All Users' : selectedDeadline.target_role}
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

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Description</h4>
                    <p className="mt-1 text-sm text-gray-700">
                      {selectedDeadline.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Deadline Date</h4>
                      <p className="mt-1 text-sm text-gray-700">
                        {new Date(selectedDeadline.deadline_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Days Remaining</h4>
                      <p className="mt-1 text-sm text-gray-700">
                        {getDaysRemaining(selectedDeadline.deadline_date) > 0 
                          ? `${getDaysRemaining(selectedDeadline.deadline_date)} days`
                          : 'Overdue'
                        }
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Created</h4>
                    <p className="mt-1 text-sm text-gray-700">
                      {new Date(selectedDeadline.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6 text-center">
                <div className="text-gray-400">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No deadline selected</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Choose a deadline from the list to view details
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
