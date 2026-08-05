import React, { useState } from 'react';
import { ComplaintCategory, ImageAnalysisResult } from '../types.js';
import { createComplaintApi, analyzeImageApi } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.js';
import { 
  X, 
  Sparkles, 
  Upload, 
  Wifi, 
  Tv, 
  Droplet, 
  Utensils, 
  Home, 
  BookOpen, 
  FlaskConical, 
  ShieldAlert, 
  Zap, 
  MoreHorizontal, 
  CheckCircle2, 
  Loader2,
  Eye,
  Camera,
  Layers
} from 'lucide-react';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES: { label: ComplaintCategory; icon: React.ElementType; color: string }[] = [
  { label: 'Wi-Fi Problem', icon: Wifi, color: 'bg-blue-50 text-blue-600' },
  { label: 'Broken Projector', icon: Tv, color: 'bg-purple-50 text-purple-600' },
  { label: 'Washroom Hygiene', icon: Droplet, color: 'bg-teal-50 text-teal-600' },
  { label: 'Cafeteria', icon: Utensils, color: 'bg-amber-50 text-amber-600' },
  { label: 'Hostel', icon: Home, color: 'bg-indigo-50 text-indigo-600' },
  { label: 'Library', icon: BookOpen, color: 'bg-emerald-50 text-emerald-600' },
  { label: 'Lab', icon: FlaskConical, color: 'bg-sky-50 text-sky-600' },
  { label: 'Safety', icon: ShieldAlert, color: 'bg-red-50 text-red-600' },
  { label: 'Electricity', icon: Zap, color: 'bg-yellow-50 text-yellow-600' },
  { label: 'Water Leakage', icon: Droplet, color: 'bg-cyan-50 text-cyan-600' },
  { label: 'Others', icon: MoreHorizontal, color: 'bg-slate-50 text-slate-600' },
];

const SAMPLE_PHOTOS = [
  {
    name: 'Wi-Fi AP Router Outage',
    category: 'Wi-Fi Problem' as ComplaintCategory,
    url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Lab Water Pipe Leak',
    category: 'Water Leakage' as ComplaintCategory,
    url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Broken Classroom HDMI/Projector',
    category: 'Broken Projector' as ComplaintCategory,
    url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Restroom Hygiene & Drain',
    category: 'Washroom Hygiene' as ComplaintCategory,
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80',
  },
];

