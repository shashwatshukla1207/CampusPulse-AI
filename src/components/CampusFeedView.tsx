import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { fetchComplaints, upvoteComplaintApi, fetchClusters } from '../lib/api.js';
import { Complaint, ComplaintCluster } from '../types.js';
import { 
  ThumbsUp, 
  Sparkles, 
  Search, 
  Building, 
  MapPin, 
  CheckCircle2, 
  Layers, 
  MessageSquare,
  PlusCircle
} from 'lucide-react';

interface CampusFeedViewProps {
  onOpenReportModal: () => void;
}

export const CampusFeedView: React.FC<CampusFeedViewProps> = ({ onOpenReportModal }) => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [clusters, setClusters] = useState<ComplaintCluster[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'feed' | 'clusters'>('feed');

  const loadData = async () => {
    try {
      const [cmpData, clData] = await Promise.all([
        fetchComplaints({ search }),
        fetchClusters()
      ]);
      setComplaints(cmpData || []);
      setClusters(clData || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  const handleUpvote = async (id: string) => {
    if (!user) return;
    try {
      const { complaint } = await upvoteComplaintApi(id, user.id);
      setComplaints(prev => prev.map(c => c.id === id ? complaint : c));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub-Nav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Live Campus Feedback & AI Clusters</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Upvote existing reports ("Me Too") to elevate priority with campus administration</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-4 py-1.5 rounded-xl transition-all ${
                activeTab === 'feed' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Public Feed
            </button>
            <button
              onClick={() => setActiveTab('clusters')}
              className={`px-4 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'clusters' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Clusters ({clusters.length})</span>
            </button>
          </div>

          <button
            onClick={onOpenReportModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Issue</span>
          </button>
        </div>
      </div>

      {/* Main Feed View */}
      {activeTab === 'feed' && (
        <div className="space-y-4 max-w-4xl mx-auto">
          {complaints.map((item) => {
            const hasUpvoted = item.upvotedBy.includes(user?.id || 'usr-student-1');

            return (
              <div key={item.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex gap-5 transition-colors">
                {/* Upvote Column */}
                <div className="flex flex-col items-center justify-start shrink-0">
                  <button
                    onClick={() => handleUpvote(item.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                      hasUpvoted
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <ThumbsUp className={`w-5 h-5 ${hasUpvoted ? 'fill-white' : ''}`} />
                    <span className="font-bold text-xs mt-1">{item.upvotesCount}</span>
                  </button>
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-1">Me Too</span>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold uppercase">
                        {item.category}
                      </span>
                      <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full text-[10px] font-bold uppercase">
                        {item.status}
                      </span>
                      {item.clusterTitle && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-bold flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Clustered Issue
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-base mb-1">{item.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">{item.description}</p>

                  {/* AI Summary Highlight */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 mb-3 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-700 italic">{item.aiSummary}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <img
                        src={item.studentAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt={item.studentName}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="font-semibold text-slate-700">{item.studentName}</span>
                    </div>
                    <span className="font-medium text-slate-500">{item.building} • {item.roomNumber}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* AI Clusters View */}
      {activeTab === 'clusters' && (
        <div className="grid grid-cols-3 gap-6">
          {clusters.map((cl) => (
            <div key={cl.id} className="bg-slate-900 text-white p-6 rounded-3xl shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">{cl.category}</span>
                  <span className="px-2.5 py-1 bg-red-500/20 text-red-300 rounded-full text-xs font-bold">
                    {cl.reportCount} Student Reports
                  </span>
                </div>

                <h4 className="font-bold text-base text-white mb-2">{cl.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">{cl.summary}</p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">{cl.building}</span>
                <span className="text-blue-400 font-bold">{cl.department}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
