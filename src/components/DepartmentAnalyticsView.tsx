import React, { useState, useEffect } from 'react';
import { fetchDepartmentStats, fetchAdminDepartments } from '../lib/api.js';
import { DepartmentStats } from '../types.js';
import { Building2, Users, Clock, ShieldCheck, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';

export const DepartmentAnalyticsView: React.FC = () => {
  const [stats, setStats] = useState<DepartmentStats[]>([]);
  const [adminDeps, setAdminDeps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [sRes, dRes] = await Promise.all([fetchDepartmentStats(), fetchAdminDepartments()]);
        setStats(sRes || []);
        setAdminDeps(dRes || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Department Performance & SLA Analytics</h3>
          <p className="text-xs text-slate-500">Monitor response times, resolution rates, and departmental efficiency</p>
        </div>
      </div>

      {/* Grid of Department Cards */}
      <div className="grid grid-cols-3 gap-6">
        {stats.map((dep) => {
          const matchingAdmin = adminDeps.find(a => a.name === dep.department);
          const resolutionPercent = Math.round((dep.resolved / (dep.total || 1)) * 100);

          return (
            <div key={dep.department} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-200/60">
                    SLA: {matchingAdmin?.slaRating || '94%'}
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-base mb-1">{dep.department}</h4>
                <p className="text-xs text-slate-500 mb-4">Department Head: {matchingAdmin?.head || 'Administrator'}</p>

                {/* Progress bar */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-600">Resolution Rate</span>
                    <span className="text-blue-600">{resolutionPercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${resolutionPercent}%` }}></div>
                  </div>
                </div>

                {/* Stats Breakdown */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/60 text-center">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Total</p>
                    <p className="text-sm font-bold text-slate-900">{dep.total}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Resolved</p>
                    <p className="text-sm font-bold text-green-600">{dep.resolved}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Pending</p>
                    <p className="text-sm font-bold text-amber-600">{dep.pending}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Avg: {dep.avgResolutionHours}h
                </span>
                <span className="font-bold text-slate-700">Staff: {matchingAdmin?.staffCount || 12}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
