import React from 'react';
import { useAuth } from '../context/AuthContext.js';
import { Award, Shield, UserCheck, Mail, Building, CheckCircle2, Sparkles } from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Card */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-6">
        <img
          src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
          alt={user?.name}
          className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 shadow-xs"
        />
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold text-slate-900">{user?.name}</h2>
            <span className="px-3 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase">
              {user?.role}
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-3">{user?.email}</p>

          <div className="flex items-center gap-6 text-xs text-slate-600 font-medium">
            <span className="flex items-center gap-1.5">
              <Building className="w-4 h-4 text-slate-400" />
              {user?.department || 'Computer Science & Engineering'}
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-slate-400" />
              {user?.building || 'CSE Block B'}
            </span>
          </div>
        </div>
      </div>

      {/* Badges / Achievements */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-blue-600" />
          CampusPulse Achievements & Badges
        </h3>

        <div className="grid grid-cols-3 gap-4">
          {(user?.achievements || ['Feedback Pioneer', 'Campus Scout', 'Quality Advocate']).map((ach) => (
            <div key={ach} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">{ach}</h4>
                <p className="text-[10px] text-slate-500">Verified Quality Reporter</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
