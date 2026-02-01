'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AllocationsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the supervisor allocation page
    router.replace('/dashboard/supervisor-allocation');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
    </div>
  );
}
