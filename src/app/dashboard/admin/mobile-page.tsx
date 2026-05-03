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
  Shield, 
  Users, 
  MessageSquare, 
  Calendar, 
  FileText, 
  TrendingUp,
  Bell,
  Settings,
  UserPlus,
  BarChart3,
  PieChart,
  Activity,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useDebounce } from '@/hooks/usePerformanceOptimizations';

interface AdminStats {
  totalUsers: number;
  totalStudents: number;
  totalSupervisors: number;
  totalAdmins: number;
  totalSubmissions: number;
  pendingSubmissions: number;
  approvedSubmissions: number;
  totalMessages: number;
  totalMeetings: number;
  pendingMeetings: number;
  completedMeetings: number;
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role_name: string;
  is_active: boolean;
  created_at: string;
}

interface Submission {
  id: number;
  title: string;
  document_type: string;
  status: string;
  submitted_at: string;
  student_first_name: string;
  student_last_name: string;
  student_email: string;
}

interface Meeting {
  id: number;
  title: string;
  meeting_date: string;
  meeting_time: string;
  location: string;
  approval_status: string;
  student_first_name: string;
  student_last_name: string;
  supervisor_first_name: string;
  supervisor_last_name: string;
}

export default function MobileAdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Debounced search
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // State for data
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([]);
  const [recentMeetings, setRecentMeetings] = useState<Meeting[]>([]);
  const [systemHealth, setSystemHealth] = useState({
    database: 'healthy',
    server: 'healthy',
    storage: 'healthy'
  });

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user info
        const authResponse = await fetch('/api/auth/me');
        if (authResponse.ok) {
          const userData = await authResponse.json();
          setUser(userData.user);
          
          if (!['admin', 'super_admin'].includes(userData.user.role_name)) {
            router.push('/dashboard');
            return;
          }

          // Fetch admin data
          const [statsData, usersData, submissionsData, meetingsData] = await Promise.all([
            fetch('/api/admin/stats'),
            fetch('/api/admin/users?limit=5'),
            fetch('/api/admin/submissions?limit=5'),
            fetch('/api/admin/meetings?limit=5')
          ]);

          if (statsData.ok) {
            setStats(await statsData.json());
          }
          if (usersData.ok) {
            const usersResult = await usersData.json();
            setRecentUsers(usersResult.users || []);
          }
          if (submissionsData.ok) {
            const subResult = await submissionsData.json();
            setRecentSubmissions(subResult.submissions || []);
          }
          if (meetingsData.ok) {
            const meetResult = await meetingsData.json();
            setRecentMeetings(meetResult.meetings || []);
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

  // Filter users based on search
  const filteredUsers = recentUsers.filter(user =>
    user.first_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    user.last_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    user.role_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600';
      case 'pending': case 'submitted': return 'text-orange-600';
      case 'needs_revision': case 'reviewed': return 'text-red-600';
      case 'completed': return 'text-green-600';
      case 'scheduled': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return '✅';
      case 'pending': case 'submitted': return '⏳';
      case 'needs_revision': case 'reviewed': return '🔄';
      case 'completed': return '✅';
      case 'scheduled': return '📅';
      default: return '📄';
    }
  };

  // Get role icon
  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case 'admin': return '👑';
      case 'super_admin': return '👑';
      case 'supervisor': return '👨‍🏫';
      case 'student': return '👨‍🎓';
      default: return '👤';
    }
  };

  if (loading) {
    return (
      <MobileLayout user={{ name: 'Loading...', email: '', role: 'admin' }}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
        </div>
      </MobileLayout>
    );
  }

  if (!user || !stats) {
    return null;
  }

  return (
    <MobileLayout 
      user={user} 
      title="Admin Dashboard"
      showSearch={true}
    >
      <div className="p-4 space-y-4">
        {/* System Health */}
        <MobileCard title="System Health">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database</span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-sm text-green-600">Healthy</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Server</span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-sm text-green-600">Healthy</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Storage</span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-sm text-green-600">Healthy</span>
              </span>
            </div>
          </div>
        </MobileCard>

        {/* Stats Grid */}
        <MobileStatsGrid>
          <MobileStatCard
            title="Users"
            value={stats.totalUsers}
            change={12}
            changeType="increase"
            icon="👥"
          />
          <MobileStatCard
            title="Students"
            value={stats.totalStudents}
            change={8}
            changeType="increase"
            icon="👨‍🎓"
          />
          <MobileStatCard
            title="Supervisors"
            value={stats.totalSupervisors}
            change={3}
            changeType="increase"
            icon="👨‍🏫"
          />
          <MobileStatCard
            title="Submissions"
            value={stats.totalSubmissions}
            change={15}
            changeType="increase"
            icon="📄"
          />
        </MobileStatsGrid>

        {/* Activity Stats */}
        <MobileStatsGrid>
          <MobileStatCard
            title="Pending"
            value={stats.pendingSubmissions}
            change={stats.pendingSubmissions > 0 ? 5 : 0}
            changeType={stats.pendingSubmissions > 0 ? "increase" : "neutral"}
            icon="⏳"
          />
          <MobileStatCard
            title="Messages"
            value={stats.totalMessages}
            change={8}
            changeType="increase"
            icon="💬"
          />
          <MobileStatCard
            title="Meetings"
            value={stats.totalMeetings}
            change={3}
            changeType="increase"
            icon="📅"
          />
          <MobileStatCard
            title="Completed"
            value={stats.completedMeetings}
            change={10}
            changeType="increase"
            icon="✅"
          />
        </MobileStatsGrid>

        {/* Quick Actions */}
        <MobileCard title="Quick Actions">
          <div className="grid grid-cols-2 gap-3">
            <MobileButton
              variant="primary"
              onClick={() => router.push('/dashboard/create-user')}
              icon="👤"
            >
              Add User
            </MobileButton>
            <MobileButton
              variant="secondary"
              onClick={() => router.push('/dashboard/users')}
              icon="👥"
            >
              Users
            </MobileButton>
            <MobileButton
              variant="outline"
              onClick={() => router.push('/dashboard/submissions')}
              icon="📄"
            >
              Submissions
            </MobileButton>
            <MobileButton
              variant="outline"
              onClick={() => router.push('/dashboard/meetings')}
              icon="📅"
            >
              Meetings
            </MobileButton>
          </div>
        </MobileCard>

        {/* Recent Users */}
        <MobileCard 
          title="Recent Users"
          subtitle={`${filteredUsers.length} recent users`}
          action={
            <MobileButton
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard/users')}
            >
              View All
            </MobileButton>
          }
        >
          <div className="space-y-3">
            {filteredUsers.map((userItem) => (
              <MobileListItem
                key={userItem.id}
                title={`${userItem.first_name} ${userItem.last_name}`}
                subtitle={userItem.email}
                badge={`${userItem.role_name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} ${userItem.is_active ? '✅' : '❌'}`}
                icon="👤"
                onClick={() => router.push(`/dashboard/users/${userItem.id}`)}
              />
            ))}
          </div>
        </MobileCard>

        {/* Recent Submissions */}
        {recentSubmissions.length > 0 && (
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
              {recentSubmissions.map((submission) => (
                <MobileListItem
                  key={submission.id}
                  title={submission.title}
                  subtitle={`${submission.student_first_name} ${submission.student_last_name}`}
                  badge={submission.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  icon="📄"
                  onClick={() => router.push(`/dashboard/submissions/${submission.id}`)}
                />
              ))}
            </div>
          </MobileCard>
        )}

        {/* Recent Meetings */}
        {recentMeetings.length > 0 && (
          <MobileCard 
            title="Recent Meetings"
            subtitle={`${stats.pendingMeetings} pending approval`}
            action={
              <MobileButton
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard/meetings')}
              >
                View All
              </MobileButton>
            }
          >
            <div className="space-y-3">
              {recentMeetings.map((meeting) => (
                <MobileListItem
                  key={meeting.id}
                  title={meeting.title}
                  subtitle={`${meeting.student_first_name} ${meeting.student_last_name} with ${meeting.supervisor_first_name} ${meeting.supervisor_last_name}`}
                  badge={meeting.approval_status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  icon="📅"
                  onClick={() => router.push(`/dashboard/meetings/${meeting.id}`)}
                />
              ))}
            </div>
          </MobileCard>
        )}

        {/* Analytics Overview */}
        <MobileCard title="Analytics Overview">
          <div className="space-y-3">
            <MobileListItem
              title="User Growth"
              subtitle="+12% this month"
              icon="📈"
              onClick={() => router.push('/dashboard/analytics')}
            />
            <MobileListItem
              title="Submission Trends"
              subtitle="15% increase in submissions"
              icon="📊"
              onClick={() => router.push('/dashboard/analytics')}
            />
            <MobileListItem
              title="Meeting Activity"
              subtitle="8 meetings scheduled this week"
              icon="📅"
              onClick={() => router.push('/dashboard/analytics')}
            />
          </div>
        </MobileCard>

        {/* System Settings */}
        <MobileCard title="System Settings">
          <div className="space-y-3">
            <MobileListItem
              title="User Management"
              subtitle="Manage user accounts and permissions"
              icon="⚙️"
              onClick={() => router.push('/dashboard/settings')}
            />
            <MobileListItem
              title="System Configuration"
              subtitle="Configure system settings"
              icon="🔧"
              onClick={() => router.push('/dashboard/settings')}
            />
            <MobileListItem
              title="Database Backup"
              subtitle="Last backup: 2 hours ago"
              icon="💾"
              onClick={() => router.push('/dashboard/settings')}
            />
          </div>
        </MobileCard>

        {/* Quick Links */}
        <MobileCard title="Quick Links">
          <div className="space-y-3">
            <MobileListItem
              title="Reports"
              subtitle="Generate system reports"
              icon="📊"
              onClick={() => router.push('/dashboard/reports')}
            />
            <MobileListItem
              title="Logs"
              subtitle="View system logs"
              icon="📋"
              onClick={() => router.push('/dashboard/logs')}
            />
            <MobileListItem
              title="Integrity Check"
              subtitle="Run data integrity checks"
              icon="🔍"
              onClick={() => router.push('/dashboard/integrity-check')}
            />
          </div>
        </MobileCard>

        {/* Contact Support */}
        <MobileCard title="Need Help?">
          <div className="space-y-3">
            <MobileListItem
              title="Documentation"
              subtitle="View system documentation"
              icon="📚"
              onClick={() => window.open('/docs', '_blank')}
            />
            <MobileListItem
              title="Support Team"
              subtitle="Contact technical support"
              icon="🆘"
              onClick={() => window.open('mailto:support@researchconsultant.com')}
            />
          </div>
        </MobileCard>
      </div>
    </MobileLayout>
  );
}
