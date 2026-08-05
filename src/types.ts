export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  building?: string;
  avatar?: string;
  achievements?: string[];
}

export type ComplaintCategory =
  | 'Wi-Fi Problem'
  | 'Broken Projector'
  | 'Washroom Hygiene'
  | 'Cafeteria'
  | 'Hostel'
  | 'Library'
  | 'Lab'
  | 'Safety'
  | 'Electricity'
  | 'Water Leakage'
  | 'Others';

export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type ComplaintStatus = 'Pending' | 'Under Review' | 'In Progress' | 'Resolved';

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  building: string;
  floor: string;
  roomNumber: string;
  imageUrl?: string;
  priority: ComplaintPriority;
  urgencyScore: number; // 1 to 10
  department: string;
  aiSummary: string;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  clusterId?: string;
  clusterTitle?: string;
  upvotesCount: number;
  upvotedBy: string[]; // user IDs
  assignedTo?: string;
  resolutionNotes?: string;
}

export interface ComplaintCluster {
  id: string;
  title: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  department: string;
  reportCount: number;
  building: string;
  summary: string;
  sampleComplaintIds: string[];
  status: ComplaintStatus;
  updatedAt: string;
}

export interface AIInsights {
  topProblems: { title: string; category: string; count: number; impact: string }[];
  sentimentScore: number; // e.g. 7.8 out of 10
  sentimentLabel: 'Excellent' | 'Good' | 'Needs Attention' | 'Critical';
  weeklySummary: string;
  suggestions: { id: string; title: string; action: string; priority: 'High' | 'Medium' | 'Low' }[];
  healthScore: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'resolved' | 'high_priority' | 'cluster' | 'status_change' | 'sla_warning' | 'ai_insight';
  targetRole: 'all' | 'student' | 'admin';
  relatedId?: string;
}

export interface ImageAnalysisResult {
  analysis: string;
  suggestedCategory: ComplaintCategory;
  suggestedPriority: ComplaintPriority;
  suggestedTitle: string;
  suggestedDescription: string;
  confidenceScore: number;
  detectedEquipment?: string;
}

export interface DepartmentStats {
  department: string;
  total: number;
  resolved: number;
  pending: number;
  avgResolutionHours: number;
  performanceScore: number;
}

export interface TrendDataPoint {
  day: string;
  complaints: number;
  resolved: number;
  aiClusters: number;
}
