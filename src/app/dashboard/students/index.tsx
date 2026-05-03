'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ResponsiveDashboardWithNotifications,
  ResponsiveContainer,
  ResponsiveCard,
  ResponsiveButton,
  ResponsiveGrid
} from '@/components/ui/ResponsiveDashboardWithNotifications';
import { 
  Users, 
  Plus, 
  LayoutList,
  Grid3X3,
  Table,
  FileSpreadsheet,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StudentsIndexPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authResponse = await fetch('/api/auth/me');
        if (authResponse.ok) {
          const userData = await authResponse.json();
          setUser(userData.user);
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

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  if (loading) {
    return (
      <ResponsiveDashboardWithNotifications 
        user={{ name: 'Loading...', email: '', role: 'supervisor' }}
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
        </div>
      </ResponsiveDashboardWithNotifications>
    );
  }

  return (
    <ResponsiveDashboardWithNotifications 
      user={user || { name: 'Supervisor', email: 'supervisor@zumis.ac.tz', role: 'supervisor' }}
    >
      <ResponsiveContainer>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Lists</h1>
              <p className="text-gray-600">
                Choose from different student list styles and formats
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <ResponsiveButton
                variant="primary"
                onClick={() => handleNavigate('/dashboard/students/new')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </ResponsiveButton>
            </div>
          </div>

          {/* Student List Options */}
          <ResponsiveGrid cols={{ xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 3 }}>
            {/* Original Student List */}
            <ResponsiveCard className="hover:shadow-md transition-shadow cursor-pointer">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-500">Original</span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Original Student List
                </h3>
                
                <p className="text-sm text-gray-600 mb-4">
                  The original student list with all features and functionality
                </p>
                
                <ResponsiveButton
                  variant="primary"
                  fullWidth
                  onClick={() => handleNavigate('/dashboard/students')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Original
                </ResponsiveButton>
              </div>
            </ResponsiveCard>

            {/* Simple Student List */}
            <ResponsiveCard className="hover:shadow-md transition-shadow cursor-pointer">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <LayoutList className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-500">Simple</span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Simple List
                </h3>
                
                <p className="text-sm text-gray-600 mb-4">
                  Clean, simple list format with basic student information
                </p>
                
                <ResponsiveButton
                  variant="outline"
                  fullWidth
                  onClick={() => handleNavigate('/dashboard/students/simple-page')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Simple
                </ResponsiveButton>
              </div>
            </ResponsiveCard>

            {/* Simple List Page */}
            <ResponsiveCard className="hover:shadow-md transition-shadow cursor-pointer">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Grid3X3 className="h-6 w-6 text-purple-600" />
                  </div>
                  <span className="text-sm text-gray-500">Compact</span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Compact List
                </h3>
                
                <p className="text-sm text-gray-600 mb-4">
                  Ultra-compact list with maximum information density
                </p>
                
                <ResponsiveButton
                  variant="outline"
                  fullWidth
                  onClick={() => handleNavigate('/dashboard/students/simple-list-page')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Compact
                </ResponsiveButton>
              </div>
            </ResponsiveCard>

            {/* Excel Style */}
            <ResponsiveCard className="hover:shadow-md transition-shadow cursor-pointer">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <FileSpreadsheet className="h-6 w-6 text-orange-600" />
                  </div>
                  <span className="text-sm text-gray-500">Excel</span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Excel Style
                </h3>
                
                <p className="text-sm text-gray-600 mb-4">
                  Excel-like spreadsheet format with rows and columns
                </p>
                
                <ResponsiveButton
                  variant="outline"
                  fullWidth
                  onClick={() => handleNavigate('/dashboard/students/excel-page')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Excel
                </ResponsiveButton>
              </div>
            </ResponsiveCard>

            {/* Image Style */}
            <ResponsiveCard className="hover:shadow-md transition-shadow cursor-pointer">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Table className="h-6 w-6 text-red-600" />
                  </div>
                  <span className="text-sm text-gray-500">Image Style</span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Image Style
                </h3>
                
                <p className="text-sm text-gray-600 mb-4">
                  Clean format matching your image reference
                </p>
                
                <ResponsiveButton
                  variant="outline"
                  fullWidth
                  onClick={() => handleNavigate('/dashboard/students/image-style-page')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Image Style
                </ResponsiveButton>
              </div>
            </ResponsiveCard>

            {/* Responsive Dashboard */}
            <ResponsiveCard className="hover:shadow-md transition-shadow cursor-pointer">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Grid3X3 className="h-6 w-6 text-indigo-600" />
                  </div>
                  <span className="text-sm text-gray-500">Responsive</span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Responsive Dashboard
                </h3>
                
                <p className="text-sm text-gray-600 mb-4">
                  Fully responsive dashboard with mobile optimization
                </p>
                
                <ResponsiveButton
                  variant="outline"
                  fullWidth
                  onClick={() => handleNavigate('/dashboard/supervisor/responsive-page')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Responsive
                </ResponsiveButton>
              </div>
            </ResponsiveCard>
          </ResponsiveGrid>

          {/* Quick Stats */}
          <ResponsiveCard>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">6</div>
                  <div className="text-sm text-gray-600">List Styles</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">5</div>
                  <div className="text-sm text-gray-600">Mock Students</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">3</div>
                  <div className="text-sm text-gray-600">View Modes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">100%</div>
                  <div className="text-sm text-gray-600">Responsive</div>
                </div>
              </div>
            </div>
          </ResponsiveCard>

          {/* Help Section */}
          <ResponsiveCard>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Help & Navigation</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  <strong>Original List:</strong> The default student list with all features
                </p>
                <p>
                  <strong>Simple List:</strong> Clean, basic format for quick viewing
                </p>
                <p>
                  <strong>Compact List:</strong> Maximum information density
                </p>
                <p>
                  <strong>Excel Style:</strong> Spreadsheet-like rows and columns
                </p>
                <p>
                  <strong>Image Style:</strong> Format matching your reference image
                </p>
                <p>
                  <strong>Responsive:</strong> Mobile-optimized dashboard view
                </p>
              </div>
            </div>
          </ResponsiveCard>
        </div>
      </ResponsiveContainer>
    </ResponsiveDashboardWithNotifications>
  );
}
