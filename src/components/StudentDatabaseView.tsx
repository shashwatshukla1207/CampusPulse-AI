import React, { useState, useEffect } from 'react';
import { fetchAdminStudents } from '../lib/api.js';
import { User } from '../types.js';
import { Search, Shield, Award, Mail, Building, UserCheck } from 'lucide-react';

export const StudentDatabaseView: React.FC = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchAdminStudents();
        setStudents(data);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(query.toLowerCase()) ||
    s.email.toLowerCase().includes(query.toLowerCase()) ||
    (s.department && s.department.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Student Directory & Active Reporters</h3>
          <p className="text-xs text-slate-500">View registered students, feedback activity, and achievements</p>
        </div>

        <div className="relative w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search student name or email..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-6">Student</th>
              <th className="py-3.5 px-6">Department</th>
              <th className="py-3.5 px-6">Primary Location</th>
              <th className="py-3.5 px-6">Achievements</th>
              <th className="py-3.5 px-6">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <img
                      src={s.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={s.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{s.name}</p>
                      <p className="text-[11px] text-slate-400">{s.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-slate-800">{s.department || 'Computer Science'}</td>
                <td className="py-4 px-6 text-slate-600">{s.building || 'CSE Block B'}</td>
                <td className="py-4 px-6">
                  <div className="flex flex-wrap gap-1">
                    {(s.achievements || ['Feedback Pioneer']).map((ach) => (
                      <span key={ach} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-bold">
                        {ach}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1">
                    <UserCheck className="w-3 h-3" /> Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
