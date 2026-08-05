import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { fetchComplaints } from '../lib/api.js';
import { downloadComplaintProgressReport, downloadBulkComplaintsReport } from '../lib/reportExporter.js';
import { Complaint, ComplaintStatus } from '../types.js';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  Building, 
  PlusCircle, 
  ThumbsUp, 
  ArrowRight,
  ShieldCheck,
  Download,
  FileText
} from 'lucide-react';

interface MyComplaintsViewProps {
  onOpenReportModal: () => void;
}

const STAGES: ComplaintStatus[] = ['Pending', 'Under Review', 'In Progress', 'Resolved'];

export const MyComplaintsView: React.FC<MyComplaintsViewProps> = ({ onOpenReportModal }) => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Complaint | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchComplaints({ studentId: user?.id || 'usr-student-1' });
        setComplaints(data);
        if (data.length > 0) setSelected(data[0]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">My Reported Issues</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Track real-time administrative status, assigned department, and download full progress reports</p>
        </div>
        <div className="flex items-center gap-3">
          {complaints.length > 0 && (
            <button
              onClick={() => downloadBulkComplaintsReport(complaints, `${user?.name || 'Student'} My Reported Issues Audit`)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
              title="Download full progress report of all my complaints"
            >
              <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Export All Reports</span>
            </button>
          )}
          <button
            onClick={onOpenReportModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Report</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left List */}
        <div className="col-span-12 md:col-span-6 space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          {complaints.map((item) => {
            const isSelected = selected?.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelected(item)}
                className={`p-4 rounded-3xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 border-blue-500 shadow-md ring-2 ring-blue-500/10'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    {item.category}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">{item.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{item.aiSummary}</p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{item.building}</span>
                  <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-full font-bold text-[10px]">
                    {item.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Tracker Detail Panel */}
        <div className="col-span-12 md:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          {selected ? (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold">
                      {selected.category}
                    </span>
                    <span className="text-xs text-slate-400">ID: {selected.id}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg leading-snug">{selected.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{selected.building} • {selected.floor} • {selected.roomNumber}</p>
                </div>

                {/* Primary Report Download Button */}
                <button
                  onClick={() => downloadComplaintProgressReport(selected)}
                  className="px-3 py-2 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/80 text-blue-700 dark:text-blue-300 rounded-2xl border border-blue-200 dark:border-blue-800 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0"
                  title="Download full complaint progress report & resolution audit"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Report</span>
                </button>
              </div>

              {/* Status Timeline */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resolution Progress Timeline</p>
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full">
                    Current: {selected.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-4 gap-2 relative">
                  {STAGES.map((stage, idx) => {
                    const currentIdx = STAGES.indexOf(selected.status);
                    const isPassed = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <div key={stage} className="flex flex-col items-center text-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-all ${
                            isPassed
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                          } ${isCurrent ? 'ring-4 ring-blue-500/20' : ''}`}
                        >
                          {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>
                        <span className={`text-[10px] font-bold ${isPassed ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}`}>
                          {stage}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AI Administrative Synthesis */}
              <div className="p-4 bg-slate-900 dark:bg-slate-950 text-white rounded-2xl space-y-2 border border-slate-800">
                <div className="flex items-center gap-1.5 text-blue-400 text-xs font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>Gemini AI Summary & Priority Assignment</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">{selected.aiSummary}</p>
                <div className="pt-2 border-t border-slate-800 flex justify-between text-xs">
                  <span className="text-slate-400">Assigned Department:</span>
                  <span className="font-bold text-blue-300">{selected.department}</span>
                </div>
              </div>

              {/* Resolution Notes if available */}
              {selected.resolutionNotes && (
                <div className="p-3.5 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-2xl">
                  <p className="text-[10px] font-bold text-green-700 dark:text-green-400 uppercase mb-1">Administrative Note & SLA Resolution</p>
                  <p className="text-xs text-green-900 dark:text-green-200 font-semibold">{selected.resolutionNotes}</p>
                </div>
              )}

              {/* Bottom Quick Actions Box */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Official CampusPulse Progress Audit Document</span>
                <button
                  onClick={() => downloadComplaintProgressReport(selected)}
                  className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download .TXT Progress Audit</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-400">
              <p className="text-sm font-semibold">No issue selected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

