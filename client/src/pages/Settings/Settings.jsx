import { Settings as SettingsIcon, User, Bell, Shield, Database } from 'lucide-react';

export default function Settings() {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
            <SettingsIcon className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Settings</h2>
            <p className="text-sm text-slate-500">Manage your ATS configuration</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Profile */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-700">Profile</p>
                <p className="text-xs text-slate-400">Manage your account details</p>
              </div>
            </div>
            <span className="text-xs text-slate-400">HR Manager</span>
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-700">Notifications</p>
                <p className="text-xs text-slate-400">Configure email and in-app notifications</p>
              </div>
            </div>
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Enabled</span>
          </div>

          {/* Security */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-700">Security</p>
                <p className="text-xs text-slate-400">Password and authentication settings</p>
              </div>
            </div>
          </div>

          {/* Data */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-700">Data Management</p>
                <p className="text-xs text-slate-400">Export data and manage storage</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">About TalentFlow ATS</h3>
        <div className="text-sm text-slate-500 space-y-1">
          <p>Version 1.0.0</p>
          <p>A modern applicant tracking system for streamlined recruitment.</p>
          <p className="text-xs text-slate-400 mt-2">Built with React, Express, and MongoDB</p>
        </div>
      </div>
    </div>
  );
}
