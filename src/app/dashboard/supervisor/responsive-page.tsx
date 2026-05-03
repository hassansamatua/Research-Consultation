'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  SimpleResponsiveDashboard,
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveCard,
  ResponsiveStatCard,
  ResponsiveTable,
  ResponsiveButton,
  useBreakpoint
} from '@/components/ui/SimpleResponsiveDashboard';
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  TrendingUp, 
  Search, 
  Filter,
  ChevronRight,
  Phone,
  Mail,
  BookOpen,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  RefreshCw
} from 'lucide-react';

interface Supervisor {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department: string;
  specialization: string;
  max_students: number;
}

interface Allocation {
  id: number;
  student_id: number;
  student_first_name: string;
  student_last_name: string;
  student_email: string;
  registration_number: string;
  program: string;
  allocated_at: string;
}

interface Message {
  id: number;
  sender_first_name: string;
  sender_last_name: string;
  subject: string;
  message_text: string;
  is_read: boolean;
  created_at: string;
}

interface Meeting {
  id: number;
  title: string;
  description: string;
  meeting_date: string;
  meeting_time: string;
  location: string;
  approval_status: string;
  requested_by: string;
  student_first_name: string;
  student_last_name: string;
}

export default function ResponsiveSupervisorPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === 'xs' || breakpoint === 'sm';
  const isTablet = breakpoint === 'md';
  const isDesktop = breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === 'xxl';
  
  // State for data
  const [supervisor, setSupervisor] = useState<Supervisor | null>(null);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user info
        const authResponse = await fetch('/api/auth/me');
        if (authResponse.ok) {
          const userData = await authResponse.json();
          setUser(userData.user);
          
          if (userData.user.role_name !== 'supervisor') {
            router.push('/dashboard');
            return;
          }

          // Fetch dashboard data
          const [supervisorData, allocationsData, messagesData, meetingsData] = await Promise.all([
            fetch('/api/supervisor/profile'),
            fetch('/api/supervisor/allocations'),
            fetch('/api/messages'),
            fetch('/api/meetings')
          ]);

          if (supervisorData.ok) {
            setSupervisor(await supervisorData.json());
          }
          if (allocationsData.ok) {
            const allocData = await allocationsData.json();
            setAllocations(allocData.allocations || []);
          }
          if (messagesData.ok) {
            const msgData = await messagesData.json();
            setMessages(msgData.messages || []);
          }
          if (meetingsData.ok) {
            const meetData = await meetingsData.json();
            setMeetings(meetData.meetings || []);
          }
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Fetch error:', error);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Filter data based on search
  const filteredAllocations = allocations.filter(allocation =>
    allocation.student_first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    allocation.student_last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    allocation.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    allocation.program.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const stats = {
    totalStudents: allocations.length,
    unreadMessages: messages.filter(m => !m.is_read).length,
    upcomingMeetings: meetings.filter(m => 
      m.approval_status === 'approved' && 
      new Date(`${m.meeting_date}T${m.meeting_time}`) > new Date()
    ).length,
    pendingRequests: meetings.filter(m => 
      m.approval_status === 'pending' && m.requested_by === 'student'
    ).length
  };

  if (loading) {
    return (
      <SimpleResponsiveDashboard user={{ name: 'Loading...', email: '', role: 'supervisor' }}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
        </div>
      </SimpleResponsiveDashboard>
    );
  }

  if (!user || !supervisor) {
    return null;
  }

  return (
    <SimpleResponsiveDashboard user={user}>
      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <ResponsiveButton
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </ResponsiveButton>
            
            <ResponsiveButton
              variant="outline"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </ResponsiveButton>
          </div>
        </div>

        {/* Stats Grid */}
        <ResponsiveGrid cols={{ xs: 1, sm: 2, md: 2, lg: 4, xl: 4, xxl: 4 }}>
          <ResponsiveStatCard
            title="Students"
            value={stats.totalStudents}
            change={12}
            changeType="increase"
            icon="👥"
          />
          <ResponsiveStatCard
            title="Messages"
            value={stats.unreadMessages}
            change={stats.unreadMessages > 0 ? 8 : 0}
            changeType={stats.unreadMessages > 0 ? "increase" : "neutral"}
            icon="💬"
          />
          <ResponsiveStatCard
            title="Meetings"
            value={stats.upcomingMeetings}
            change={3}
            changeType="increase"
            icon="📅"
          />
          <ResponsiveStatCard
            title="Requests"
            value={stats.pendingRequests}
            change={stats.pendingRequests > 0 ? 5 : 0}
            changeType={stats.pendingRequests > 0 ? "increase" : "neutral"}
            icon="📋"
          />
        </ResponsiveGrid>

        {/* Department Info */}
        <ResponsiveCard>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Information</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Department</p>
                <p className="text-sm font-medium">{supervisor.department}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Specialization</p>
                <p className="text-sm font-medium">{supervisor.specialization}</p>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Student Capacity</span>
                <span className="text-sm font-medium">{allocations.length}/{supervisor.max_students}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min((allocations.length / supervisor.max_students) * 100, 100)}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </ResponsiveCard>

        {/* Quick Actions */}
        <ResponsiveCard>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <ResponsiveGrid cols={{ xs: 1, sm: 2, md: 2, lg: 4, xl: 4, xxl: 4 }}>
            <ResponsiveButton
              variant="primary"
              onClick={() => router.push('/dashboard/messages')}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Messages
            </ResponsiveButton>
            <ResponsiveButton
              variant="secondary"
              onClick={() => router.push('/dashboard/students')}
            >
              <Users className="h-4 w-4 mr-2" />
              Students
            </ResponsiveButton>
            <ResponsiveButton
              variant="outline"
              onClick={() => router.push('/dashboard/calendar')}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Calendar
            </ResponsiveButton>
            <ResponsiveButton
              variant="outline"
              onClick={() => router.push('/dashboard/profile')}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Profile
            </ResponsiveButton>
          </ResponsiveGrid>
        </ResponsiveCard>

        {/* Students Table */}
        <ResponsiveCard>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Assigned Students</h3>
            <div className="flex gap-2">
              <ResponsiveButton variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </ResponsiveButton>
              <ResponsiveButton variant="primary" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </ResponsiveButton>
            </div>
          </div>
          
          <ResponsiveTable
            headers={['Name', 'Registration', 'Program', 'Email', 'Actions']}
            data={filteredAllocations.map(allocation => ({
              Name: `${allocation.student_first_name} ${allocation.student_last_name}`,
              Registration: allocation.registration_number,
              Program: allocation.program,
              Email: allocation.student_email,
              Actions: (
                <div className="flex gap-2">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Eye className="h-4 w-4 text-gray-600" />
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <MessageSquare className="h-4 w-4 text-gray-600" />
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Calendar className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              )
            }))}
          />
          
          {filteredAllocations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🔍</div>
              <p>No students found matching your search.</p>
            </div>
          )}
        </ResponsiveCard>

        {/* Recent Messages */}
        {messages.length > 0 && (
          <ResponsiveCard>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Messages</h3>
              <ResponsiveButton variant="ghost" size="sm">
                View All
              </ResponsiveButton>
            </div>
            
            <div className="space-y-3">
              {messages.slice(0, 3).map((message) => (
                <div key={message.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {message.sender_first_name} {message.sender_last_name}
                      </p>
                      <p className="text-xs text-gray-600">{message.subject}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!message.is_read && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                    <span className="text-xs text-gray-500">
                      {new Date(message.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ResponsiveCard>
        )}

        {/* Upcoming Meetings */}
        {meetings.length > 0 && (
          <ResponsiveCard>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Meetings</h3>
              <ResponsiveButton variant="ghost" size="sm">
                View All
              </ResponsiveButton>
            </div>
            
            <div className="space-y-3">
              {meetings
                .filter(m => m.approval_status === 'approved')
                .slice(0, 3)
                .map((meeting) => (
                  <div key={meeting.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{meeting.title}</p>
                        <p className="text-xs text-gray-600">
                          {meeting.student_first_name} {meeting.student_last_name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-900">
                        {new Date(meeting.meeting_date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-600">{meeting.meeting_time}</p>
                    </div>
                  </div>
                ))}
            </div>
          </ResponsiveCard>
        )}

        {/* Contact Information */}
        <ResponsiveCard>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">Email</span>
              </div>
              <a 
                href={`mailto:${supervisor.email}`}
                className="text-sm text-blue-600 hover:underline"
              >
                {supervisor.email}
              </a>
            </div>
            
            {supervisor.phone && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium">Phone</span>
                </div>
                <a 
                  href={`tel:${supervisor.phone}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {supervisor.phone}
                </a>
              </div>
            )}
          </div>
        </ResponsiveCard>
      </div>
    </SimpleResponsiveDashboard>
  );
}
