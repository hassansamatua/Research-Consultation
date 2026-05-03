'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ResponsiveDashboardWithNotifications,
  ResponsiveContainer,
  ResponsiveCard,
  ResponsiveButton
} from '@/components/ui/ResponsiveDashboardWithNotifications';
import { 
  Users, 
  LayoutList,
  Grid3X3,
  Table,
  FileSpreadsheet,
  Eye,
  ArrowRight
} from 'lucide-react';

export default function StudentsNavigationPage() {
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

  const studentListPages = [
    {
      title: 'Original Student List',
      description: 'The original student list with all features and functionality',
      path: '/dashboard/students',
      icon: Users,
      color: 'blue',
      features: ['Full functionality', 'All features', 'Original design']
    },
    {
      title: 'Simple List',
      description: 'Clean, simple list format with basic student information',
      path: '/dashboard/students/simple-page',
      icon: LayoutList,
      color: 'green',
      features: ['Clean design', 'Basic info', 'Easy to read']
    },
    {
      title: 'Compact List',
      description: 'Ultra-compact list with maximum information density',
      path: '/dashboard/students/simple-list-page',
      icon: Grid3X3,
      color: 'purple',
      features: ['Compact design', 'Maximum density', 'Quick scan']
    },
    {
      title: 'Excel Style',
      description: 'Excel-like spreadsheet format with rows and columns',
      path: '/dashboard/students/excel-page',
      icon: FileSpreadsheet,
      color: 'orange',
      features: ['Spreadsheet view', 'Grid layout', 'Export ready']
    },
    {
      title: 'Image Style',
      description: 'Clean format matching your image reference',
      path: '/dashboard/students/image-style-page',
      icon: Table,
      color: 'red',
      features: ['Image reference', 'Clean rows', 'Professional']
    },
    {
      title: 'Responsive Dashboard',
      description: 'Fully responsive dashboard with mobile optimization',
      path: '/dashboard/supervisor/responsive-page',
      icon: Users,
      color: 'indigo',
      features: ['Mobile optimized', 'Responsive', 'Modern design']
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string; icon: string }> = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-600', icon: 'text-blue-600' },
      green: { bg: 'bg-green-100', text: 'text-green-600', icon: 'text-green-600' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600', icon: 'text-purple-600' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-600', icon: 'text-orange-600' },
      red: { bg: 'bg-red-100', text: 'text-red-600', icon: 'text-red-600' },
      indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', icon: 'text-indigo-600' }
    };
    return colorMap[color] || colorMap.blue;
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
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Student List Navigation
            </h1>
            <p className="text-gray-600">
              Choose from different student list styles and formats
            </p>
          </div>

          {/* Student List Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studentListPages.map((page, index) => {
              const colors = getColorClasses(page.color);
              const IconComponent = page.icon;
              
              return (
                <div 
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  onClick={() => router.push(page.path)}
                >
                  <div className="p-6">
                    {/* Icon and Title */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-16 h-16 ${colors.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <IconComponent className={`h-8 w-8 ${colors.icon}`} />
                      </div>
                      <ArrowRight className={`h-5 w-5 ${colors.text} opacity-0 group-hover:opacity-100 transition-opacity`} />
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {page.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4">
                      {page.description}
                    </p>
                    
                    {/* Features */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {page.features.map((feature, featureIndex) => (
                        <span 
                          key={featureIndex}
                          className={`px-2 py-1 text-xs font-medium ${colors.bg} ${colors.text} rounded-full`}
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                    
                    {/* Button */}
                    <ResponsiveButton
                      variant="outline"
                      fullWidth
                      className="group-hover:bg-blue-50 group-hover:border-blue-300 group-hover:text-blue-700 transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View List
                    </ResponsiveButton>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Access */}
          <ResponsiveCard>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {studentListPages.map((page, index) => {
                  const colors = getColorClasses(page.color);
                  
                  return (
                    <button
                      key={index}
                      onClick={() => router.push(page.path)}
                      className={`p-4 ${colors.bg} rounded-lg hover:shadow-md transition-all duration-300 group`}
                    >
                      <div className={`w-8 h-8 ${colors.bg} rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
                        <page.icon className={`h-4 w-4 ${colors.icon}`} />
                      </div>
                      <div className={`text-xs font-medium ${colors.text}`}>
                        {page.title.split(' ')[0]}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </ResponsiveCard>

          {/* Help Text */}
          <ResponsiveCard>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About These Lists</h3>
              <div className="space-y-4 text-sm text-gray-600">
                <p>
                  Each student list style offers a different way to view and interact with student data. 
                  Choose the one that best fits your needs and preferences.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Recommended for:</h4>
                    <ul className="space-y-1">
                      <li>• <strong>Image Style:</strong> Most like your reference image</li>
                      <li>• <strong>Excel Style:</strong> Spreadsheet-like viewing</li>
                      <li>• <strong>Compact List:</strong> Maximum information density</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Features:</h4>
                    <ul className="space-y-1">
                      <li>• All lists include search functionality</li>
                      <li>• Export to CSV available</li>
                      <li>• Message and meeting scheduling</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </ResponsiveCard>
        </div>
      </ResponsiveContainer>
    </ResponsiveDashboardWithNotifications>
  );
}
