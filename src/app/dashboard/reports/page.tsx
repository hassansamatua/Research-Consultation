'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Report {
  id: number;
  report_type: string;
  title: string;
  generated_at: string;
  generated_by: string;
  file_path?: string;
}

export default function ReportsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [generating, setGenerating] = useState(false);
  const [reportType, setReportType] = useState('');
  const [parameters, setParameters] = useState({
    start_date: '',
    end_date: '',
    department: '',
    degree_level: ''
  });
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchReports();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        
        // Check if user has admin privileges
        if (data.user.role_name !== 'admin' && data.user.role_name !== 'super_admin') {
          router.push('/dashboard');
        }
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    // Mock reports data
    const mockReports: Report[] = [
      {
        id: 1,
        report_type: 'student_progress',
        title: 'Student Progress Report - Q4 2023',
        generated_at: '2024-01-10T10:30:00Z',
        generated_by: 'Admin User',
        file_path: '/reports/student_progress_q4_2023.pdf'
      },
      {
        id: 2,
        report_type: 'supervisor_workload',
        title: 'Supervisor Workload Analysis - December 2023',
        generated_at: '2024-01-05T14:20:00Z',
        generated_by: 'Admin User',
        file_path: '/reports/supervisor_workload_dec_2023.pdf'
      },
      {
        id: 3,
        report_type: 'submission_summary',
        title: 'Monthly Submission Summary - December 2023',
        generated_at: '2024-01-02T09:15:00Z',
        generated_by: 'Super Admin',
        file_path: '/reports/submission_summary_dec_2023.pdf'
      },
      {
        id: 4,
        report_type: 'completion_rates',
        title: 'Program Completion Rates - Academic Year 2023',
        generated_at: '2023-12-28T16:45:00Z',
        generated_by: 'Admin User',
        file_path: '/reports/completion_rates_2023.pdf'
      }
    ];
    setReports(mockReports);
  };

  const handleGenerateReport = async () => {
    if (!reportType) return;
    
    setGenerating(true);
    // TODO: Implement report generation API
    console.log('Generating report:', { type: reportType, parameters });
    
    // Simulate report generation
    setTimeout(() => {
      const newReport: Report = {
        id: reports.length + 1,
        report_type: reportType,
        title: `${getReportTitle(reportType)} - ${new Date().toLocaleDateString()}`,
        generated_at: new Date().toISOString(),
        generated_by: user.first_name + ' ' + user.last_name
      };
      setReports([newReport, ...reports]);
      setGenerating(false);
      setReportType('');
      setParameters({ start_date: '', end_date: '', department: '', degree_level: '' });
    }, 2000);
  };

  const getReportTitle = (type: string) => {
    switch (type) {
      case 'student_progress': return 'Student Progress Report';
      case 'supervisor_workload': return 'Supervisor Workload Analysis';
      case 'submission_summary': return 'Submission Summary';
      case 'completion_rates': return 'Completion Rates Analysis';
      case 'department_stats': return 'Department Statistics';
      case 'system_usage': return 'System Usage Report';
      default: return 'Custom Report';
    }
  };

  const handleDownload = (report: Report) => {
    // TODO: Implement file download
    console.log('Downloading report:', report);
  };

  const handleDelete = (reportId: number) => {
    // TODO: Implement delete API
    setReports(reports.filter(r => r.id !== reportId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="mt-2 text-gray-600">Generate and manage administrative reports</p>
      </div>

      {/* Report Generation */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Generate New Report
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="report_type" className="block text-sm font-medium text-gray-700">
                  Report Type
                </label>
                <select
                  name="report_type"
                  id="report_type"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  required
                >
                  <option value="">Select report type</option>
                  <option value="student_progress">Student Progress Report</option>
                  <option value="supervisor_workload">Supervisor Workload Analysis</option>
                  <option value="submission_summary">Submission Summary</option>
                  <option value="completion_rates">Completion Rates Analysis</option>
                  <option value="department_stats">Department Statistics</option>
                  <option value="system_usage">System Usage Report</option>
                </select>
              </div>

              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                  Department (Optional)
                </label>
                <select
                  name="department"
                  id="department"
                  value={parameters.department}
                  onChange={(e) => setParameters({...parameters, department: e.target.value})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                >
                  <option value="">All Departments</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Business Administration">Business Administration</option>
                  <option value="Education">Education</option>
                </select>
              </div>

              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  name="start_date"
                  id="start_date"
                  value={parameters.start_date}
                  onChange={(e) => setParameters({...parameters, start_date: e.target.value})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  name="end_date"
                  id="end_date"
                  value={parameters.end_date}
                  onChange={(e) => setParameters({...parameters, end_date: e.target.value})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleGenerateReport}
                disabled={!reportType || generating}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Reports</h3>
          <div className="text-3xl font-bold text-blue-600 mb-2">{reports.length}</div>
          <p className="text-sm text-gray-600">Generated reports</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">This Month</h3>
          <div className="text-3xl font-bold text-green-600 mb-2">
            {reports.filter(r => {
              const reportDate = new Date(r.generated_at);
              const now = new Date();
              return reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear();
            }).length}
          </div>
          <p className="text-sm text-gray-600">Reports this month</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Progress Reports</h3>
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {reports.filter(r => r.report_type === 'student_progress').length}
          </div>
          <p className="text-sm text-gray-600">Student progress</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {reports.filter(r => r.report_type === 'completion_rates' || r.report_type === 'supervisor_workload').length}
          </div>
          <p className="text-sm text-gray-600">Analysis reports</p>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Generated Reports
            </h3>
            <div className="flex space-x-2">
              <button className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                Export All
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Report Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Generated By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Generated At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {report.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {getReportTitle(report.report_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.generated_by}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(report.generated_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(report.generated_at).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {report.file_path ? (
                        <span className="text-sm text-green-600">Available</span>
                      ) : (
                        <span className="text-sm text-gray-400">Processing</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDownload(report)}
                        disabled={!report.file_path}
                        className="text-green-600 hover:text-green-900 mr-3 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => handleDelete(report.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
