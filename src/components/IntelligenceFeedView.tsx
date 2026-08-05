import React, { useState, useEffect } from 'react';
import { fetchComplaints, updateComplaintStatusApi } from '../lib/api.js';
import { downloadComplaintProgressReport, downloadBulkComplaintsReport } from '../lib/reportExporter.js';
import { Complaint, ComplaintStatus, ComplaintPriority } from '../types.js';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  User, 
  Building, 
  ArrowRight, 
  RefreshCw,
  FileText,
  Download
} from 'lucide-react';

export const IntelligenceFeedView: React.FC<{ searchQuery: string }> = ({ searchQuery }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchComplaints({
        search: searchQuery,
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        priority: selectedPriority === 'All' ? undefined : selectedPriority,
        status: selectedStatus === 'All' ? undefined : selectedStatus,
        department: selectedDepartment === 'All' ? undefined : selectedDepartment,
      });
      setComplaints(data);
      if (data.length > 0 && !selectedComplaint) {
        setSelectedComplaint(data[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, selectedCategory, selectedPriority, selectedStatus, selectedDepartment]);

  const handleStatusChange = async (id: string, newStatus: ComplaintStatus) => {
    try {
      await updateComplaintStatusApi(id, { status: newStatus });
      setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
      if (selectedComplaint?.id === id) {
        setSelectedComplaint({ ...selectedComplaint, status: newStatus });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePriorityChange = async (id: string, newPriority: ComplaintPriority) => {
    try {
      await updateComplaintStatusApi(id, { priority: newPriority });
      setComplaints(prev => prev.map(c => c.id === id ? { ...c, priority: newPriority } : c));
      if (selectedComplaint?.id === id) {
        setSelectedComplaint({ ...selectedComplaint, priority: newPriority });
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3 overflow-x-auto">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Filters:
          </span>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Under Review">Under Review</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="All">All Categories</option>
            <option value="Wi-Fi Problem">Wi-Fi Problem</option>
            <option value="Broken Projector">Broken Projector</option>
            <option value="Washroom Hygiene">Washroom Hygiene</option>
            <option value="Library">Library</option>
            <option value="Cafeteria">Cafeteria</option>
            <option value="Water Leakage">Water Leakage</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {complaints.length > 0 && (
            <button
              onClick={() => downloadBulkComplaintsReport(complaints, 'Administrative Intelligence Feed Audit')}
              className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-bold transition-all border border-blue-200 dark:border-blue-800 flex items-center gap-1.5"
              title="Download bulk audit report"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit</span>
            </button>
          )}
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
            {complaints.length} Total Reports
          </span>
          <button
            onClick={loadData}
            className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Split Content: List Left, Details Right */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left List (Col-span-7) */}
        <div className="col-span-12 lg:col-span-7 space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          {complaints.map((item) => {
            const isSelected = selectedComplaint?.id === item.id;
            const priorityBadge =
              item.priority === 'Critical'
                ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300'
                : item.priority === 'High'
                ? 'bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300'
                : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300';

            const statusBadge =
              item.status === 'Resolved'
                ? 'bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300'
                : item.status === 'In Progress'
                ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300';

            return (
              <div
                key={item.id}
                onClick={() => setSelectedComplaint(item)}
                className={`p-4 rounded-3xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 border-blue-500 shadow-md ring-2 ring-blue-500/10'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${priorityBadge}`}>
                      {item.priority}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusBadge}`}>
                      {item.status}
                    </span>
                    {item.clusterTitle && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        AI Clustered ({item.upvotesCount})
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-slate-400">
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">{item.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{item.aiSummary || item.description}</p>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{item.building} • {item.roomNumber}</span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">{item.department}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Detail Drawer (Col-span-5) */}
        <div className="col-span-12 lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col h-fit sticky top-24 transition-colors">
          {selectedComplaint ? (
            <div className="space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    {selectedComplaint.category}
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base leading-snug mt-1">
                    {selectedComplaint.title}
                  </h3>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300">
                    Urgency: {selectedComplaint.urgencyScore}/10
                  </span>
                  <button
                    onClick={() => downloadComplaintProgressReport(selectedComplaint)}
                    className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 border border-blue-200 dark:border-blue-800"
                    title="Download Progress Report"
                  >
                    <Download className="w-3 h-3" />
                    <span>Report .TXT</span>
                  </button>
                </div>
              </div>

              {/* AI Administrative Summary Box */}
              <div className="p-3.5 bg-slate-900 dark:bg-slate-950 text-white rounded-2xl border border-slate-800">
                <div className="flex items-center gap-1.5 text-blue-400 text-xs font-bold mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Gemini AI Synthesis</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {selectedComplaint.aiSummary}
                </p>
                {selectedComplaint.clusterTitle && (
                  <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-purple-300 font-medium">
                    Merged into AI Cluster: "{selectedComplaint.clusterTitle}" ({selectedComplaint.upvotesCount} student reports)
                  </div>
                )}
              </div>

              {/* Full Student Description */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Original Description</p>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                  {selectedComplaint.description}
                </p>
              </div>

              {/* Location & Reporter Info */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Location</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{selectedComplaint.building}</p>
                  <p className="text-slate-500 dark:text-slate-400">{selectedComplaint.floor} • {selectedComplaint.roomNumber}</p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Reported By</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{selectedComplaint.studentName}</p>
                  <p className="text-slate-500 dark:text-slate-400">Student ID: {selectedComplaint.studentId}</p>
                </div>
              </div>

              {/* Administrative Resolution Controls */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Administrative Resolution</p>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Status</label>
                    <select
                      value={selectedComplaint.status}
                      onChange={(e) => handleStatusChange(selectedComplaint.id, e.target.value as ComplaintStatus)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Under Review">Under Review</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Priority</label>
                    <select
                      value={selectedComplaint.priority}
                      onChange={(e) => handlePriorityChange(selectedComplaint.id, e.target.value as ComplaintPriority)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                {selectedComplaint.status === 'Resolved' && (
                  <div className="p-3 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-2xl flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
                    <span className="text-xs text-green-800 dark:text-green-200 font-semibold">
                      Resolved & verified with department SLA.
                    </span>
                  </div>
                )}

                <button
                  onClick={() => downloadComplaintProgressReport(selectedComplaint)}
                  className="w-full py-2 bg-slate-900 dark:bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                  <span>Download Complete Complaint Progress Report</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-400">
              <p className="text-sm font-semibold">Select a complaint from the list to inspect</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

