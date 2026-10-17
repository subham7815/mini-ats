import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import GlobalSearch from '../components/GlobalSearch';
import NotificationDropdown from '../components/NotificationDropdown';

const pageTitles = {
  '/': 'Dashboard',
  '/candidates': 'Candidates',
  '/jobs': 'Jobs',
  '/pipeline': 'Pipeline',
  '/settings': 'Settings'
};

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const pathBase = '/' + (location.pathname.split('/')[1] || '');
  const pageTitle = pageTitles[pathBase] || 'TalentFlow ATS';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - hidden on mobile unless menu open */}
      <div className={`lg:block ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Main content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'}`}>
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-slate-800">{pageTitle}</h1>
                <p className="text-xs text-slate-400">
                  {location.pathname === '/' ? 'Recruitment overview' :
                    location.pathname.replace(/\//g, ' > ').trim().replace('>', '').trim()
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:block">
                <GlobalSearch />
              </div>
              <NotificationDropdown />
              <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                  <span className="text-white text-xs font-medium">HR</span>
                </div>
              </div>
            </div>
          </div>
          {/* Mobile search */}
          <div className="md:hidden px-4 pb-3">
            <GlobalSearch />
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
