import React, { useState, useEffect } from 'react';
import { fetchAnalyticsSummary, fetchAnalyticsTrends, fetchDepartmentStats, fetchAIInsights, fetchClusters, generateSuggestionsApi } from '../lib/api.js';
import { DepartmentStats, TrendDataPoint, AIInsights, ComplaintCluster } from '../types.js';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  Sparkles, 
  Download, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight, 
  RefreshCw,
  Building2,
  Lightbulb,
  Loader2,
  Send
} from 'lucide-react';

const COLORS = ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#1E40AF', '#1E3A8A'];

export const AdminInsightsView: React.FC = () => {
  const [summary, setSummary] = useState<any>({
    totalComplaints: 136,
    pending: 24,
    inProgress: 38,
    resolved: 74,
    resolutionRate: 84,
    mostAffectedBuilding: 'CSE Block B',
    mostCommonCategory: 'Wi-Fi Problem',
    weeklyGrowth: '+12%',
  });
  const [trends, setTrends] = useState<TrendDataPoint[]>([]);
  const [departments, setDepartments] = useState<DepartmentStats[]>([]);
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [clusters, setClusters] = useState<ComplaintCluster[]>([]);
  const [chartMode, setChartMode] = useState<'trends' | 'departments' | 'pie'>('trends');
  const [isLoading, setIsLoading] = useState(false);

  const [customTopic, setCustomTopic] = useState('');
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [customSuggestions, setCustomSuggestions] = useState<any[]>([]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sumRes, trRes, depRes, insRes, clRes] = await Promise.all([
        fetchAnalyticsSummary(),
        fetchAnalyticsTrends(),
        fetchDepartmentStats(),
        fetchAIInsights(),
        fetchClusters()
      ]);
      if (sumRes) setSummary(sumRes);
      if (trRes) setTrends(trRes);
      if (depRes) setDepartments(depRes);
      if (insRes) setInsights(insRes);
      if (clRes) setClusters(clRes);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateCustomSuggestions = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsGeneratingSuggestions(true);
    try {
      const res = await generateSuggestionsApi(customTopic || 'Campus Infrastructure & Student Welfare Optimization');
      setCustomSuggestions(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const handleDownloadPDF = () => {
    const reportText = `CAMPUSPULSE AI - WEEKLY CAMPUS HEALTH REPORT
==================================================
Date: ${new Date().toLocaleDateString()}
Total Feedback Processed: ${summary.totalComplaints || 136}
Active Resolution Rate: ${summary.resolutionRate || 84.2}%
AI Sentiment Score: ${insights?.sentimentScore || 7.8} / 10 (${insights?.sentimentLabel || 'Excellent'})
Most Affected Building: ${summary.mostAffectedBuilding || 'CSE Block B'}

TOP AI INTELLIGENCE CLUSTERS:
${clusters.map((c, i) => `${i + 1}. [${c.category}] ${c.title} - ${c.reportCount} student reports (${c.department})`).join('\n')}

AI WEEKLY SUMMARY:
${insights?.weeklySummary || 'Overall campus pulse shows an 18% reduction in unresolved IT tickets following PoE node replacements.'}
`;
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CampusPulse-AI-Report-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Executive Intelligence Overview</h3>
          <p className="text-xs text-slate-500">Real-time NLP clustering & administrative resolution pulse</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh AI Pulse</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Weekly Report</span>
          </button>
        </div>
      </div>

      {/* Top Stats Grid - Clean Utility / Minimal matching */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1 uppercase tracking-wider">Student Pulse (Weekly)</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            {summary.totalComplaints || 1482}{' '}
            <span className="text-xs text-blue-500 font-normal ml-1">{summary.weeklyGrowth || '+12%'}</span>
          </h3>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">AI Analyzed Feedback Points</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1 uppercase tracking-wider">Active Resolution</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            {summary.resolutionRate || 84.2}%{' '}
            <span className="text-xs text-green-500 font-normal ml-1">+4%</span>
          </h3>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">Closure Rate within 48 Hours</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1 uppercase tracking-wider">Major Clusters</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            {clusters.length >= 1 ? `0${clusters.length}` : '06'}{' '}
            <span className="text-xs text-red-500 font-normal ml-1">Active</span>
          </h3>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">Critical Issue Groupings</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs border-l-4 border-l-blue-600 transition-colors">
          <p className="text-blue-600 dark:text-blue-400 text-xs font-bold mb-1 uppercase tracking-wider">AI Sentiment Score</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tighter">
            {insights?.sentimentLabel || 'Excellent'}{' '}
            <span className="text-xs text-slate-400 font-normal ml-1">
              ({insights?.sentimentScore || '7.8'}/10)
            </span>
          </h3>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">NLP Analysis of Student Mood</p>
        </div>
      </div>

      {/* Main Visuals Section - Grid cols-12 */}
      <div className="grid grid-cols-12 gap-6">
        {/* Chart Panel (Col-span-8) */}
        <div className="col-span-12 lg:col-span-8 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col transition-colors">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-base">Campus Health & Resolution Trend</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Intelligence tracking across all 12 blocks</p>
            </div>
            <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium">
              <button
                onClick={() => setChartMode('trends')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  chartMode === 'trends' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Weekly Trend
              </button>
              <button
                onClick={() => setChartMode('departments')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  chartMode === 'departments' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Departments
              </button>
              <button
                onClick={() => setChartMode('pie')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  chartMode === 'pie' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Categories
              </button>
            </div>
          </div>

          <div className="h-64 w-full">
            {chartMode === 'trends' && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends}>
                  <defs>
                    <linearGradient id="colorComplaints" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="complaints"
                    name="Student Reports"
                    stroke="#2563EB"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorComplaints)"
                  />
                  <Area
                    type="monotone"
                    dataKey="resolved"
                    name="Resolved Issues"
                    stroke="#10B981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorResolved)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}

            {chartMode === 'departments' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departments} layout="vertical">
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                  <YAxis dataKey="department" type="category" stroke="#64748b" fontSize={11} width={120} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="resolved" name="Resolved" fill="#2563EB" radius={[0, 6, 6, 0]} />
                  <Bar dataKey="pending" name="Pending" fill="#93C5FD" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {chartMode === 'pie' && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Pie
                    data={[
                      { name: 'Wi-Fi Problem', value: 38 },
                      { name: 'Library HVAC', value: 24 },
                      { name: 'Water Leakage', value: 16 },
                      { name: 'Cafeteria Peak', value: 12 },
                      { name: 'Broken Projector', value: 10 },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* AI Weekly Summary banner below chart */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Gemini AI Executive Analysis</p>
              <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                {insights?.weeklySummary ||
                  'Overall campus pulse shows an 18% reduction in unresolved IT tickets following PoE node replacements. Library HVAC remains the top student focus area.'}
              </p>
            </div>
          </div>
        </div>

        {/* AI Intelligence Cluster Panel (Col-span-4) - matching requested Clean Utility / Minimal dark panel */}
        <div className="col-span-4 bg-slate-900 p-6 rounded-3xl text-white shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <h4 className="font-bold text-base">AI Intelligence Cluster</h4>
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-400 bg-white/10 px-2 py-0.5 rounded-full">
              Live NLP
            </span>
          </div>

          <div className="space-y-3.5 flex-1 overflow-y-auto pr-1">
            {clusters.map((cluster, index) => {
              const badgeBg =
                cluster.priority === 'Critical' || cluster.priority === 'High'
                  ? 'bg-red-500/20 text-red-400'
                  : cluster.priority === 'Medium'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-green-500/20 text-green-400';

              return (
                <div
                  key={cluster.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    index === 0
                      ? 'bg-white/10 border-white/10 shadow-xs'
                      : 'bg-white/5 border-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest truncate max-w-[140px]">
                      {cluster.category}
                    </span>
                    <span className={`${badgeBg} text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0`}>
                      {cluster.reportCount} Reports
                    </span>
                  </div>
                  <h5 className="text-sm font-semibold leading-tight text-white">{cluster.title}</h5>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{cluster.summary}</p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                    <span>{cluster.building}</span>
                    <span className="text-blue-400 font-medium">{cluster.department}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleDownloadPDF}
            className="w-full mt-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
          >
            Download Detailed AI Report (PDF)
          </button>
        </div>
      </div>

      {/* AI Action Suggestions & Policy Generator */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl border border-slate-800 text-white shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/30 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-base text-white flex items-center gap-2">
                Gemini AI Action Suggestions & Strategic Policies
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full text-[10px] font-bold">
                  On-Demand AI
                </span>
              </h4>
              <p className="text-xs text-slate-400">Generate quantified administrative recommendations based on student pulse</p>
            </div>
          </div>

          <form onSubmit={handleGenerateCustomSuggestions} className="flex items-center gap-2">
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="Custom topic (e.g., Hostel HVAC, Wi-Fi 6)"
              className="px-3.5 py-1.5 bg-white/10 border border-white/10 rounded-full text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-56 font-medium"
            />
            <button
              type="submit"
              disabled={isGeneratingSuggestions}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              {isGeneratingSuggestions ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask Gemini AI</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Suggestions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(customSuggestions.length > 0 ? customSuggestions : insights?.suggestions || []).map((sug, idx) => (
            <div key={sug.id || idx} className="p-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl transition-all flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                    {sug.category || 'Strategic Recommendation'}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    sug.priority === 'High' ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {sug.priority} Priority
                  </span>
                </div>
                <h5 className="font-bold text-sm text-white mb-1.5">{sug.title}</h5>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">{sug.action}</p>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">CampusPulse AI Policy</span>
                <span className="text-[10px] text-green-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Ready to Deploy
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top 5 Campus Problems Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h4 className="font-bold text-slate-900">Gemini AI: Top 5 Campus Priority Problems</h4>
          </div>
          <span className="text-xs font-medium text-slate-500">Ranked by Student Frequency & Urgency Score</span>
        </div>

        <div className="grid grid-cols-5 gap-4">
          {(insights?.topProblems || []).map((prob, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                    #{i + 1}
                  </span>
                  <span className="text-[10px] font-bold uppercase text-slate-400 px-2 py-0.5 bg-white rounded-md border border-slate-200">
                    {prob.count} reports
                  </span>
                </div>
                <h5 className="font-semibold text-xs text-slate-900 leading-snug mb-1">{prob.title}</h5>
                <p className="text-[10px] text-slate-500">{prob.category}</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium">Impact</span>
                <span className="text-[10px] font-bold text-blue-600">{prob.impact}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