const BUILDINGS = [
  'CSE Block B',
  'Academic Block A',
  'Main Library',
  'Central Cafeteria Complex',
  'Science Block C',
  'North Hostel Wing',
  'South Hostel Wing',
  'Sports Complex & Gymnasium',
];

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('Wi-Fi Problem');
  const [building, setBuilding] = useState('CSE Block B');
  const [floor, setFloor] = useState('2nd Floor');
  const [roomNumber, setRoomNumber] = useState('Room 204');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [imageAnalysis, setImageAnalysis] = useState<ImageAnalysisResult | null>(null);

  const [aiPreview, setAiPreview] = useState<{
    summary: string;
    priority: string;
    department: string;
    clusterInfo?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImageUrl(result);
        setImageAnalysis(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectSamplePhoto = (sampleUrl: string, sampleCategory: ComplaintCategory) => {
    setImageUrl(sampleUrl);
    setCategory(sampleCategory);
    setImageAnalysis(null);
  };

  const handleRunImageAnalysis = async () => {
    if (!imageUrl) return;
    setIsAnalyzingImage(true);
    try {
      const result = await analyzeImageApi(imageUrl, title || description);
      setImageAnalysis(result);
      if (result.suggestedTitle) setTitle(result.suggestedTitle);
      if (result.suggestedDescription) setDescription(result.suggestedDescription);
      if (result.suggestedCategory) setCategory(result.suggestedCategory);
    } catch (e) {
      console.error('Image analysis failed:', e);
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await createComplaintApi({
        title,
        description,
        category,
        building,
        floor,
        roomNumber,
        imageUrl,
        studentId: user?.id || 'usr-student-1',
        studentName: user?.name || 'Alex Rivera',
      });

      setAiPreview({
        summary: res.complaint.aiSummary,
        priority: res.complaint.priority,
        department: res.complaint.department,
        clusterInfo: res.complaint.clusterTitle
          ? `Merged into AI Cluster: "${res.complaint.clusterTitle}"`
          : 'New AI Cluster Formed',
      });

      setTimeout(() => {
        setIsSubmitting(false);
        setAiPreview(null);
        setTitle('');
        setDescription('');
        setImageUrl('');
        setImageAnalysis(null);
        onSuccess();
        onClose();
      }, 1600);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              AI
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Report Campus Issue</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Gemini AI categorizes, prioritizes, and merges similar reports</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Category Picker Grid */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Select Category
            </label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.slice(0, 8).map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.label;
                return (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => setCategory(cat.label)}
                    className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-2xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                    <span className="truncate w-full text-center">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title input */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Issue Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Wi-Fi network Campus-Student-5G drops in Room 204"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Detailed Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context on frequency, number of students affected, etc..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
            />
          </div>

          {/* Building, Floor, Room Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Building
              </label>
              <select
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none"
              >
                {BUILDINGS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Floor
              </label>
              <input
                type="text"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                placeholder="e.g. 2nd Floor"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Room Number
              </label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="e.g. Room 204"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none"
              />
            </div>
          </div>

          {/* Image Upload & AI Multimodal Vision Analysis */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Photo Evidence & Gemini Vision AI
              </label>
              <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Multimodal Vision Ready
              </span>
            </div>

            {/* Quick Sample Photo Presets */}
            <div>
              <p className="text-[11px] text-slate-400 font-medium mb-1.5">Quick Test Evidence Samples:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SAMPLE_PHOTOS.map((sample) => (
                  <button
                    key={sample.name}
                    type="button"
                    onClick={() => handleSelectSamplePhoto(sample.url, sample.category)}
                    className={`p-1.5 border rounded-xl flex items-center gap-2 text-left transition-all ${
                      imageUrl === sample.url
                        ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-500/20'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <img src={sample.url} alt={sample.name} className="w-8 h-8 rounded-lg object-cover" />
                    <span className="text-[10px] font-semibold text-slate-700 leading-tight truncate">
                      {sample.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Upload Box */}
            <label className="border-2 border-dashed border-slate-200 hover:border-purple-400 rounded-2xl p-3 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50">
              <Upload className="w-5 h-5 text-slate-400 mb-1" />
              <span className="text-xs font-semibold text-slate-600">Upload your own photo evidence</span>
              <span className="text-[10px] text-slate-400">Supports PNG, JPG, WEBP (Base64 / File)</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>

            {/* Preview & Gemini Vision Trigger */}
            {imageUrl && (
              <div className="p-3 bg-purple-50/40 border border-purple-200/60 rounded-2xl space-y-3">
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0">
                    <img src={imageUrl} alt="preview" className="h-20 w-28 object-cover rounded-xl border border-purple-200 shadow-xs" />
                    {isAnalyzingImage && (
                      <div className="absolute inset-0 bg-purple-900/40 rounded-xl flex items-center justify-center">
                        <span className="w-full h-1 bg-purple-400 shadow-sm animate-pulse"></span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setImageUrl('');
                        setImageAnalysis(null);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs shadow-xs hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                      <Camera className="w-3.5 h-3.5 text-purple-600" />
                      Photo Evidence Ready
                    </h5>
                    <p className="text-[11px] text-slate-500 mb-2">
                      Run Gemini AI Vision to inspect physical defects and auto-populate title, category, and technical details.
                    </p>

                    <button
                      type="button"
                      onClick={handleRunImageAnalysis}
                      disabled={isAnalyzingImage}
                      className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
                    >
                      {isAnalyzingImage ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Gemini Vision Scanning...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Analyze Photo with Gemini AI Vision</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* AI Vision Results Display */}
                {imageAnalysis && (
                  <div className="p-3.5 bg-white rounded-xl border border-purple-200 shadow-xs text-xs space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                      <span className="font-bold text-purple-900 flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-purple-600" />
                        Gemini AI Vision Assessment
                      </span>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 font-bold rounded-full text-[10px]">
                        {imageAnalysis.confidenceScore}% Confidence
                      </span>
                    </div>

                    <p className="text-slate-700 leading-relaxed font-medium">
                      "{imageAnalysis.analysis}"
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-slate-50 p-2 rounded-lg">
                        <span className="text-slate-400 block font-bold text-[9px] uppercase">Detected Asset</span>
                        <span className="font-semibold text-slate-800">{imageAnalysis.detectedEquipment || 'Campus Infrastructure'}</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg">
                        <span className="text-slate-400 block font-bold text-[9px] uppercase">Suggested Priority</span>
                        <span className="font-bold text-red-600">{imageAnalysis.suggestedPriority}</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-purple-600 font-bold">
                      ✓ Auto-populated title, description, and category based on visual evidence.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AI Live Categorization Preview Note */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
            <p className="text-xs text-blue-800 leading-relaxed">
              <span className="font-bold">AI Auto-Clustering active:</span> If multiple students report this issue, Gemini AI merges them into a single high-priority administrative ticket.
            </p>
          </div>

          {/* AI Result Card overlay when submitted */}
          {aiPreview && (
            <div className="p-4 bg-slate-900 text-white rounded-2xl animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Processed by Gemini AI
                </span>
                <span className="px-2 py-0.5 bg-blue-600/30 text-blue-300 rounded-full text-[10px] font-bold">
                  {aiPreview.priority} Priority
                </span>
              </div>
              <p className="text-sm font-semibold mb-1">{aiPreview.summary}</p>
              <p className="text-xs text-slate-400 mb-1">Routed to: <span className="text-white font-medium">{aiPreview.department}</span></p>
              <p className="text-xs text-green-400 font-bold">{aiPreview.clusterInfo}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI Analyzing & Clustering...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Submit to CampusPulse AI</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
