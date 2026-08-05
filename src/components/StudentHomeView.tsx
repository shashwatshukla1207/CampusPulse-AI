import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { fetchComplaints, fetchClusters } from '../lib/api.js';
import { Complaint, ComplaintCluster } from '../types.js';
import { 
  PlusCircle, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  ListTodo, 
  Radio, 
  TrendingUp, 
  ArrowRight,
  ThumbsUp,
  AlertTriangle
} from 'lucide-react';

interface StudentHomeViewProps {
  onOpenReportModal: () => void;
  setActiveTab: (tab: string) => void;
}

export const StudentHomeView: React.FC<StudentHomeViewProps> = ({ onOpenReportModal, setActiveTab }) => {
  const { user } = useAuth();
  const [myComplaints, setMyComplaints] = useState<Complaint[]>([]);
  const [clusters, setClusters] = useState<ComplaintCluster[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [cData, clData] = await Promise.all([
          fetchComplaints({ studentId: user?.id || 'usr-student-1' }),
          fetchClusters()
        ]);
        setMyComplaints(cData || []);
        setClusters(clData || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const activeCount = myComplaints.filter(c => c.status !== 'Resolved').length;
  const resolvedCount = myComplaints.filter(c => c.status === 'Resolved').length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-xs rounded-full text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Campus Intelligence Active</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">
            Welcome back, {user?.name || 'Alex'}!
          </h2>
          <p className="text-sm text-blue-100 leading-relaxed mb-6">
            Your reported feedback is analyzed by Gemini AI in real-time to auto-cluster similar issues across campus and fast-track administrative action.
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={onOpenReportModal}
              className="px-5 py-2.5 bg-white text-blue-700 hover:bg-blue-50 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Campus Issue</span>
            </button>
            <button
              onClick={() => setActiveTab('campus-feed')}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-xs transition-all flex items-center gap-1.5"
            >
              <span>Explore Campus Feed</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Floating AI Graphic Element */}
        <div className="absolute -right-8 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">My Active Reports</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{activeCount}</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Currently under administrative action</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Resolved Issues</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{resolvedCount}</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Verified & closed tickets</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-950/60 text-green-600 dark:text-green-400 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between border-l-4 border-l-purple-600 transition-colors">
          <div>
            <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">AI Clusters Formed</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{clusters.length}</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Merged multi-student reports</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: My Recent Reports (Col-span-7) + Major AI Clusters Impact (Col-span-5) */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">My Recent Submissions</h3>
            <button
              onClick={() => setActiveTab('my-complaints')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              View All ({myComplaints.length})
            </button>
          </div>

          <div className="space-y-3">
            {myComplaints.slice(0, 3).map((item) => {
              const statusBg =
                item.status === 'Resolved'
                  ? 'bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300'
                  : item.status === 'In Progress'
                  ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                  : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300';

              return (
                <div key={item.id} className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusBg}`}>
                      {item.status}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">{item.building}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">{item.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{item.aiSummary}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Clusters Panel */}
        <div className="col-span-5 bg-slate-900 p-6 rounded-3xl text-white shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-base">Active AI Intelligence Clusters</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              When multiple students report related issues, Gemini AI automatically groups them to demonstrate collective impact to university administration.
            </p>

            <div className="space-y-3">
              {clusters.slice(0, 2).map((c) => (
                <div key={c.id} className="p-3.5 bg-white/10 rounded-2xl border border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">{c.category}</span>
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full text-[10px] font-bold">
                      {c.reportCount} Students
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-white mb-1">{c.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{c.summary}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('campus-feed')}
            className="w-full mt-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all text-center"
          >
            Join / Upvote Active Issues
          </button>
        </div>
      </div>
    </div>
  );
};
