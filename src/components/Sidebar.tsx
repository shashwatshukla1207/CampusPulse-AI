import React from 'react';
import { useAuth } from '../context/AuthContext.js';
import { 
  BarChart3, 
  Layers, 
  Building2, 
  Users, 
  PlusCircle, 
  ListTodo, 
  Radio, 
  UserCircle, 
  Settings, 
  LogOut,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenReportModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onOpenReportModal }) => {
  const { user, switchRole, logout } = useAuth();
  const isAdmin = user?.role === 'admin';

  const adminNav = [
    { id: 'admin-insights', label: 'Admin Insights', icon: BarChart3 },
    { id: 'intelligence-feed', label: 'Intelligence Feed', icon: Layers },
    { id: 'department-analytics', label: 'Department Analytics', icon: Building2 },
    { id: 'student-database', label: 'Student Database', icon: Users },
  ];

  const studentNav = [
    { id: 'student-home', label: 'Dashboard Home', icon: BarChart3 },
    { id: 'my-complaints', label: 'My Complaints', icon: ListTodo },
    { id: 'campus-feed', label: 'Campus Feed', icon: Radio },
    { id: 'profile', label: 'My Profile', icon: UserCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const navItems = isAdmin ? adminNav : studentNav;

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full select-none shrink-0 transition-colors">
      {/* Brand Logo Header */}
      <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
            <div className="w-4 h-4 bg-white rounded-full opacity-90"></div>
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
            CampusPulse <span className="text-blue-600 dark:text-blue-400">AI</span>
          </span>
        </div>
      </div>

      {/* Primary Call to Action for Students */}
      {!isAdmin && (
        <div className="p-4">
          <button
            onClick={onOpenReportModal}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-sm hover:shadow transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Campus Issue</span>
          </button>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-2">
          {isAdmin ? 'Administration' : 'Student Menu'}
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* Role Fast-Switcher for Demo & Evaluation */}
        <div className="pt-6">
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-2">
            Role Switcher (Demo)
          </div>
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
            <button
              onClick={() => switchRole('student')}
              className={`py-1.5 rounded-lg transition-all ${
                !isAdmin
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Student
            </button>
            <button
              onClick={() => switchRole('admin')}
              className={`py-1.5 rounded-lg transition-all ${
                isAdmin
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Admin
            </button>
          </div>
        </div>
      </nav>

      {/* System Health / AI Engine Footer Box */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <div className="bg-slate-900 dark:bg-slate-950 rounded-2xl p-4 text-white shadow-sm mb-3 border border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-slate-400 font-medium">AI Core Status</p>
            <span className="flex items-center gap-1 text-[10px] text-green-400 font-bold">
              <Sparkles className="w-3 h-3 animate-pulse" />
              Active
            </span>
          </div>
          <p className="text-white text-xs font-semibold mb-2 italic line-clamp-1">
            "Optimizing Wi-Fi clusters"
          </p>
          <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
            <div className="w-3/4 h-full bg-blue-500"></div>
          </div>
        </div>

        {/* Current User Info / Logout */}
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2 overflow-hidden">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={user?.name}
              className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
            />
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
