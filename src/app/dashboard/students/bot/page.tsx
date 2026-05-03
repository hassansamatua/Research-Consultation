'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StudentBot } from '@/components/ui/StudentBot';
import { ResponsiveDashboardWithNotifications } from '@/components/ui/ResponsiveDashboardWithNotifications';

export default function StudentBotPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current user
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleStudentCreated = (student: any) => {
    console.log('New student created:', student);
    // The StudentBot component already updates the list
    // This callback is just for additional actions if needed
  };

  if (loading) {
    return (
      <ResponsiveDashboardWithNotifications user={user || { name: 'Loading...', email: '', role: 'admin' }}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading Student Bot...</span>
        </div>
      </ResponsiveDashboardWithNotifications>
    );
  }

  return (
    <ResponsiveDashboardWithNotifications user={user || { name: 'Admin', email: 'admin@zumis.ac.tz', role: 'admin' }}>
      <div className="p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <StudentBot 
            currentUser={user} 
            onStudentCreated={handleStudentCreated}
          />
        </div>
      </div>
    </ResponsiveDashboardWithNotifications>
  );
}
