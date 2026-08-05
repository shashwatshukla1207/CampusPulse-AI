import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';
import { fetchNotifications, markNotificationReadApi, markAllNotificationsReadApi } from '../lib/api.js';
import { NotificationItem } from '../types.js';
import { 
  Search, 
  Bell, 
  Sparkles, 
  PlusCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  Check, 
  X,
  Moon,
  Sun
} from 'lucide-react';

interface HeaderProps {
  title: string;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  onOpenReportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, searchQuery, setSearchQuery, onOpenReportModal }) => {
  const { user } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const isAdmin = user?.role === 'admin';

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = async () => {
    try {
      const role = isAdmin ? 'admin' : 'student';
      const res = await fetchNotifications(role);
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, [user, isAdmin]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationReadApi(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const role = isAdmin ? 'admin' : 'student';
      await markAllNotificationsReadApi(role);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredNotifs = notifications.filter(n => (filter === 'unread' ? !n.read : true));

  const getNotifIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'resolved':
        return <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />;
      case 'high_priority':
        return <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />;
      case 'cluster':
        return <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />;
      case 'sla_warning':
        return <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />;
      case 'status_change':
      default:
        return <Clock className="w-4 h-4 text-blue-600 shrink-0" />;
    }
  };

  const formatTime = (ts: string) => {
    const diffMins = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <header className="h-16 bg-white/80 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between sticky top-0 z-30 shrink-0 transition-colors">
      {/* Title + Status Badge */}
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
        <span className="px-2.5 py-0.5 bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-400 text-[10px] font-bold rounded-full uppercase tracking-tight flex items-center gap-1 border border-green-200 dark:border-green-800">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
          Live Intelligence
        </span>
      </div>

      {/* Right Tools: Search + Actions + Notifications + Dark Mode + Profile */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search intelligence, reports, buildings..."
            className="bg-slate-100 dark:bg-slate-800 border-none rounded-full pl-9 pr-4 py-1.5 text-xs w-56 focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400 transition-all font-medium"
          />
        </div>

        {!isAdmin && (
          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-semibold shadow-xs transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Report Issue</span>
          </button>
        )}

        {/* Dark Mode Toggle Button */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors focus:outline-none"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors focus:outline-none"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown Popover */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Popover Header */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Notifications</h4>
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold rounded-full">
                    {isAdmin ? 'Admin View' : 'Student Updates'}
                  </span>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
              </div>

              {/* Filter Tabs */}
              <div className="flex border-b border-slate-100 dark:border-slate-800 text-xs font-semibold bg-white dark:bg-slate-900 px-4 pt-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`pb-2 px-3 border-b-2 transition-all ${
                    filter === 'all'
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`pb-2 px-3 border-b-2 transition-all ${
                    filter === 'unread'
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
              </div>

              {/* Notification Items List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {filteredNotifs.length > 0 ? (
                  filteredNotifs.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleMarkAsRead(item.id)}
                      className={`p-4 flex gap-3 cursor-pointer transition-colors ${
                        item.read
                          ? 'bg-white dark:bg-slate-900 opacity-80'
                          : 'bg-blue-50/40 dark:bg-blue-950/30 hover:bg-blue-50/70 dark:hover:bg-blue-950/50 font-medium'
                      }`}
                    >
                      <div className="mt-0.5">{getNotifIcon(item.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{item.title}</p>
                          <span className="text-[10px] text-slate-400 shrink-0">{formatTime(item.timestamp)}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug line-clamp-2">{item.message}</p>
                      </div>
                      {!item.read && (
                        <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0 self-center"></div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400">
                    <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    <p className="text-xs font-semibold">No notifications available</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-center">
                <span className="text-[10px] font-semibold text-slate-400">
                  Real-time CampusPulse Notification Queue Active
                </span>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Info */}
        <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-800 pl-4">
          <div className="text-right">
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{user?.name || 'Dr. Sarah Chen'}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">{user?.role || 'admin'}</p>
          </div>
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'}
            alt={user?.name || 'Profile'}
            className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
          />
        </div>
      </div>
    </header>
  );
};
