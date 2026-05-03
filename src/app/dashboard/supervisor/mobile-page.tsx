'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MobileLayout, 
  MobileCard, 
  MobileStatsGrid, 
  MobileStatCard, 
  MobileListItem,
  MobileButton,
  MobileSearchBar
} from '@/components/ui/MobileLayout';
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
  BookOpen
} from 'lucide-react';
import { useDebounce } from '@/hooks/usePerformanceOptimizations';

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

export default function MobileSupervisorPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showFilters, setShowFilters] = useState(false);
  
  // Debounced search
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

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
    allocation.student_first_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    allocation.student_last_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    allocation.registration_number.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    allocation.program.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
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
      <MobileLayout user={{ name: 'Loading...', email: '', role: 'supervisor' }}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
        </div>
      </MobileLayout>
    );
  }

  if (!user || !supervisor) {
    return null;
  }

  return (
    <MobileLayout 
      user={user} 
      title="Supervisor Dashboard"
      showSearch={true}
    >
      <div className="p-4 space-y-4">
        {/* Search and Filters */}
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <MobileSearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              onClear={() => setSearchTerm('')}
              placeholder="Search students..."
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {/* Stats Grid */}
        <MobileStatsGrid>
          <MobileStatCard
            title="Students"
            value={stats.totalStudents}
            change={12}
            changeType="increase"
            icon="👥"
          />
          <MobileStatCard
            title="Messages"
            value={stats.unreadMessages}
            change={stats.unreadMessages > 0 ? 8 : 0}
            changeType={stats.unreadMessages > 0 ? "increase" : "neutral"}
            icon="💬"
          />
          <MobileStatCard
            title="Meetings"
            value={stats.upcomingMeetings}
            change={3}
            changeType="increase"
            icon="📅"
          />
          <MobileStatCard
            title="Requests"
            value={stats.pendingRequests}
            change={stats.pendingRequests > 0 ? 5 : 0}
            changeType={stats.pendingRequests > 0 ? "increase" : "neutral"}
            icon="📋"
          />
        </MobileStatsGrid>

        {/* Department Info */}
        <MobileCard
          title="Department Information"
          subtitle={`${allocations.length}/${supervisor.max_students} students assigned`}
        >
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Department</span>
              <span className="text-sm font-medium">{supervisor.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Specialization</span>
              <span className="text-sm font-medium">{supervisor.specialization}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.min((allocations.length / supervisor.max_students) * 100, 100)}%` 
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Capacity</span>
              <span>{allocations.length}/{supervisor.max_students}</span>
            </div>
          </div>
        </MobileCard>

        {/* Quick Actions */}
        <MobileCard title="Quick Actions">
          <div className="grid grid-cols-2 gap-3">
            <MobileButton
              variant="primary"
              onClick={() => router.push('/dashboard/messages')}
              icon="💬"
            >
              Messages
            </MobileButton>
            <MobileButton
              variant="secondary"
              onClick={() => router.push('/dashboard/students')}
              icon="👥"
            >
              Students
            </MobileButton>
            <MobileButton
              variant="outline"
              onClick={() => router.push('/dashboard/notifications')}
              icon="🔔"
            >
              Alerts
            </MobileButton>
            <MobileButton
              variant="outline"
              onClick={() => router.push('/dashboard/profile')}
              icon="👤"
            >
              Profile
            </MobileButton>
          </div>
        </MobileCard>

        {/* Students List */}
        <MobileCard 
          title="Assigned Students" 
          subtitle={`${filteredAllocations.length} students found`}
          action={
            filteredAllocations.length > 0 && (
              <MobileButton
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard/students')}
              >
                View All
              </MobileButton>
            )
          }
        >
          <div className="space-y-3">
            {filteredAllocations.slice(0, 5).map((allocation) => (
              <MobileListItem
                key={allocation.id}
                title={`${allocation.student_first_name} ${allocation.student_last_name}`}
                subtitle={allocation.registration_number}
                badge={allocation.program}
                icon="👨‍🎓"
                onClick={() => router.push(`/dashboard/students/${allocation.student_id}`)}
              />
            ))}
            
            {filteredAllocations.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🔍</div>
                <p>No students found matching your search.</p>
              </div>
            )}
            
            {filteredAllocations.length > 5 && (
              <div className="text-center pt-2">
                <MobileButton
                  variant="outline"
                  fullWidth
                  onClick={() => router.push('/dashboard/students')}
                >
                  View All {filteredAllocations.length} Students
                </MobileButton>
              </div>
            )}
          </div>
        </MobileCard>

        {/* Recent Messages */}
        {messages.length > 0 && (
          <MobileCard 
            title="Recent Messages"
            subtitle={`${messages.filter(m => !m.is_read).length} unread`}
            action={
              <MobileButton
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard/messages')}
              >
                View All
              </MobileButton>
            }
          >
            <div className="space-y-3">
              {messages.slice(0, 3).map((message) => (
                <MobileListItem
                  key={message.id}
                  title={`${message.sender_first_name} ${message.sender_last_name}`}
                  subtitle={message.subject}
                  badge={!message.is_read ? "New" : undefined}
                  icon="💬"
                  onClick={() => router.push('/dashboard/messages')}
                />
              ))}
            </div>
          </MobileCard>
        )}

        {/* Upcoming Meetings */}
        {meetings.length > 0 && (
          <MobileCard 
            title="Upcoming Meetings"
            subtitle={`${stats.upcomingMeetings} scheduled`}
            action={
              <MobileButton
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard/supervisor')}
              >
                View All
              </MobileButton>
            }
          >
            <div className="space-y-3">
              {meetings
                .filter(m => m.approval_status === 'approved')
                .slice(0, 3)
                .map((meeting) => (
                  <MobileListItem
                    key={meeting.id}
                    title={meeting.title}
                    subtitle={`${new Date(meeting.meeting_date).toLocaleDateString()} at ${meeting.meeting_time}`}
                    icon="📅"
                    onClick={() => router.push('/dashboard/supervisor')}
                  />
                ))}
            </div>
          </MobileCard>
        )}

        {/* Contact Information */}
        <MobileCard title="Contact Information">
          <div className="space-y-3">
            <MobileListItem
              title="Email"
              subtitle={supervisor.email}
              icon="📧"
              onClick={() => window.open(`mailto:${supervisor.email}`)}
            />
            {supervisor.phone && (
              <MobileListItem
                title="Phone"
                subtitle={supervisor.phone}
                icon="📞"
                onClick={() => window.open(`tel:${supervisor.phone}`)}
              />
            )}
            <MobileListItem
              title="Department"
              subtitle={supervisor.department}
              icon="🏢"
            />
          </div>
        </MobileCard>

        {/* Quick Links */}
        <MobileCard title="Quick Links">
          <div className="space-y-3">
            <MobileListItem
              title="Guidelines"
              subtitle="Research guidelines and policies"
              icon="📚"
              onClick={() => router.push('/dashboard/guidelines')}
            />
            <MobileListItem
              title="Deadlines"
              subtitle="Important dates and deadlines"
              icon="📅"
              onClick={() => router.push('/dashboard/deadlines')}
            />
            <MobileListItem
              title="Review Submissions"
              subtitle="Student work to review"
              icon="📝"
              onClick={() => router.push('/dashboard/review')}
            />
          </div>
        </MobileCard>
      </div>
    </MobileLayout>
  );
}
