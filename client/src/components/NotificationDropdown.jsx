import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Trash2,
  UserPlus,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Clock,
  X,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { dashboardApi } from '../services/api';

function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
}

function getNotificationIcon(actionType) {
  switch (actionType) {
    case 'candidate_added':
      return {
        icon: UserPlus,
        bgColor: 'bg-blue-50 text-blue-600',
        borderColor: 'border-blue-200'
      };
    case 'interview_scheduled':
      return {
        icon: Calendar,
        bgColor: 'bg-purple-50 text-purple-600',
        borderColor: 'border-purple-200'
      };
    case 'offer_extended':
    case 'candidate_hired':
      return {
        icon: CheckCircle2,
        bgColor: 'bg-emerald-50 text-emerald-600',
        borderColor: 'border-emerald-200'
      };
    case 'job_created':
    case 'job_updated':
    case 'job_reopened':
      return {
        icon: Briefcase,
        bgColor: 'bg-indigo-50 text-indigo-600',
        borderColor: 'border-indigo-200'
      };
    case 'job_closed':
    case 'candidate_deleted':
      return {
        icon: AlertCircle,
        bgColor: 'bg-amber-50 text-amber-600',
        borderColor: 'border-amber-200'
      };
    default:
      return {
        icon: ArrowRight,
        bgColor: 'bg-slate-100 text-slate-600',
        borderColor: 'border-slate-200'
      };
  }
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(() => {
    try {
      const saved = localStorage.getItem('talentflow_read_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getActivity();
      if (res && res.data) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch activity notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  // Sync read IDs with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('talentflow_read_notifications', JSON.stringify(readIds));
    } catch (e) {
      // ignore storage errors
    }
  }, [readIds]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !readIds.includes(n._id)).length;

  const markAllAsRead = () => {
    const allIds = notifications.map((n) => n._id);
    setReadIds(Array.from(new Set([...readIds, ...allIds])));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (item) => {
    // Mark as read
    if (!readIds.includes(item._id)) {
      setReadIds((prev) => [...prev, item._id]);
    }
    setIsOpen(false);

    // Direct navigation if associated with candidate or job
    if (item.candidateId) {
      const cId = typeof item.candidateId === 'object' ? item.candidateId._id : item.candidateId;
      if (cId) {
        navigate(`/candidates/${cId}`);
        return;
      }
    }
    if (item.jobId) {
      const jId = typeof item.jobId === 'object' ? item.jobId._id : item.jobId;
      if (jId) {
        navigate(`/jobs/${jId}`);
        return;
      }
    }
    // Fallback to pipeline or candidates list
    if (item.actionType && item.actionType.includes('job')) {
      navigate('/jobs');
    } else {
      navigate('/candidates');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            fetchActivities();
          }
        }}
        className={`relative p-2 rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
          isOpen
            ? 'text-primary-600 bg-primary-50'
            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
        }`}
        title="Notifications"
        aria-label="View notifications"
        aria-expanded={isOpen}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-800 text-sm">Notifications</h3>
              {unreadCount > 0 ? (
                <span className="px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
                  {unreadCount} unread
                </span>
              ) : (
                <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
                  All caught up
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="p-1.5 text-xs text-slate-500 hover:text-primary-600 hover:bg-slate-100 rounded-md transition-colors flex items-center gap-1"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mark read</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-md transition-colors"
                  title="Clear list"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading updates...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-slate-700">No notifications</p>
                <p className="text-xs text-slate-400 mt-1">
                  You're all caught up with your recruitment updates.
                </p>
              </div>
            ) : (
              notifications.map((item) => {
                const isRead = readIds.includes(item._id);
                const { icon: Icon, bgColor } = getNotificationIcon(item.actionType);

                return (
                  <div
                    key={item._id}
                    onClick={() => handleNotificationClick(item)}
                    className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors relative hover:bg-slate-50 ${
                      !isRead ? 'bg-primary-50/40' : ''
                    }`}
                  >
                    {!isRead && (
                      <span className="absolute left-1.5 top-5 w-1.5 h-1.5 bg-primary-600 rounded-full" />
                    )}

                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${bgColor}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs leading-snug line-clamp-2 ${
                          !isRead ? 'font-semibold text-slate-900' : 'text-slate-700'
                        }`}
                      >
                        {item.description}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimeAgo(item.createdAt)}</span>
                        {item.actor && item.actor !== 'System' && (
                          <>
                            <span>•</span>
                            <span>{item.actor}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/pipeline');
                }}
                className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline"
              >
                View recruitment pipeline &rarr;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
