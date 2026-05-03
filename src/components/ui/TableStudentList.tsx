'use client';

import { Student } from './CompleteStudentBot';

interface TableStudentListProps {
  students: Student[];
  onMessageClick?: (studentId: number) => void;
  onScheduleMeeting?: (studentId: number) => void;
}

export function TableStudentList({ students, onMessageClick, onScheduleMeeting }: TableStudentListProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
              Registration
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
              Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
              Email
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
              Phone
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
              Program
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
              Degree Level
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
              Created
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {students.map((student) => (
            <tr key={student.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {student.first_name[0]}{student.last_name[0]}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {student.first_name} {student.middle_name ? student.middle_name + ' ' : ''}{student.last_name}
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {student.id}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {student.registration_number}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {student.email}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {student.phone || 'N/A'}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {student.program}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {student.degree_level}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <span className="px-2 py-1 text-xs font-medium rounded-full">
                  {student.status === 'active' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                  }
                >
                  {student.status}
                </span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                {student.created_at 
                  ? new Date(student.created_at).toLocaleDateString()
                  : 'N/A'
                }
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onMessageClick && onMessageClick(student.id)}
                    className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                    title="Send message"
                  >
                    <Mail className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onScheduleMeeting && onScheduleMeeting(student.id)}
                    className="p-1 text-green-600 hover:text-green-800 transition-colors"
                    title="Schedule meeting"
                  >
                    <Calendar className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
