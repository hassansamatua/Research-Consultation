import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import {
  BookOpen,
  Calendar,
  Phone,
  Info,
  User,
  Shield,
  Settings,
  BarChart3
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Theme Toggle in Header */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-4xl mx-auto">
          {/* University Logo/Branding */}
          <div className="mb-8">
            <img
              src="/logo.png"
              alt="Zanzibar University Logo"
              className="h-24 w-24 object-contain mx-auto mb-4"
            />
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Zanzibar University
            </h1>
            <h2 className="text-2xl font-semibold text-green-700 mb-4">
              Postgraduate Research Consultation System
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A comprehensive platform for managing postgraduate research supervision, 
              submissions, and academic progress tracking.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Student Portal</h3>
              <p className="text-gray-600 text-sm">
                Submit research documents and track progress
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Supervisor Dashboard</h3>
              <p className="text-gray-600 text-sm">
                Review submissions and provide feedback
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Settings className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Admin Control</h3>
              <p className="text-gray-600 text-sm">
                Manage allocations and monitor progress
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Real-time Tracking</h3>
              <p className="text-gray-600 text-sm">
                Monitor research progress and deadlines
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to the Research Portal
            </h3>
            <p className="text-gray-600 mb-6">
              Access your personalized dashboard to manage your research journey, 
              connect with supervisors, and track your academic progress.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
              >
                Sign In to Your Account
              </Link>
              
              <Link
                href="/help"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-12 text-center">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h4>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link href="/guidelines" className="flex items-center text-green-600 hover:text-green-700">
                <BookOpen className="h-5 w-5 mr-2" />
                Research Guidelines
              </Link>
              <Link href="/deadlines" className="flex items-center text-green-600 hover:text-green-700">
                <Calendar className="h-5 w-5 mr-2" />
                Academic Deadlines
              </Link>
              <Link href="/contact" className="flex items-center text-green-600 hover:text-green-700">
                <Phone className="h-5 w-5 mr-2" />
                Contact Support
              </Link>
              <Link href="/about" className="flex items-center text-green-600 hover:text-green-700">
                <Info className="h-5 w-5 mr-2" />
                About System
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
