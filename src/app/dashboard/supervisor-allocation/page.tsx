'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Allocation {
  id: number;
  student_name: string;
  student_email: string;
  registration_number: string;
  supervisor_name: string;
  supervisor_email: string;
  supervisor_phone: string;
  supervisor_department: string;
  research_title: string;
  allocation_date: string;
  status: string;
  progress_percentage: number;
  last_meeting?: string;
  next_meeting?: string;
}

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  registration_number: string;
  program: string;
  status: string;
}

interface Supervisor {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department: string;
  specialization: string;
  max_students: number;
  current_students: number;
  available_capacity: number;
}

export default function SupervisorAllocationPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [availableSupervisors, setAvailableSupervisors] = useState<Supervisor[]>([]);
  const [showAllocateForm, setShowAllocateForm] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    supervisor_id: '',
    allocation_date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [allocating, setAllocating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchAllocations();
    fetchAvailableStudents();
    fetchAvailableSupervisors();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        
        // Only admin and super_admin can access this page
        if (data.user.role_name !== 'admin' && data.user.role_name !== 'super_admin') {
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

  const fetchAllocations = async () => {
    try {
      const response = await fetch('/api/admin/allocate-supervisor');
      if (response.ok) {
        const data = await response.json();
        setAllocations(data.allocations);
      }
    } catch (error) {
      console.error('Failed to fetch allocations:', error);
    }
  };

  const fetchAvailableStudents = async () => {
    try {
      const response = await fetch('/api/admin/available-students');
      if (response.ok) {
        const data = await response.json();
        setAvailableStudents(data.students);
      }
    } catch (error) {
      console.error('Failed to fetch available students:', error);
    }
  };

  const fetchAvailableSupervisors = async () => {
    try {
      const response = await fetch('/api/admin/available-supervisors');
      if (response.ok) {
        const data = await response.json();
        setAvailableSupervisors(data.supervisors);
      }
    } catch (error) {
      console.error('Failed to fetch available supervisors:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    setAllocating(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/allocate-supervisor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setFormData({
          student_id: '',
          supervisor_id: '',
          allocation_date: new Date().toISOString().split('T')[0],
          notes: ''
        });
        setShowAllocateForm(false);
        fetchAllocations();
        fetchAvailableStudents();
        fetchAvailableSupervisors();
      } else {
        setError(data.error || 'Failed to allocate supervisor');
      }
    } catch (error) {
      setError('An error occurred while allocating supervisor');
      console.error('Allocate supervisor error:', error);
    } finally {
      setAllocating(false);
    }
  };

  const handleDeallocate = async (allocationId: number) => {
    if (!confirm('Are you sure you want to deallocate this supervisor? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/allocate-supervisor', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          allocation_id: allocationId,
          action: 'deallocate'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        fetchAllocations();
        fetchAvailableStudents();
        fetchAvailableSupervisors();
      } else {
        setError(data.error || 'Failed to deallocate supervisor');
      }
    } catch (error) {
      setError('An error occurred while deallocating supervisor');
      console.error('Deallocate supervisor error:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'terminated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-600';
    if (progress >= 50) return 'bg-yellow-600';
    if (progress >= 20) return 'bg-orange-600';
    return 'bg-red-600';
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
        <h1 className="text-3xl font-bold text-gray-900">Supervisor Allocation</h1>
        <p className="mt-2 text-gray-600">Manage supervisor-student assignments</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Allocations</h3>
          <div className="text-3xl font-bold text-blue-600 mb-2">{allocations.length}</div>
          <p className="text-sm text-gray-600">Active allocations</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Available Students</h3>
          <div className="text-3xl font-bold text-orange-600 mb-2">{availableStudents.length}</div>
          <p className="text-sm text-gray-600">Awaiting allocation</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Available Supervisors</h3>
          <div className="text-3xl font-bold text-green-600 mb-2">{availableSupervisors.length}</div>
          <p className="text-sm text-gray-600">With capacity</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Capacity</h3>
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {availableSupervisors.reduce((sum, sup) => sum + sup.available_capacity, 0)}
          </div>
          <p className="text-sm text-gray-600">Available slots</p>
        </div>
      </div>

      {/* Allocation Actions */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Allocation Management</h3>
            <button
              onClick={() => setShowAllocateForm(true)}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              New Allocation
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Available Students ({availableStudents.length})</h4>
              <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
                {availableStudents.length === 0 ? (
                  <p className="text-sm text-gray-500">No students available for allocation</p>
                ) : (
                  <div className="space-y-2">
                    {availableStudents.map((student) => (
                      <div key={student.id} className="flex justify-between items-center p-2 border-b border-gray-100">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {student.first_name} {student.last_name}
                          </p>
                          <p className="text-xs text-gray-500">{student.registration_number}</p>
                        </div>
                        <span className="text-xs text-gray-500">{student.program}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Available Supervisors ({availableSupervisors.length})</h4>
              <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
                {availableSupervisors.length === 0 ? (
                  <p className="text-sm text-gray-500">No supervisors with available capacity</p>
                ) : (
                  <div className="space-y-2">
                    {availableSupervisors.map((supervisor) => (
                      <div key={supervisor.id} className="flex justify-between items-center p-2 border-b border-gray-100">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {supervisor.first_name} {supervisor.last_name}
                          </p>
                          <p className="text-xs text-gray-500">{supervisor.specialization}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {supervisor.current_students}/{supervisor.max_students}
                          </p>
                          <p className="text-xs text-green-600">{supervisor.available_capacity} slots</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Allocation Form Modal */}
      {showAllocateForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900">Allocate Supervisor</h3>
              <button
                onClick={() => setShowAllocateForm(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12M6 6v12M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 border-green-200 text-green-600 rounded-md">
                {success}
              </div>
            )}

            <form onSubmit={handleAllocate} className="space-y-4">
              <div>
                <label htmlFor="student_id" className="block text-sm font-medium text-gray-700">
                  Student
                </label>
                <select
                  name="student_id"
                  id="student_id"
                  value={formData.student_id}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  required
                >
                  <option value="">Select a student</option>
                  {availableStudents.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.first_name} {student.last_name} ({student.registration_number})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="supervisor_id" className="block text-sm font-medium text-gray-700">
                  Supervisor
                </label>
                <select
                  name="supervisor_id"
                  id="supervisor_id"
                  value={formData.supervisor_id}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  required
                >
                  <option value="">Select a supervisor</option>
                  {availableSupervisors.map((supervisor) => (
                    <option key={supervisor.id} value={supervisor.id}>
                      {supervisor.first_name} {supervisor.last_name} ({supervisor.available_capacity} slots available)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="allocation_date" className="block text-sm font-medium text-gray-700">
                  Allocation Date
                </label>
                <input
                  type="date"
                  name="allocation_date"
                  id="allocation_date"
                  value={formData.allocation_date}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  id="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="Any additional notes about this allocation"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAllocateForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={allocating}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {allocating ? 'Allocating...' : 'Allocate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Allocations List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Current Allocations ({allocations.length})
          </h3>
          <div className="space-y-6">
            {allocations.map((allocation) => (
              <div key={allocation.id} className="border rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      {allocation.student_name} → {allocation.supervisor_name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-1">
                      {allocation.student_email} • {allocation.registration_number}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      {allocation.supervisor_email} • {allocation.supervisor_department}
                    </p>
                    <p className="text-sm text-gray-600">
                      {allocation.supervisor_phone}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(allocation.status)}`}>
                      {allocation.status}
                    </span>
                    <button
                      onClick={() => handleDeallocate(allocation.id)}
                      className="px-3 py-1 border border-red-300 rounded-md shadow-sm text-xs font-medium text-red-700 bg-white hover:bg-red-50"
                    >
                      Deallocate
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <h5 className="font-medium text-gray-900 mb-2">Research Title</h5>
                  <p className="text-sm text-gray-700">{allocation.research_title}</p>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="font-medium text-gray-900">Progress</h5>
                    <span className="text-sm text-gray-600">{allocation.progress_percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressColor(allocation.progress_percentage)}`}
                      style={{ width: `${allocation.progress_percentage}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-1">Allocation Date</h5>
                    <p className="text-sm text-gray-600">
                      {new Date(allocation.allocation_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  {allocation.last_meeting && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-1">Last Meeting</h5>
                      <p className="text-sm text-gray-600">
                        {new Date(allocation.last_meeting).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                  {allocation.next_meeting && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-1">Next Meeting</h5>
                      <p className="text-sm text-gray-600">
                        {new Date(allocation.next_meeting).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
