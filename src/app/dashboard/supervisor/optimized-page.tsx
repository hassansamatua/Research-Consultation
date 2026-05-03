'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getDashboardDataOptimized, 
  clearCache 
} from '@/lib/optimizedQueries';
import { 
  useDebounce, 
  usePagination, 
  usePerformanceMonitor,
  useThrottle
} from '@/hooks/usePerformanceOptimizations';
import { EnhancedCard, StatsCard } from '@/components/ui/EnhancedCard';
import { EnhancedButton } from '@/components/ui/EnhancedButton';
import { Users, MessageSquare, Calendar, TrendingUp, Search, RefreshCw } from 'lucide-react';

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

export default function OptimizedSupervisorPage() {
  const router = useRouter();
  const { getStats } = usePerformanceMonitor('OptimizedSupervisorPage');
  
  // State management
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // Optimized data fetching with pagination
  const {
    data: allocations,
    loading: allocationsLoading,
    loadMore: loadMoreAllocations,
    hasMore: hasMoreAllocations,
    refresh: refreshAllocations
  } = usePagination<Allocation>(
    useCallback(async (page: number, limit: number) => {
      const data = await getDashboardDataOptimized(user.id, 'supervisor');
      const start = (page - 1) * limit;
      const end = start + limit;
      return {
        data: data.allocations.slice(start, end),
        total: data.allocations.length
      };
    }, [user.id]),
    10
  );
  
  // Memoized dashboard data
  const [dashboardData, setDashboardData] = useState<any>(null);
  
  // Load dashboard data
  useEffect(() => {
    if (!user) return;
    
    const loadData = async () => {
      try {
        const data = await getDashboardDataOptimized(user.id, 'supervisor');
        setDashboardData(data);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        setError('Failed to load dashboard data');
      }
    };
    
    loadData();
  }, [user.id]);

  // Throttled refresh function
  const throttledRefresh = useThrottle(async () => {
    setLoading(true);
    clearCache(); // Clear all cache
    await refreshAllocations();
    setLoading(false);
  }, 2000);

  // Memoized calculations
  const stats = useMemo(() => {
    if (!dashboardData) return null;
    
    return {
      totalStudents: dashboardData.allocations.length,
      unreadMessages: dashboardData.unreadCount,
      upcomingMeetings: dashboardData.meetings.filter(m => 
        m.approval_status === 'approved' && 
        new Date(`${m.meeting_date}T${m.meeting_time}`) > new Date()
      ).length,
      pendingRequests: dashboardData.meetings.filter(m => 
        m.approval_status === 'pending' && m.requested_by === 'student'
      ).length,
      department: dashboardData.supervisor?.department || 'N/A',
      capacity: {
        current: dashboardData.allocations.length,
        max: dashboardData.supervisor?.max_students || 0
      }
    };
  }, [dashboardData]);

  // Filtered allocations based on search
  const filteredAllocations = useMemo(() => {
    if (!debouncedSearchTerm) return allocations;
    
    return allocations.filter(allocation =>
      allocation.student_first_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      allocation.student_last_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      allocation.registration_number.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      allocation.program.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [allocations, debouncedSearchTerm]);

  // Authentication check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          
          // Redirect non-supervisors
          if (data.user.role_name !== 'supervisor') {
            router.push('/dashboard');
            return;
          }
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth error:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Performance logging
  useEffect(() => {
    const stats = getStats();
    if (stats.renders % 10 === 0 && stats.renders > 0) {
      console.log(`📊 SupervisorPage Performance:`, stats);
    }
  }, [getStats]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !stats) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Supervisor Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Manage your students, messages, and meetings</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              
              {/* Refresh Button */}
              <EnhancedButton
                variant="outline"
                size="sm"
                onClick={throttledRefresh}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </EnhancedButton>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Students"
            value={stats.totalStudents}
            change={12}
            changeType="increase"
            icon={Users}
            iconColor="text-blue-600"
          />
          
          <StatsCard
            title="Unread Messages"
            value={stats.unreadMessages}
            change={stats.unreadMessages > 0 ? 8 : 0}
            changeType={stats.unreadMessages > 0 ? "increase" : "decrease"}
            icon={MessageSquare}
            iconColor="text-green-600"
          />
          
          <StatsCard
            title="Upcoming Meetings"
            value={stats.upcomingMeetings}
            change={3}
            changeType="increase"
            icon={Calendar}
            iconColor="text-purple-600"
          />
          
          <StatsCard
            title="Pending Requests"
            value={stats.pendingRequests}
            change={stats.pendingRequests > 0 ? 5 : 0}
            changeType={stats.pendingRequests > 0 ? "increase" : "decrease"}
            icon={TrendingUp}
            iconColor="text-orange-600"
          />
        </div>

        {/* Department Info */}
        <EnhancedCard
          title="Department Information"
          subtitle={`${stats.capacity.current}/${stats.capacity.max} students assigned`}
          bgColor="bg-gradient-to-br from-blue-50 to-indigo-50"
          borderColor="border-blue-200"
          className="mb-8"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Department</p>
                <p className="text-lg font-semibold text-gray-900">{stats.department}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Specialization</p>
                <p className="text-lg font-semibold text-gray-900">{dashboardData?.supervisor?.specialization || 'N/A'}</p>
              </div>
            </div>
            
            {/* Capacity Progress Bar */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Capacity</span>
                <span className="font-medium">{stats.capacity.current}/{stats.capacity.max}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-400 to-indigo-400 h-3 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min((stats.capacity.current / stats.capacity.max) * 100, 100)}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </EnhancedCard>

        {/* Students List */}
        <EnhancedCard
          title="Assigned Students"
          subtitle={`${filteredAllocations.length} students found`}
          className="mb-8"
        >
          <div className="space-y-4">
            {filteredAllocations.map((allocation) => (
              <div
                key={allocation.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {allocation.student_first_name[0]}{allocation.student_last_name[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {allocation.student_first_name} {allocation.student_last_name}
                    </p>
                    <p className="text-sm text-gray-600">{allocation.registration_number}</p>
                    <p className="text-sm text-gray-500">{allocation.program}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    Assigned {new Date(allocation.allocated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Load More Button */}
            {hasMoreAllocations && (
              <div className="text-center pt-4">
                <EnhancedButton
                  variant="outline"
                  onClick={loadMoreAllocations}
                  disabled={allocationsLoading}
                  className="w-full"
                >
                  {allocationsLoading ? 'Loading...' : 'Load More Students'}
                </EnhancedButton>
              </div>
            )}
            
            {filteredAllocations.length === 0 && !allocationsLoading && (
              <div className="text-center py-8 text-gray-500">
                <p>No students found matching your search.</p>
              </div>
            )}
          </div>
        </EnhancedCard>
      </div>
    </div>
  );
}
