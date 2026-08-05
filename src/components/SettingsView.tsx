import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext.js';
import { Sparkles, Bell, Shield, Moon, Sun, Check, Key } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [aiAutoClustering, setAiAutoClustering] = useState(true);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 transition-colors">
        <h3 className="font-bold text-slate-900 dark:text-white text-lg border-b border-slate-100 dark:border-slate-800 pb-3">
          Platform Preferences & Theme
        </h3>

        {/* Theme Preferences */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-bold text-xs text-slate-900 dark:text-slate-100">Dark Mode Canvas</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Switch application contrast to high-comfort dark theme</p>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`w-12 h-6 rounded-full p-1 transition-all ${
                isDarkMode ? 'bg-purple-600' : 'bg-slate-200'
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full transition-all ${
                  isDarkMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              ></div>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-xs text-slate-900 dark:text-slate-100">Gemini AI Auto-Clustering</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Automatically merge similar student complaints into cluster tickets</p>
              </div>
            </div>
            <button
              onClick={() => setAiAutoClustering(!aiAutoClustering)}
              className={`w-12 h-6 rounded-full p-1 transition-all ${
                aiAutoClustering ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full transition-all ${
                  aiAutoClustering ? 'translate-x-6' : 'translate-x-0'
                }`}
              ></div>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-green-50 dark:bg-green-950/60 text-green-600 dark:text-green-400 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-xs text-slate-900 dark:text-slate-100">Real-time Resolution Email Alerts</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Notify me when my reported issues change status or are resolved</p>
              </div>
            </div>
            <button
              onClick={() => setEmailAlerts(!emailAlerts)}
              className={`w-12 h-6 rounded-full p-1 transition-all ${
                emailAlerts ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full transition-all ${
                  emailAlerts ? 'translate-x-6' : 'translate-x-0'
                }`}
              ></div>
            </button>
          </div>
        </div>

        {/* System Info */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">CampusPulse AI Engine Version</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">v2.4.0 (Gemini 2.5 Flash + Multimodal Vision)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

