import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Kanban,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/candidates', icon: Users, label: 'Candidates' },
  { to: '/jobs', icon: Briefcase, label: 'Jobs' },
  { to: '/pipeline', icon: Kanban, label: 'Pipeline' },
  { to: '/settings', icon: Settings, label: 'Settings' }
];

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();

  return (
    <aside className={`fixed left-0 top-0 h-full bg-navy-900 text-white flex flex-col transition-all duration-300 z-30 ${collapsed ? 'w-16' : 'w-60'}`}>
      {/* Logo */}
      <div className={`flex items-center h-16 px-4 border-b border-white/10 ${collapsed ? 'justify-center' : 'gap-3'}`}>
        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">TF</span>
        </div>
        {!collapsed && (
          <div>
            <h1 className="text-sm font-bold tracking-wide">TalentFlow</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">ATS</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const isActive = item.to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
                ${isActive
                  ? 'bg-primary-600/20 text-primary-300'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-white/10 p-3">
        {!collapsed && (
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center text-xs font-medium">
              HR
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">HR Manager</p>
              <p className="text-xs text-slate-400 truncate">hr@talentflow.com</p>
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
