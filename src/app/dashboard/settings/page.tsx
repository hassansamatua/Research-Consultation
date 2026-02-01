'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';

interface UserSettings {
  notifications: {
    email_notifications: boolean;
    sms_notifications: boolean;
    deadline_reminders: boolean;
    submission_updates: boolean;
    meeting_reminders: boolean;
    system_updates: boolean;
  };
  privacy: {
    profile_visibility: 'public' | 'private' | 'department';
    show_email: boolean;
    show_phone: boolean;
    show_last_login: boolean;
  };
  preferences: {
    language: string;
    timezone: string;
    date_format: string;
    theme: 'light' | 'dark' | 'system';
    items_per_page: number;
  };
  security: {
    current_password: string;
    new_password: string;
    confirm_password: string;
    two_factor_enabled: boolean;
  };
}

export default function SettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notifications');
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      email_notifications: true,
      sms_notifications: false,
      deadline_reminders: true,
      submission_updates: true,
      meeting_reminders: true,
      system_updates: false
    },
    privacy: {
      profile_visibility: 'public',
      show_email: false,
      show_phone: false,
      show_last_login: true
    },
    preferences: {
      language: 'en',
      timezone: 'Africa/Dar_es_Salaam',
      date_format: 'MM/DD/YYYY',
      theme: theme,
      items_per_page: 10
    },
    security: {
      current_password: '',
      new_password: '',
      confirm_password: '',
      two_factor_enabled: false
    }
  });
  const router = useRouter();

  // Update theme in settings when global theme changes
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        theme: theme
      }
    }));
  }, [theme]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (key: keyof UserSettings['notifications'], value: boolean) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: value
      }
    });
  };

  const handlePrivacyChange = (key: keyof UserSettings['privacy'], value: any) => {
    setSettings({
      ...settings,
      privacy: {
        ...settings.privacy,
        [key]: value
      }
    });
  };

  const handlePreferenceChange = (key: keyof UserSettings['preferences'], value: any) => {
    setSettings({
      ...settings,
      preferences: {
        ...settings.preferences,
        [key]: value
      }
    });

    // If theme is changed, update global theme immediately
    if (key === 'theme') {
      setTheme(value);
    }
  };

  const handleSecurityChange = (key: keyof UserSettings['security'], value: string) => {
    setSettings({
      ...settings,
      security: {
        ...settings.security,
        [key]: value
      }
    });
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    // TODO: Implement save settings API
    console.log('Saving settings:', settings);
    
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      alert('Settings saved successfully!');
    }, 1000);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (settings.security.new_password !== settings.security.confirm_password) {
      alert('New passwords do not match!');
      return;
    }

    if (settings.security.new_password.length < 8) {
      alert('Password must be at least 8 characters long!');
      return;
    }

    // TODO: Implement password change API
    console.log('Changing password');
    alert('Password changed successfully!');
    
    // Clear password fields
    setSettings({
      ...settings,
      security: {
        ...settings.security,
        current_password: '',
        new_password: '',
        confirm_password: ''
      }
    });
  };

  const handleEnable2FA = () => {
    // TODO: Implement 2FA setup
    alert('Two-factor authentication setup coming soon!');
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
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">Manage your account settings and preferences</p>
      </div>

      <div className="bg-white shadow rounded-lg">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {['notifications', 'privacy', 'preferences', 'security'].map((tab) => (
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
          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Notification Preferences
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Choose how you want to receive notifications about your research activities.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label htmlFor="email_notifications" className="text-sm font-medium text-gray-900">
                        Email Notifications
                      </label>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                    <input
                      type="checkbox"
                      id="email_notifications"
                      checked={settings.notifications.email_notifications}
                      onChange={(e) => handleNotificationChange('email_notifications', e.target.checked)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label htmlFor="sms_notifications" className="text-sm font-medium text-gray-900">
                        SMS Notifications
                      </label>
                      <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                    </div>
                    <input
                      type="checkbox"
                      id="sms_notifications"
                      checked={settings.notifications.sms_notifications}
                      onChange={(e) => handleNotificationChange('sms_notifications', e.target.checked)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label htmlFor="deadline_reminders" className="text-sm font-medium text-gray-900">
                        Deadline Reminders
                      </label>
                      <p className="text-sm text-gray-500">Get reminded about upcoming deadlines</p>
                    </div>
                    <input
                      type="checkbox"
                      id="deadline_reminders"
                      checked={settings.notifications.deadline_reminders}
                      onChange={(e) => handleNotificationChange('deadline_reminders', e.target.checked)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label htmlFor="submission_updates" className="text-sm font-medium text-gray-900">
                        Submission Updates
                      </label>
                      <p className="text-sm text-gray-500">Notifications about submission reviews</p>
                    </div>
                    <input
                      type="checkbox"
                      id="submission_updates"
                      checked={settings.notifications.submission_updates}
                      onChange={(e) => handleNotificationChange('submission_updates', e.target.checked)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label htmlFor="meeting_reminders" className="text-sm font-medium text-gray-900">
                        Meeting Reminders
                      </label>
                      <p className="text-sm text-gray-500">Reminders about scheduled meetings</p>
                    </div>
                    <input
                      type="checkbox"
                      id="meeting_reminders"
                      checked={settings.notifications.meeting_reminders}
                      onChange={(e) => handleNotificationChange('meeting_reminders', e.target.checked)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label htmlFor="system_updates" className="text-sm font-medium text-gray-900">
                        System Updates
                      </label>
                      <p className="text-sm text-gray-500">Important system announcements</p>
                    </div>
                    <input
                      type="checkbox"
                      id="system_updates"
                      checked={settings.notifications.system_updates}
                      onChange={(e) => handleNotificationChange('system_updates', e.target.checked)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Privacy Settings
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Control what information is visible to other users in the system.
                </p>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="profile_visibility" className="block text-sm font-medium text-gray-900 mb-2">
                      Profile Visibility
                    </label>
                    <select
                      id="profile_visibility"
                      value={settings.privacy.profile_visibility}
                      onChange={(e) => handlePrivacyChange('profile_visibility', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    >
                      <option value="public">Public - Visible to all users</option>
                      <option value="department">Department - Visible to department members only</option>
                      <option value="private">Private - Visible to administrators only</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label htmlFor="show_email" className="text-sm font-medium text-gray-900">
                        Show Email Address
                      </label>
                      <p className="text-sm text-gray-500">Display your email in your profile</p>
                    </div>
                    <input
                      type="checkbox"
                      id="show_email"
                      checked={settings.privacy.show_email}
                      onChange={(e) => handlePrivacyChange('show_email', e.target.checked)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label htmlFor="show_phone" className="text-sm font-medium text-gray-900">
                        Show Phone Number
                      </label>
                      <p className="text-sm text-gray-500">Display your phone number in your profile</p>
                    </div>
                    <input
                      type="checkbox"
                      id="show_phone"
                      checked={settings.privacy.show_phone}
                      onChange={(e) => handlePrivacyChange('show_phone', e.target.checked)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label htmlFor="show_last_login" className="text-sm font-medium text-gray-900">
                        Show Last Login
                      </label>
                      <p className="text-sm text-gray-500">Display your last login time</p>
                    </div>
                    <input
                      type="checkbox"
                      id="show_last_login"
                      checked={settings.privacy.show_last_login}
                      onChange={(e) => handlePrivacyChange('show_last_login', e.target.checked)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  User Preferences
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Customize your experience with display and language preferences.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="language" className="block text-sm font-medium text-gray-900 mb-2">
                      Language
                    </label>
                    <select
                      id="language"
                      value={settings.preferences.language}
                      onChange={(e) => handlePreferenceChange('language', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    >
                      <option value="en">English</option>
                      <option value="sw">Swahili</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="timezone" className="block text-sm font-medium text-gray-900 mb-2">
                      Timezone
                    </label>
                    <select
                      id="timezone"
                      value={settings.preferences.timezone}
                      onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    >
                      <option value="Africa/Dar_es_Salaam">East Africa Time (EAT)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="date_format" className="block text-sm font-medium text-gray-900 mb-2">
                      Date Format
                    </label>
                    <select
                      id="date_format"
                      value={settings.preferences.date_format}
                      onChange={(e) => handlePreferenceChange('date_format', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="theme" className="block text-sm font-medium text-gray-900 mb-2">
                      Theme
                    </label>
                    <div className="flex items-center space-x-4">
                      <select
                        id="theme"
                        value={settings.preferences.theme}
                        onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System Default</option>
                      </select>
                      <div className="text-sm text-gray-500">
                        Current: <span className="font-medium">{theme === 'system' ? `System (${resolvedTheme})` : theme}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="items_per_page" className="block text-sm font-medium text-gray-900 mb-2">
                      Items Per Page
                    </label>
                    <select
                      id="items_per_page"
                      value={settings.preferences.items_per_page}
                      onChange={(e) => handlePreferenceChange('items_per_page', parseInt(e.target.value))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    >
                      <option value="5">5 items</option>
                      <option value="10">10 items</option>
                      <option value="25">25 items</option>
                      <option value="50">50 items</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Security Settings
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Manage your password and security preferences.
                </p>

                {/* Password Change */}
                <div className="border rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-gray-900 mb-4">Change Password</h4>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label htmlFor="current_password" className="block text-sm font-medium text-gray-700">
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="current_password"
                        value={settings.security.current_password}
                        onChange={(e) => handleSecurityChange('current_password', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">
                        New Password
                      </label>
                      <input
                        type="password"
                        id="new_password"
                        value={settings.security.new_password}
                        onChange={(e) => handleSecurityChange('new_password', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirm_password"
                        value={settings.security.confirm_password}
                        onChange={(e) => handleSecurityChange('confirm_password', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Change Password
                    </button>
                  </form>
                </div>

                {/* Two-Factor Authentication */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                    </div>
                    <button
                      onClick={handleEnable2FA}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      {settings.security.two_factor_enabled ? 'Manage' : 'Enable'}
                    </button>
                  </div>
                  <div className="flex items-center">
                    <svg className={`h-5 w-5 ${settings.security.two_factor_enabled ? 'text-green-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="ml-2 text-sm text-gray-600">
                      {settings.security.two_factor_enabled ? '2FA is enabled' : '2FA is disabled'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="pt-6 border-t border-gray-200">
            <div className="flex justify-end">
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
  );
}
