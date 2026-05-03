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
  GraduationCap, 
  MessageSquare, 
  Calendar, 
  BookOpen, 
  FileText, 
  UserCheck,
  TrendingUp,
  Bell,
  Phone,
  Mail
} from 'lucide-react';
import { useDebounce } from '@/hooks/usePerformanceOptimizations';

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  registration_number: string;
  program: string;
  enrollment_date: string;
  expected_completion_date: string;
}

interface Submission {
  id: number;
  title: string;
  document_type: string;
  status: string;
  submitted_at: string;
  feedback?: string;
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
}

interface Supervisor {
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  specialization: string;
}

export default function MobileStudentPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Debounced search
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // State for data
  const [student, setStudent] = useState<Student | null>(null);
  const [supervisor, setSupervisor] = useState<Supervisor | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
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
          
          if (userData.user.role_name !== 'student') {
            router.push('/dashboard');
            return;
          }

          // Fetch student data
          const [studentData, supervisorData, submissionsData, messagesData, meetingsData] = await Promise.all([
            fetch('/api/student/profile'),
            fetch('/api/student/supervisor'),
            fetch('/api/student/submissions'),
            fetch('/api/student/messages'),
            fetch('/api/student/meetings')
          ]);

          if (studentData.ok) {
            setStudent(await studentData.json());
          }
          if (supervisorData.ok) {
            setSupervisor(await supervisorData.json());
          }
          if (submissionsData.ok) {
            const subData = await submissionsData.json();
            setSubmissions(subData.submissions || []);
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

  // Calculate stats
  const stats = {
    submissions: submissions.length,
    pendingSubmissions: submissions.filter(s => s.status === 'pending' || s.status === 'submitted').length,
    approvedSubmissions: submissions.filter(s => s.status === 'approved').length,
    unreadMessages: messages.filter(m => !m.is_read).length,
    upcomingMeetings: meetings.filter(m => 
      m.approval_status === 'approved' && 
      new Date(`${m.meeting_date}T${m.meeting_time}`) > new Date()
    ).length
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600';
      case 'pending': case 'submitted': return 'text-orange-600';
      case 'needs_revision': case 'reviewed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return '✅';
      case 'pending': case 'submitted': return '⏳';
      case 'needs_revision': case 'reviewed': return '🔄';
      default: return '📄';
    }
  };

  if (loading) {
    return (
      <MobileLayout user={{ name: 'Loading...', email: '', role: 'student' }}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
        </div>
      </MobileLayout>
    );
  }

  if (!user || !student) {
    return null;
  }

  return (
    <MobileLayout 
      user={user} 
      title="Student Dashboard"
      showSearch={true}
    >
      <div className="p-4 space-y-4">
        {/* Student Info */}
        <MobileCard title="Student Information">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {student.first_name[0]}{student.last_name[0]}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {student.first_name} {student.last_name}
                </h3>
                <p className="text-sm text-gray-600">{student.registration_number}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-600">Program</p>
                <p className="text-sm font-medium">{student.program}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Enrolled</p>
                <p className="text-sm font-medium">
                  {new Date(student.enrollment_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </MobileCard>

        {/* Supervisor Info */}
        {supervisor && (
          <MobileCard title="My Supervisor">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {supervisor.first_name[0]}{supervisor.last_name[0]}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {supervisor.first_name} {supervisor.last_name}
                  </h4>
                  <p className="text-sm text-gray-600">{supervisor.department}</p>
                </div>
              </div>
              <div className="space-y-2">
                <MobileListItem
                  title="Email"
                  subtitle={supervisor.email}
                  icon="📧"
                  onClick={() => window.open(`mailto:${supervisor.email}`)}
                />
                <MobileListItem
                  title="Specialization"
                  subtitle={supervisor.specialization}
                  icon="🎓"
                />
              </div>
            </div>
          </MobileCard>
        )}

        {/* Stats Grid */}
        <MobileStatsGrid>
          <MobileStatCard
            title="Submissions"
            value={stats.submissions}
            change={stats.submissions > 0 ? 15 : 0}
            changeType="increase"
            icon="📄"
          />
          <MobileStatCard
            title="Pending"
            value={stats.pendingSubmissions}
            change={stats.pendingSubmissions > 0 ? 8 : 0}
            changeType={stats.pendingSubmissions > 0 ? "increase" : "neutral"}
            icon="⏳"
          />
          <MobileStatCard
            title="Messages"
            value={stats.unreadMessages}
            change={stats.unreadMessages > 0 ? 5 : 0}
            changeType={stats.unreadMessages > 0 ? "increase" : "neutral"}
            icon="💬"
          />
          <MobileStatCard
            title="Meetings"
            value={stats.upcomingMeetings}
            change={stats.upcomingMeetings > 0 ? 3 : 0}
            changeType={stats.upcomingMeetings > 0 ? "increase" : "neutral"}
            icon="📅"
          />
        </MobileStatsGrid>

        {/* Quick Actions */}
        <MobileCard title="Quick Actions">
          <div className="grid grid-cols-2 gap-3">
            <MobileButton
              variant="primary"
              onClick={() => router.push('/dashboard/submissions')}
              icon="📄"
            >
              Submit Work
            </MobileButton>
            <MobileButton
              variant="secondary"
              onClick={() => router.push('/dashboard/messages')}
              icon="💬"
            >
              Message
            </MobileButton>
            <MobileButton
              variant="outline"
              onClick={() => router.push('/dashboard/progress')}
              icon="📊"
            >
              Progress
            </MobileButton>
            <MobileButton
              variant="outline"
              onClick={() => router.push('/dashboard/my-supervisor')}
              icon="👨‍🏫"
            >
              Supervisor
            </MobileButton>
          </div>
        </MobileCard>

        {/* Recent Submissions */}
        {submissions.length > 0 && (
          <MobileCard 
            title="Recent Submissions"
            subtitle={`${stats.pendingSubmissions} pending review`}
            action={
              <MobileButton
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard/submissions')}
              >
                View All
              </MobileButton>
            }
          >
            <div className="space-y-3">
              {submissions.slice(0, 3).map((submission) => (
                <MobileListItem
                  key={submission.id}
                  title={submission.title}
                  subtitle={submission.document_type}
                  badge={submission.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  icon="📄"
                  onClick={() => router.push(`/dashboard/submissions/${submission.id}`)}
                />
              ))}
            </div>
          </MobileCard>
        )}

        {/* Recent Messages */}
        {messages.length > 0 && (
          <MobileCard 
            title="Recent Messages"
            subtitle={`${stats.unreadMessages} unread`}
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
                onClick={() => router.push('/dashboard/student')}
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
                    onClick={() => router.push('/dashboard/student')}
                  />
                ))}
            </div>
          </MobileCard>
        )}

        {/* Progress Overview */}
        <MobileCard title="Research Progress">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Overall Progress</span>
              <span className="text-sm font-medium text-blue-600">65%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-400 to-green-400 h-2 rounded-full" style={{ width: '65%' }}></div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-600">Started:</span>
                <span className="font-medium block">{new Date(student.enrollment_date).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-gray-600">Expected:</span>
                <span className="font-medium block">{new Date(student.expected_completion_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </MobileCard>

        {/* Quick Links */}
        <MobileCard title="Quick Links">
          <div className="space-y-3">
            <MobileListItem
              title="Guidelines"
              subtitle="Research guidelines and resources"
              icon="📚"
              onClick={() => router.push('/dashboard/guidelines')}
            />
            <MobileListItem
              title="Deadlines"
              subtitle="Important dates and milestones"
              icon="📅"
              onClick={() => router.push('/dashboard/deadlines')}
            />
            <MobileListItem
              title="Research Progress"
              subtitle="Track your research milestones"
              icon="📊"
              onClick={() => router.push('/dashboard/progress')}
            />
          </div>
        </MobileCard>

        {/* Contact Information */}
        <MobileCard title="Contact Information">
          <div className="space-y-3">
            <MobileListItem
              title="Email"
              subtitle={student.email}
              icon="📧"
              onClick={() => window.open(`mailto:${student.email}`)}
            />
            {student.phone && (
              <MobileListItem
                title="Phone"
                subtitle={student.phone}
                icon="📞"
                onClick={() => window.open(`tel:${student.phone}`)}
              />
            )}
          </div>
        </MobileCard>
      </div>
    </MobileLayout>
  );
}
