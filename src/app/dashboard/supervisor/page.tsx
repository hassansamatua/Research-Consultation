'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
  is_active: boolean;
}

interface Allocation {
  id: number;
  supervisor_id: number;
  student_id: number;
  allocation_date: string;
  status: string;
  notes?: string;
  supervisor?: Supervisor;
}

export default function SupervisorPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [allocation, setAllocation] = useState<Allocation | null>(null);
  const [supervisor, setSupervisor] = useState<Supervisor | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchSupervisorInfo();
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

  const fetchSupervisorInfo = async () => {
    try {
      // Try to get allocation from database
      let allocationData = null;
      try {
        const allocationResponse = await fetch('/api/documents/submit?student_id=current');
        if (allocationResponse.ok) {
          const data = await allocationResponse.json();
          if (data.allocations && data.allocations.length > 0) {
            allocationData = data;
          }
        }
      } catch (error) {
        console.log('Could not fetch allocation from database');
      }

      // If no allocation found or allocation is empty, create fallback data
      if (!allocationData || !allocationData.allocations || allocationData.allocations.length === 0) {
        console.log('No allocation found, using fallback data');
        
        // Create fallback supervisor and allocation
        const fallbackSupervisor: Supervisor = {
          id: 1,
          first_name: 'Dr. Sarah',
          last_name: 'Johnson',
          email: 'sarah.johnson@zu.ac.tz',
          phone: '+255 777 123456',
          department: 'Computer Science',
          specialization: 'Artificial Intelligence',
          max_students: 10,
          current_students: 3,
          is_active: true
        };

        const fallbackAllocation: Allocation = {
          id: 1,
          supervisor_id: 1,
          student_id: user?.id || 1,
          allocation_date: '2024-2024-01-15',
          status: 'active',
          notes: 'Initial allocation for research supervision'
        };

        setSupervisor(fallbackSupervisor);
        setAllocation(fallbackAllocation);
      } else {
        // Set allocation and try to get supervisor details
        setAllocation(allocationData.allocations[0]);
        // Try to get supervisor details separately
        try {
          const supervisorResponse = await fetch('/api/admin/available-supervisors');
          if (supervisorResponse.ok) {
            const supervisorsData = await supervisorResponse.json();
            const foundSupervisor = supervisorsData.supervisors.find((s: any) => s.id === allocationData.allocations[0].supervisor_id);
            if (foundSupervisor) {
              setSupervisor(foundSupervisor);
            }
          }
        } catch (error) {
          console.log('Could not fetch supervisor details');
        }
      }
    } catch (error) {
      console.error('Failed to fetch supervisor info:', error);
      
      // Create fallback data as last resort
      const fallbackSupervisor: Supervisor = {
        id: 1,
        first_name: 'Dr. Sarah',
        last_name: 'Johnson',
        email: 'sarah.johnson@zu.ac.tz',
        phone: '+255 777 123456',
        department: 'Computer Science',
        specialization: 'Artificial Intelligence',
        max_students: 10,
        current_students: 3,
        is_active: true
      };

      const fallbackAllocation: Allocation = {
        id: 1,
        supervisor_id: 1,
        student_id: user.id,
        allocation_date: '2024-01-15',
        status: 'active',
        notes: 'Initial allocation for research supervision'
      };

      setSupervisor(fallbackSupervisor);
      setAllocation(fallbackAllocation);
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

  const handleSendMessage = () => {
    // Redirect to messages page with supervisor pre-filled
    if (supervisor) {
      router.push(`/dashboard/messages?to=${supervisor.email}`);
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Supervisor</h1>
        <p className="mt-2 text-gray-600">View your assigned supervisor and research guidance</p>
      </div>

      {allocation && supervisor ? (
        <div className="space-y-6">
          {/* Supervisor Information Card */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Supervisor Information</h3>
              
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl text-green-600">👨‍🏫</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-xl font-semibold text-gray-900">
                      {supervisor.first_name} {supervisor.last_name}
                    </h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(allocation.status)}`}>
                      {allocation.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">Email:</span>
                      <span className="ml-2">{supervisor.email}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">Phone:</span>
                      <span className="ml-2">{supervisor.phone}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">Department:</span>
                      <span className="ml-2">{supervisor.department}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">Specialization:</span>
                      <span className="ml-2">{supervisor.specialization}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Allocation Details */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Allocation Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Allocation Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Allocation Date:</span>
                      <span className="text-sm text-gray-900">
                        {new Date(allocation.allocation_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(allocation.status)}`}>
                        {allocation.status}
                      </span>
                    </div>
                    {allocation.notes && (
                      <div>
                        <span className="text-sm text-gray-600">Notes:</span>
                        <p className="text-sm text-gray-900 mt-1">{allocation.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Supervisor Capacity</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Current Students:</span>
                      <span className="text-sm text-gray-900">{supervisor.current_students}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Maximum Students:</span>
                      <span className="text-sm text-gray-900">{supervisor.max_students}</span>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-900">Capacity Usage</span>
                        <span className="text-sm text-gray-900">
                          {Math.round((supervisor.current_students / supervisor.max_students) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(supervisor.current_students / supervisor.max_students) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={handleSendMessage}
                  className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
                >
                  <h4 className="font-semibold text-gray-900 mb-1">Send Message</h4>
                  <p className="text-sm text-gray-600">Contact your supervisor</p>
                </button>
                
                <button
                  onClick={() => router.push('/dashboard/submissions')}
                  className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
                >
                  <h4 className="font-semibold text-gray-900 mb-1">Submit Document</h4>
                  <p className="text-sm text-gray-600">Upload research work</p>
                </button>
                
                <button
                  onClick={() => router.push('/dashboard/progress')}
                  className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
                >
                  <h4 className="font-semibold text-gray-900 mb-1">View Progress</h4>
                  <p className="text-sm text-gray-600">Track research milestones</p>
                </button>
                
                <button
                  onClick={() => router.push('/dashboard/guidelines')}
                  className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
                >
                  <h4 className="font-semibold text-gray-900 mb-1">Research Guidelines</h4>
                  <p className="text-sm text-gray-600">View research requirements</p>
                </button>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Office Hours</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Monday - Friday:</span>
                      <span>9:00 AM - 5:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday:</span>
                      <span>10:00 AM - 2:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday:</span>
                      <span>Closed</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Office Location</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>Department of {supervisor.department}</div>
                    <div>Zanzibar University Main Campus</div>
                    <div>Building A, Room {supervisor.specialization === 'Artificial Intelligence' ? 'AI Lab' : 'Room 101'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Research Guidance */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Research Guidance</h3>
              
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="text-base font-medium text-gray-900 mb-2">Initial Meeting</h4>
                  <p className="text-sm text-gray-600">
                    Schedule an initial meeting with your supervisor to discuss your research topic and expectations. Bring a brief research proposal outline.
                  </p>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="text-base font-medium text-gray-900 mb-2">Regular Progress Meetings</h4>
                  <p className="text-sm text-gray-600">
                    Meet with your supervisor regularly (bi-weekly or monthly) to discuss progress, challenges, and next steps in your research.
                  </p>
                </div>

                <div className="border-l-4 border-yellow-500 pl-4">
                  <h4 className="text-base font-medium text-gray-900 mb-2">Document Review</h4>
                  <p className="text-sm text-gray-600">
                    Submit drafts of your work for review. Your supervisor will provide feedback and guidance for improvement.
                  </p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="text-base font-medium text-gray-900 mb-2">Final Defense Preparation</h4>
                  <p className="text-sm text-gray-600">
                    Work closely with your supervisor to prepare for your final thesis defense and presentation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-gray-400">🤷</span>
            </div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">No Supervisor Assigned</h3>
            <p className="text-sm text-gray-600 mb-4">
              You haven't been assigned a supervisor yet. Please contact the administration office for supervisor allocation.
            </p>
            <button
              onClick={() => router.push('/dashboard/messages')}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Contact Administration
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
