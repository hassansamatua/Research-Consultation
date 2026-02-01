'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Log the 404 error for debugging
    console.log('404 - Page not found:', window.location.pathname);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          {/* 404 Icon */}
          <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900 mb-8">
            <span className="text-4xl font-bold text-green-600 dark:text-green-400">404</span>
          </div>
          
          {/* Error Message */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Page Not Found
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Sorry, we couldn't find the page you're looking for.
          </p>

          {/* Possible Reasons */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 text-left">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Possible reasons:
            </h2>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                The page doesn't exist or has been moved
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                You don't have permission to access this page
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                The URL might be mistyped
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                The page is still under development
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Go Back
              </button>
              <Link
                href="/dashboard"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Dashboard
              </Link>
            </div>
            
            <div className="text-center">
              <Link
                href="/"
                className="text-sm text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300"
              >
                Return to Home
              </Link>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Need Help?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Students</h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li><Link href="/dashboard" className="text-green-600 dark:text-green-400 hover:underline">Dashboard</Link></li>
                  <li><Link href="/dashboard/submissions" className="text-green-600 dark:text-green-400 hover:underline">My Submissions</Link></li>
                  <li><Link href="/dashboard/profile" className="text-green-600 dark:text-green-400 hover:underline">Profile</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Supervisors</h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li><Link href="/dashboard" className="text-green-600 dark:text-green-400 hover:underline">Dashboard</Link></li>
                  <li><Link href="/dashboard/students" className="text-green-600 dark:text-green-400 hover:underline">Students</Link></li>
                  <li><Link href="/dashboard/review" className="text-green-600 dark:text-green-400 hover:underline">Review</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Admins</h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li><Link href="/dashboard" className="text-green-600 dark:text-green-400 hover:underline">Dashboard</Link></li>
                  <li><Link href="/dashboard/allocations" className="text-green-600 dark:text-green-400 hover:underline">Allocations</Link></li>
                  <li><Link href="/dashboard/reports" className="text-green-600 dark:text-green-400 hover:underline">Reports</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
