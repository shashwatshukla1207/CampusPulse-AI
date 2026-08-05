import { User, Complaint, ComplaintCluster, AIInsights, DepartmentStats, TrendDataPoint, ComplaintCategory, NotificationItem, ImageAnalysisResult } from '../types.js';

const BASE_URL = ''; // Same origin full-stack server

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('campuspulse_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function loginApi(email: string, password?: string): Promise<{ token: string; user: User }> {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  } catch (err) {
    console.warn('Backend login fallback triggered:', err);
    // Offline fallback for smooth demo experience
    const mockUser: User = email.toLowerCase().includes('admin')
      ? {
          id: 'usr-admin-1',
          name: 'Dr. Sarah Chen',
          email: 'admin@campuspulse.ai',
          role: 'admin',
          department: 'Chief Administrator',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
          achievements: ['Campus Visionary', 'AI Pioneer', 'Rapid Resolver']
        }
      : {
          id: 'usr-student-1',
          name: 'Alex Rivera',
          email: 'student@campuspulse.ai',
          role: 'student',
          building: 'CSE Block B',
          department: 'Computer Science & Engineering',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          achievements: ['Feedback Pioneer', 'Campus Scout', 'Quality Advocate']
        };
    return { token: 'mock_token', user: mockUser };
  }
}

export async function fetchComplaints(params?: {
  search?: string;
  category?: string;
  priority?: string;
  status?: string;
  department?: string;
  studentId?: string;
}): Promise<Complaint[]> {
  const query = new URLSearchParams();
  if (params?.search) query.append('search', params.search);
  if (params?.category) query.append('category', params.category);
  if (params?.priority) query.append('priority', params.priority);
  if (params?.status) query.append('status', params.status);
  if (params?.department) query.append('department', params.department);
  if (params?.studentId) query.append('studentId', params.studentId);

  try {
    const res = await fetch(`${BASE_URL}/api/complaints?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load complaints');
    const data = await res.json();
    return data.complaints;
  } catch (e) {
    console.error('fetchComplaints error:', e);
    return [];
  }
}

export async function createComplaintApi(data: {
  title: string;
  description: string;
  category: ComplaintCategory;
  building: string;
  floor: string;
  roomNumber: string;
  imageUrl?: string;
  studentId: string;
  studentName: string;
}): Promise<{ complaint: Complaint; message: string }> {
  const res = await fetch(`${BASE_URL}/api/complaints`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to submit complaint');
  }
  return res.json();
}

export async function upvoteComplaintApi(id: string, userId: string): Promise<{ complaint: Complaint }> {
  const res = await fetch(`${BASE_URL}/api/complaints/${id}/upvote`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error('Failed to upvote');
  return res.json();
}

export async function updateComplaintStatusApi(id: string, updates: Partial<Complaint>): Promise<{ complaint: Complaint }> {
  const res = await fetch(`${BASE_URL}/api/complaints/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update complaint');
  return res.json();
}

export async function fetchClusters(): Promise<ComplaintCluster[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/clusters`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch clusters');
    const data = await res.json();
    return data.clusters;
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function fetchAnalyticsSummary() {
  const res = await fetch(`${BASE_URL}/api/analytics/summary`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function fetchAnalyticsTrends(): Promise<TrendDataPoint[]> {
  const res = await fetch(`${BASE_URL}/api/analytics/trends`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  return data.trends;
}

export async function fetchDepartmentStats(): Promise<DepartmentStats[]> {
  const res = await fetch(`${BASE_URL}/api/analytics/departments`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  return data.departments;
}

export async function fetchAIInsights(): Promise<AIInsights> {
  const res = await fetch(`${BASE_URL}/api/analytics/ai-insights`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  return data.insights;
}

export async function fetchAdminStudents(): Promise<User[]> {
  const res = await fetch(`${BASE_URL}/api/admin/students`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  return data.students;
}

export async function fetchAdminDepartments() {
  const res = await fetch(`${BASE_URL}/api/admin/departments`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  return data.departments;
}

export async function fetchNotifications(role: string): Promise<{ notifications: NotificationItem[]; unreadCount: number }> {
  try {
    const res = await fetch(`${BASE_URL}/api/notifications?role=${role}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  } catch (e) {
    console.error('fetchNotifications error:', e);
    return { notifications: [], unreadCount: 0 };
  }
}

export async function markNotificationReadApi(id: string): Promise<void> {
  await fetch(`${BASE_URL}/api/notifications/${id}/read`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
}

export async function markAllNotificationsReadApi(role: string): Promise<void> {
  await fetch(`${BASE_URL}/api/notifications/read-all`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ role }),
  });
}

export async function analyzeImageApi(imageUrl: string, userHint?: string): Promise<ImageAnalysisResult> {
  const res = await fetch(`${BASE_URL}/api/ai/analyze-image`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ imageUrl, userHint }),
  });
  if (!res.ok) throw new Error('Failed to analyze image with AI');
  return res.json();
}

export async function generateSuggestionsApi(topic?: string): Promise<{ id: string; title: string; action: string; priority: string; category?: string }[]> {
  const res = await fetch(`${BASE_URL}/api/ai/generate-suggestions`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ topic }),
  });
  if (!res.ok) throw new Error('Failed to generate suggestions');
  const data = await res.json();
  return data.suggestions;
}
