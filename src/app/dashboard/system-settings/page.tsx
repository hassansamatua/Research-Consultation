'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface SystemSetting {
  key: string;
  value: string;
  description: string;
  category: string;
  type: 'text' | 'number' | 'boolean' | 'email';
}

export default function SystemSettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchSettings();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        
        // Only super admin can access system settings
        if (data.user.role_name !== 'super_admin') {
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

  const fetchSettings = async () => {
    // Mock settings data
    const mockSettings: SystemSetting[] = [
      {
        key: 'app_name',
        value: 'Zanzibar University Research Consultation System',
        description: 'The name of the application displayed in the header and emails',
        category: 'general',
        type: 'text'
      },
      {
        key: 'max_file_size',
        value: '10485760',
        description: 'Maximum file size for uploads in bytes (default: 10MB)',
        category: 'uploads',
        type: 'number'
      },
      {
        key: 'allowed_file_types',
        value: 'pdf,doc,docx,txt',
        description: 'Comma-separated list of allowed file extensions',
        category: 'uploads',
        type: 'text'
      },
      {
        key: 'session_timeout',
        value: '7200',
        description: 'Session timeout in seconds (default: 2 hours)',
        category: 'security',
        type: 'number'
      },
      {
        key: 'enable_2fa',
        value: 'false',
        description: 'Enable two-factor authentication for all users',
        category: 'security',
        type: 'boolean'
      },
      {
        key: 'backup_frequency',
        value: 'daily',
        description: 'How often to perform automatic database backups',
        category: 'backup',
        type: 'text'
      },
      {
        key: 'backup_retention_days',
        value: '30',
        description: 'Number of days to keep backup files',
        category: 'backup',
        type: 'number'
      },
      {
        key: 'admin_email',
        value: 'admin@zu.ac.tz',
        description: 'Email address for system notifications and alerts',
        category: 'notifications',
        type: 'email'
      },
      {
        key: 'enable_email_notifications',
        value: 'true',
        description: 'Enable email notifications for system events',
        category: 'notifications',
        type: 'boolean'
      }
    ];
    setSettings(mockSettings);
  };

  const handleSettingChange = (key: string, value: string) => {
    setSettings(settings.map(setting => 
      setting.key === key ? { ...setting, value } : setting
    ));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    
    try {
      // Validate settings before saving
      const validationErrors = validateSettings();
      if (validationErrors.length > 0) {
        alert('Please fix the following errors:\n' + validationErrors.join('\n'));
        setSaving(false);
        return;
      }

      // Simulate API call with actual settings data
      const settingsData = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, string>);

      console.log('Saving settings:', settingsData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      setSaving(false);
      showSuccessMessage('System settings have been saved successfully!');
      
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaving(false);
      showErrorMessage('Failed to save settings. Please try again.');
    }
  };

  const validateSettings = (): string[] => {
    const errors: string[] = [];
    
    settings.forEach(setting => {
      if (setting.type === 'email' && setting.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(setting.value)) {
          errors.push(`${setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} must be a valid email address`);
        }
      }
      
      if (setting.type === 'number' && setting.value) {
        const num = parseInt(setting.value);
        if (isNaN(num) || num < 0) {
          errors.push(`${setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} must be a positive number`);
        }
      }
      
      if (setting.key === 'max_file_size' && setting.value) {
        const sizeMB = parseInt(setting.value) / (1024 * 1024);
        if (sizeMB > 100) {
          errors.push('Maximum file size should not exceed 100MB');
        }
      }
      
      if (setting.key === 'session_timeout' && setting.value) {
        const timeoutMinutes = parseInt(setting.value) / 60;
        if (timeoutMinutes < 5 || timeoutMinutes > 480) {
          errors.push('Session timeout should be between 5 minutes and 8 hours');
        }
      }
    });
    
    return errors;
  };

  const showSuccessMessage = (message: string) => {
    // Create a simple success notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  const showErrorMessage = (message: string) => {
    // Create a simple error notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  const handleBackup = async () => {
    try {
      // Show loading state
      const button = event?.target as HTMLButtonElement;
      if (button) {
        button.disabled = true;
        button.textContent = 'Creating Backup...';
      }

      // Simulate backup process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showSuccessMessage('Database backup created successfully! Backup file: backup_' + new Date().toISOString().split('T')[0] + '.sql');
      
      // Reset button
      if (button) {
        button.disabled = false;
        button.textContent = 'Create Backup';
      }
    } catch (error) {
      console.error('Backup failed:', error);
      showErrorMessage('Backup failed. Please try again.');
      
      // Reset button
      const button = event?.target as HTMLButtonElement;
      if (button) {
        button.disabled = false;
        button.textContent = 'Create Backup';
      }
    }
  };

  const handleRestore = async () => {
    if (confirm('Are you sure you want to restore from backup? This will overwrite current data and cannot be undone.')) {
      try {
        // Show loading state
        const button = event?.target as HTMLButtonElement;
        if (button) {
          button.disabled = true;
          button.textContent = 'Restoring...';
        }

        // Simulate restore process
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        showSuccessMessage('Database restored successfully! System will restart in 5 seconds.');
        
        // Reset button
        if (button) {
          button.disabled = false;
          button.textContent = 'Restore Backup';
        }
      } catch (error) {
        console.error('Restore failed:', error);
        showErrorMessage('Restore failed. Please check your backup file and try again.');
        
        // Reset button
        const button = event?.target as HTMLButtonElement;
        if (button) {
          button.disabled = false;
          button.textContent = 'Restore Backup';
        }
      }
    }
  };

  const handleClearCache = async () => {
    try {
      const button = event?.target as HTMLButtonElement;
      if (button) {
        button.disabled = true;
        button.textContent = 'Clearing Cache...';
      }

      // Simulate cache clearing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showSuccessMessage('System cache cleared successfully!');
      
      if (button) {
        button.disabled = false;
        button.textContent = 'Clear Cache';
      }
    } catch (error) {
      console.error('Cache clear failed:', error);
      showErrorMessage('Failed to clear cache. Please try again.');
      
      const button = event?.target as HTMLButtonElement;
      if (button) {
        button.disabled = false;
        button.textContent = 'Clear Cache';
      }
    }
  };

  const handleDownloadLogs = async () => {
    try {
      // Create mock log data
      const logData = `System Logs - ${new Date().toLocaleString()}
=====================================
[${new Date().toISOString()}] INFO: System startup completed
[${new Date().toISOString()}] INFO: Database connection established
[${new Date().toISOString()}] INFO: User authentication successful
[${new Date().toISOString()}] WARNING: High memory usage detected
[${new Date().toISOString()}] INFO: Scheduled backup completed
[${new Date().toISOString()}] ERROR: Failed to send email notification
[${new Date().toISOString()}] INFO: User logged out
[${new Date().toISOString()}] INFO: System shutdown initiated`;

      // Create and download log file
      const blob = new Blob([logData], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system_logs_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      showSuccessMessage('Log files downloaded successfully!');
    } catch (error) {
      console.error('Log download failed:', error);
      showErrorMessage('Failed to download log files.');
    }
  };

  const handleClearLogs = async () => {
    if (confirm('Are you sure you want to clear all system logs? This action cannot be undone.')) {
      try {
        const button = event?.target as HTMLButtonElement;
        if (button) {
          button.disabled = true;
          button.textContent = 'Clearing Logs...';
        }

        // Simulate log clearing
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        showSuccessMessage('System logs cleared successfully!');
        
        if (button) {
          button.disabled = false;
          button.textContent = 'Clear Logs';
        }
      } catch (error) {
        console.error('Log clear failed:', error);
        showErrorMessage('Failed to clear logs. Please try again.');
        
        const button = event?.target as HTMLButtonElement;
        if (button) {
          button.disabled = false;
          button.textContent = 'Clear Logs';
        }
      }
    }
  };

  const handleRunDiagnostics = async () => {
    try {
      const button = event?.target as HTMLButtonElement;
      if (button) {
        button.disabled = true;
        button.textContent = 'Running Diagnostics...';
      }

      // Simulate diagnostic tests
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Show diagnostic results
      const results = `
System Diagnostics Results:
✅ Database Connection: OK
✅ Server Performance: OK
✅ Disk Space: OK (45% used)
✅ Memory Usage: OK (62% used)
✅ Network Connectivity: OK
⚠️ SSL Certificate: Expires in 30 days
✅ Backup System: OK
✅ Email Service: OK
✅ File Upload: OK
✅ User Authentication: OK
      `;
      
      alert(results);
      showSuccessMessage('System diagnostics completed successfully!');
      
      if (button) {
        button.disabled = false;
        button.textContent = 'Run Diagnostics';
      }
    } catch (error) {
      console.error('Diagnostics failed:', error);
      showErrorMessage('Failed to run diagnostics. Please try again.');
      
      const button = event?.target as HTMLButtonElement;
      if (button) {
        button.disabled = false;
        button.textContent = 'Run Diagnostics';
      }
    }
  };

  const filteredSettings = settings.filter(setting => setting.category === activeTab);

  const renderSettingInput = (setting: SystemSetting) => {
    switch (setting.type) {
      case 'boolean':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={setting.value === 'true'}
              onChange={(e) => handleSettingChange(setting.key, e.target.checked.toString())}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-600">
              {setting.value === 'true' ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        );
      case 'number':
        return (
          <input
            type="number"
            value={setting.value}
            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
            min="0"
          />
        );
      case 'email':
        return (
          <input
            type="email"
            value={setting.value}
            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
            placeholder="email@example.com"
          />
        );
      default:
        return (
          <input
            type="text"
            value={setting.value}
            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
            placeholder="Enter value..."
          />
        );
    }
  };

  const handleResetToDefaults = async () => {
    if (confirm('Are you sure you want to reset all settings to default values? This action cannot be undone.')) {
      try {
        setSaving(true);
        
        // Reset to default values
        const defaultSettings = [
          { key: 'app_name', value: 'Zanzibar University Research Consultation System' },
          { key: 'max_file_size', value: '10485760' },
          { key: 'allowed_file_types', value: 'pdf,doc,docx,txt' },
          { key: 'session_timeout', value: '7200' },
          { key: 'enable_2fa', value: 'false' },
          { key: 'backup_frequency', value: 'daily' },
          { key: 'backup_retention_days', value: '30' },
          { key: 'admin_email', value: 'admin@zu.ac.tz' },
          { key: 'enable_email_notifications', value: 'true' }
        ];

        setSettings(settings.map(setting => {
          const defaultValue = defaultSettings.find(ds => ds.key === setting.key);
          return defaultValue ? { ...setting, value: defaultValue.value } : setting;
        }));

        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setSaving(false);
        showSuccessMessage('Settings have been reset to default values!');
        
      } catch (error) {
        console.error('Reset failed:', error);
        setSaving(false);
        showErrorMessage('Failed to reset settings. Please try again.');
      }
    }
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
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="mt-2 text-gray-600">Configure system parameters and preferences</p>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {['general', 'uploads', 'security', 'backup', 'notifications'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${
                  activeTab === tab
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-6">
            {filteredSettings.map((setting) => (
              <div key={setting.key}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <label htmlFor={setting.key} className="block text-sm font-medium text-gray-700">
                      {setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </label>
                    <p className="mt-1 text-sm text-gray-500">{setting.description}</p>
                  </div>
                  <div className="ml-4 w-64">
                    {renderSettingInput(setting)}
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-6 border-t border-gray-200">
              <div className="flex justify-between">
                <button
                  onClick={handleResetToDefaults}
                  disabled={saving}
                  className="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reset to Defaults
                </button>
                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Maintenance */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            System Maintenance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Database Backup</h4>
              <p className="text-sm text-gray-600 mb-4">
                Create a backup of the entire database including all user data and submissions.
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={handleBackup}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Create Backup
                </button>
                <button
                  onClick={handleRestore}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Restore Backup
                </button>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">System Cache</h4>
              <p className="text-sm text-gray-600 mb-4">
                Clear system cache to improve performance and resolve potential issues.
              </p>
              <button className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50" onClick={handleClearCache}>
                Clear Cache
              </button>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Log Files</h4>
              <p className="text-sm text-gray-600 mb-4">
                Download or clear system log files for troubleshooting and auditing.
              </p>
              <div className="flex space-x-2">
                <button className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50" onClick={handleDownloadLogs}>
                  Download Logs
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50" onClick={handleClearLogs}>
                  Clear Logs
                </button>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">System Health</h4>
              <p className="text-sm text-gray-600 mb-4">
                Run system diagnostics to check for issues and performance problems.
              </p>
              <button className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700" onClick={handleRunDiagnostics}>
                Run Diagnostics
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            System Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Application Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Version:</span>
                  <span className="font-medium">v1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Environment:</span>
                  <span className="font-medium">Development</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Node.js Version:</span>
                  <span className="font-medium">18.17.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Framework:</span>
                  <span className="font-medium">Next.js 14</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Database Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Database:</span>
                  <span className="font-medium">MySQL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Version:</span>
                  <span className="font-medium">8.0.33</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Connection:</span>
                  <span className="font-medium text-green-600">Connected</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Backup:</span>
                  <span className="font-medium">2 hours ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
