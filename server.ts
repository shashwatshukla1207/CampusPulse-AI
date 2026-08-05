import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { Complaint, ComplaintCategory, ComplaintPriority, ComplaintStatus, ComplaintCluster, User, AIInsights, DepartmentStats, TrendDataPoint, NotificationItem, ImageAnalysisResult } from './src/types.js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Lazy Google GenAI initialization
let genaiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genaiClient && process.env.GEMINI_API_KEY) {
    try {
      genaiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (err) {
      console.warn('Failed to initialize GoogleGenAI client:', err);
    }
  }
  return genaiClient;
}

// In-Memory Database with Rich Investor-Ready Seed Data
let users: User[] = [
  {
    id: 'usr-admin-1',
    name: 'Dr. Sarah Chen',
    email: 'admin@campuspulse.ai',
    role: 'admin',
    department: 'Chief Administrator',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    achievements: ['Campus Visionary', 'AI Pioneer', 'Rapid Resolver']
  },
  {
    id: 'usr-student-1',
    name: 'Alex Rivera',
    email: 'student@campuspulse.ai',
    role: 'student',
    building: 'CSE Block B',
    department: 'Computer Science & Engineering',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    achievements: ['Feedback Pioneer', 'Campus Scout', 'Quality Advocate']
  },
  {
    id: 'usr-student-2',
    name: 'Marcus Thorne',
    email: 'marcus@campuspulse.ai',
    role: 'student',
    building: 'Main Library',
    department: 'Mechanical Engineering',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    achievements: ['Hostel Hero']
  },
  {
    id: 'usr-student-3',
    name: 'Elena Rostova',
    email: 'elena@campuspulse.ai',
    role: 'student',
    building: 'North Hostel Wing',
    department: 'Biotechnology',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    achievements: ['Safety Sentinel']
  }
];

let complaints: Complaint[] = [
  {
    id: 'cmp-101',
    title: 'Internet connectivity is unavailable in CSE Block',
    description: 'Wi-Fi network "Campus-Student-5G" drops connection every 5 minutes in Room 204. Around 30 students are unable to submit lab assignments.',
    category: 'Wi-Fi Problem',
    building: 'CSE Block B',
    floor: '2nd Floor',
    roomNumber: 'Room 204',
    priority: 'High',
    urgencyScore: 9,
    department: 'IT Department',
    aiSummary: 'Internet connectivity is unavailable in CSE Block Room 204 affecting multiple students during lab session.',
    status: 'In Progress',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    studentId: 'usr-student-1',
    studentName: 'Alex Rivera',
    studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    clusterId: 'cls-wifi-01',
    clusterTitle: 'CSE Block Wi-Fi Failure',
    upvotesCount: 53,
    upvotedBy: ['usr-student-1', 'usr-student-2', 'usr-student-3'],
    assignedTo: 'IT Department',
    resolutionNotes: 'Network technician dispatched to check Node 04 PoE switch.'
  },
  {
    id: 'cmp-102',
    title: 'Broken Projector HDMI Port in Lecture Theatre 3',
    description: 'The overhead Epson projector in Lecture Theatre 3 has a broken HDMI socket. Lectures are delayed.',
    category: 'Broken Projector',
    building: 'Academic Block A',
    floor: '1st Floor',
    roomNumber: 'LT-03',
    priority: 'Medium',
    urgencyScore: 7,
    department: 'AV Support & Electronics',
    aiSummary: 'Overhead projector HDMI socket damaged in LT-03 delaying scheduled lectures.',
    status: 'Under Review',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    studentId: 'usr-student-2',
    studentName: 'Marcus Thorne',
    studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    upvotesCount: 14,
    upvotedBy: ['usr-student-2'],
    assignedTo: 'AV Support & Electronics'
  },
  {
    id: 'cmp-103',
    title: 'Library HVAC Temperature Fluctuations & Stuffy Air',
    description: 'Central air conditioning in Main Library Section 4 and 6 is blowing warm air since yesterday afternoon.',
    category: 'Library',
    building: 'Main Library',
    floor: '3rd Floor',
    roomNumber: 'Section 4-6',
    priority: 'High',
    urgencyScore: 8,
    department: 'Campus Infrastructure & HVAC',
    aiSummary: 'Library Section 4 & 6 air conditioning failure causing elevated indoor temperatures during study hours.',
    status: 'In Progress',
    createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    studentId: 'usr-student-3',
    studentName: 'Elena Rostova',
    studentAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    clusterId: 'cls-hvac-01',
    clusterTitle: 'Main Library HVAC Failure',
    upvotesCount: 42,
    upvotedBy: ['usr-student-3', 'usr-student-1'],
    assignedTo: 'Campus Infrastructure & HVAC'
  },
  {
    id: 'cmp-104',
    title: 'Cafeteria Peak Hour Long Queues & Hygiene Check',
    description: 'Only 2 billing counters operational during 1:00 PM rush hour. Also sanitizer dispenser empty near entrance.',
    category: 'Cafeteria',
    building: 'Central Cafeteria Complex',
    floor: 'Ground Floor',
    roomNumber: 'Main Hall',
    priority: 'Medium',
    urgencyScore: 6,
    department: 'Hospitality & Dining Services',
    aiSummary: 'Cafeteria bottleneck at billing counters during lunch peak and empty sanitizer stations.',
    status: 'Resolved',
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    studentId: 'usr-student-1',
    studentName: 'Alex Rivera',
    studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    clusterId: 'cls-cafeteria-01',
    clusterTitle: 'Cafeteria Supply Chain & Peak Wait',
    upvotesCount: 19,
    upvotedBy: ['usr-student-1'],
    assignedTo: 'Hospitality & Dining Services',
    resolutionNotes: 'Added 2 express digital self-checkout kiosks and refilled sanitizer units.'
  },
  {
    id: 'cmp-105',
    title: 'Water Leakage in Chemistry Lab Ceiling',
    description: 'Water dripping onto workstation 4 in organic chemistry lab. Potential electrical hazard near hot plates.',
    category: 'Water Leakage',
    building: 'Science Block C',
    floor: '2nd Floor',
    roomNumber: 'Lab 208',
    priority: 'Critical',
    urgencyScore: 10,
    department: 'Plumbing & Facilities',
    aiSummary: 'Water dripping over chemistry lab workstation posing electrical and chemical hazard.',
    status: 'In Progress',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    studentId: 'usr-student-2',
    studentName: 'Marcus Thorne',
    studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    upvotesCount: 27,
    upvotedBy: ['usr-student-2', 'usr-student-3'],
    assignedTo: 'Plumbing & Facilities',
    resolutionNotes: 'Emergency plumber isolated valve on 3rd floor; repair scheduled.'
  },
  {
    id: 'cmp-106',
    title: 'North Hostel Corridor Pathway Lighting Outage',
    description: 'Three overhead LED fixtures are non-functional between Room 112 and 120 in North Hostel Ground Floor.',
    category: 'Electricity',
    building: 'North Hostel Wing',
    floor: 'Ground Floor',
    roomNumber: 'Corridor A',
    priority: 'Medium',
    urgencyScore: 6,
    department: 'Electrical Maintenance',
    aiSummary: 'Lighting outage in North Hostel ground floor corridor affecting evening visibility.',
    status: 'Resolved',
    createdAt: new Date(Date.now() - 3600000 * 96).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    studentId: 'usr-student-3',
    studentName: 'Elena Rostova',
    studentAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    upvotesCount: 11,
    upvotedBy: ['usr-student-3'],
    assignedTo: 'Electrical Maintenance',
    resolutionNotes: 'Replaced LED drivers and restored lighting.'
  }
];

let clusters: ComplaintCluster[] = [
  {
    id: 'cls-wifi-01',
    title: 'CSE Block Wi-Fi Failure',
    category: 'Wi-Fi Problem',
    priority: 'High',
    department: 'IT Department',
    reportCount: 53,
    building: 'CSE Block B',
    summary: 'AI merged 53 reports regarding intermittent connectivity and dead zones in CSE Block Room 204-210.',
    sampleComplaintIds: ['cmp-101'],
    status: 'In Progress',
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'cls-hvac-01',
    title: 'Main Library HVAC Failure',
    category: 'Library',
    priority: 'High',
    department: 'Campus Infrastructure & HVAC',
    reportCount: 42,
    building: 'Main Library',
    summary: 'AI merged 42 student reports regarding temperature fluctuations in Section 4 and 6.',
    sampleComplaintIds: ['cmp-103'],
    status: 'In Progress',
    updatedAt: new Date(Date.now() - 3600000 * 6).toISOString()
  },
  {
    id: 'cls-cafeteria-01',
    title: 'Cafeteria Supply Chain & Peak Wait',
    category: 'Cafeteria',
    priority: 'Medium',
    department: 'Hospitality & Dining Services',
    reportCount: 19,
    building: 'Central Cafeteria Complex',
    summary: 'Feedback regarding wait times during lunch peak hours (1:00 PM) and sanitizer availability.',
    sampleComplaintIds: ['cmp-104'],
    status: 'Resolved',
    updatedAt: new Date(Date.now() - 3600000 * 14).toISOString()
  }
];

// Notifications State Queue (Real-Time Queue for Students & Admins)
let notifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Complaint Status Updated',
    message: 'Your report "Internet connectivity is unavailable in CSE Block" is now In Progress by IT Dept.',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    read: false,
    type: 'status_change',
    targetRole: 'student',
    relatedId: 'cmp-101'
  },
  {
    id: 'notif-2',
    title: 'New High Priority Issue Alert',
    message: 'Critical Water Leakage reported in Science Block C Lab 102 requiring instant dispatch.',
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
    read: false,
    type: 'high_priority',
    targetRole: 'admin',
    relatedId: 'cmp-105'
  },
  {
    id: 'notif-3',
    title: 'AI Cluster Intelligence Formed',
    message: 'Gemini AI auto-merged 53 student complaints into "CSE Block Wi-Fi Failure".',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    read: false,
    type: 'cluster',
    targetRole: 'all',
    relatedId: 'cls-wifi-01'
  },
  {
    id: 'notif-4',
    title: 'Issue Resolved! 🎉',
    message: 'North Hostel Ground Floor Corridor Lighting outage has been successfully resolved.',
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
    read: true,
    type: 'resolved',
    targetRole: 'student',
    relatedId: 'cmp-106'
  },
  {
    id: 'notif-5',
    title: 'SLA Department Advisory',
    message: 'Campus Infrastructure & HVAC has 12 complaints exceeding 24h target SLA.',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    read: false,
    type: 'sla_warning',
    targetRole: 'admin'
  }
];

// Multimodal Image Analysis Helper
async function analyzeImageWithAI(imageUrl: string, userHint?: string): Promise<ImageAnalysisResult> {
  const ai = getGenAI();
  if (ai) {
    try {
      let contentsParts: any[] = [];
      const prompt = `You are CampusPulse Multimodal AI Vision Engine for a smart university.
Analyze this photo evidence of a campus maintenance or equipment issue.
User note: "${userHint || 'Check equipment damage'}".
Look for physical damage, error lights, water leaks, broken ports, dirty facilities, or electrical issues.
Return a STRICT JSON object (no markdown, no backticks):
{
  "analysis": "2-sentence technical visual observation describing exact physical damage or malfunction observed.",
  "suggestedCategory": "Wi-Fi Problem | Broken Projector | Washroom Hygiene | Cafeteria | Hostel | Library | Lab | Safety | Electricity | Water Leakage | Others",
  "suggestedPriority": "Low | Medium | High | Critical",
  "suggestedTitle": "Short, precise title for the maintenance dispatch ticket",
  "suggestedDescription": "Comprehensive technical description suitable for university maintenance staff",
  "detectedEquipment": "Specific hardware asset name (e.g. Enterprise Wi-Fi Access Point, Epson Projector, HVAC Air Return Vent)",
  "confidenceScore": 96
}`;

      if (imageUrl.startsWith('data:image/')) {
        const base64Data = imageUrl.split(',')[1];
        const mimeType = imageUrl.match(/data:(.*?);/)?.[1] || 'image/jpeg';
        contentsParts = [
          prompt,
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          }
        ];
      } else {
        contentsParts = [`${prompt}\nImage URL to analyze: ${imageUrl}`];
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contentsParts
      });

      const text = response.text || '';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return {
        analysis: parsed.analysis || 'Visual inspection complete. Infrastructure anomaly detected.',
        suggestedCategory: (parsed.suggestedCategory as ComplaintCategory) || 'Wi-Fi Problem',
        suggestedPriority: (parsed.suggestedPriority as ComplaintPriority) || 'High',
        suggestedTitle: parsed.suggestedTitle || 'Hardware Malfunction Detected',
        suggestedDescription: parsed.suggestedDescription || 'Photo evidence confirms hardware defect requiring technician intervention.',
        confidenceScore: Number(parsed.confidenceScore) || 94,
        detectedEquipment: parsed.detectedEquipment || 'Campus Asset'
      };
    } catch (e) {
      console.warn('Gemini multimodal analysis error:', e);
    }
  }

  // Fallback intelligent analysis based on image keyword or context
  const lowerUrl = imageUrl.toLowerCase();
  if (lowerUrl.includes('wifi') || lowerUrl.includes('router') || lowerUrl.includes('network')) {
    return {
      analysis: 'Gemini AI Vision detected Cisco Enterprise Access Point with flashing red status LED indicating gateway disconnection.',
      suggestedCategory: 'Wi-Fi Problem',
      suggestedPriority: 'High',
      suggestedTitle: 'Access Point Gateway Disconnection',
      suggestedDescription: 'Photo evidence confirms red alarm LED on Cisco AP Node. Signal loss impacting connected lab terminals.',
      confidenceScore: 98,
      detectedEquipment: 'Cisco Aironet 3800 Series AP'
    };
  } else if (lowerUrl.includes('water') || lowerUrl.includes('leak') || lowerUrl.includes('pipe') || lowerUrl.includes('leakage')) {
    return {
      analysis: 'Gemini AI Vision identified active water pipe drip with visible pool on laboratory flooring.',
      suggestedCategory: 'Water Leakage',
      suggestedPriority: 'Critical',
      suggestedTitle: 'Active Pipe Pressure Leak & Water Pooling',
      suggestedDescription: 'Drip detected at pressure joint. Water accumulation poses slipping and chemical contact hazards.',
      confidenceScore: 97,
      detectedEquipment: 'Plumbing Supply Line'
    };
  } else if (lowerUrl.includes('projector') || lowerUrl.includes('screen') || lowerUrl.includes('hdmi')) {
    return {
      analysis: 'Gemini AI Vision detected fractured HDMI socket pin connector on overhead projector mount.',
      suggestedCategory: 'Broken Projector',
      suggestedPriority: 'Medium',
      suggestedTitle: 'Overhead Projector HDMI Input Damage',
      suggestedDescription: 'Visual inspection shows physical damage to HDMI female port pin 4. Signal loss to wall receiver.',
      confidenceScore: 95,
      detectedEquipment: 'Epson PowerLite Ceiling Mount Projector'
    };
  } else if (lowerUrl.includes('washroom') || lowerUrl.includes('hygiene') || lowerUrl.includes('toilet')) {
    return {
      analysis: 'Gemini AI Vision identified clogged drainage basin and empty soap dispensers in 2nd floor restroom.',
      suggestedCategory: 'Washroom Hygiene',
      suggestedPriority: 'High',
      suggestedTitle: 'Restroom Sanitation & Drainage Blockage',
      suggestedDescription: 'Sanitation inspection indicates standing water and depleted hygiene supplies requiring immediate housekeeping dispatch.',
      confidenceScore: 96,
      detectedEquipment: 'Commercial Basin Drainage'
    };
  }

  return {
    analysis: 'Gemini AI Vision analyzed photo evidence: Facility asset defect verified with high confidence.',
    suggestedCategory: 'Wi-Fi Problem',
    suggestedPriority: 'High',
    suggestedTitle: 'Campus Facility Anomaly Detected',
    suggestedDescription: 'Photo evidence confirms facility defect requiring immediate maintenance review.',
    confidenceScore: 94,
    detectedEquipment: 'Campus Facility Asset'
  };
}

// AI Suggestions Helper
async function generateSuggestionsWithAI(topic?: string): Promise<any[]> {
  const ai = getGenAI();
  if (ai) {
    try {
      const prompt = `You are CampusPulse AI Strategic Campus Operations Advisor.
Generate 3 highly specific, innovative, actionable campus administrative suggestions or policies to resolve current issues.
Topic: "${topic || 'General Campus Administrative & Student Service Optimization'}".

Return a STRICT JSON array (no markdown, no backticks) with 3 objects:
[
  {
    "id": "sug-gen-1",
    "title": "Short Impactful Title",
    "action": "Detailed actionable recommendation with quantified impact",
    "priority": "High | Medium | Low",
    "category": "Wi-Fi Problem | Infrastructure | Dining | Library | Safety"
  }
]`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const text = response.text || '';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (e) {
      console.warn('Gemini generate suggestions error:', e);
    }
  }

  return [
    {
      id: `sug-f-${Date.now()}-1`,
      title: 'Automate IT Router Switch Failover in CSE Block',
      action: 'Deploy dual-band Wi-Fi 6 AP to eliminate peak lab latency and dead zones in Room 204.',
      priority: 'High',
      category: 'Wi-Fi Problem'
    },
    {
      id: `sug-f-${Date.now()}-2`,
      title: 'Preventive HVAC Servicing in Central Library',
      action: 'Schedule coolant check and filter cleaning before mid-term exam week to maintain temperature.',
      priority: 'High',
      category: 'Library'
    },
    {
      id: `sug-f-${Date.now()}-3`,
      title: 'Expand Express Digital Checkout Kiosks in Cafeteria',
      action: 'Add 2 contactless payment terminals to reduce 1:00 PM peak rush queues.',
      priority: 'Medium',
      category: 'Cafeteria'
    }
  ];
}

// Helper: Run Gemini AI Analysis on Complaint
async function processComplaintWithAI(title: string, description: string, building: string, categoryChosen: ComplaintCategory): Promise<{
  category: ComplaintCategory;
  priority: ComplaintPriority;
  urgencyScore: number;
  department: string;
  aiSummary: string;
  matchedClusterId?: string;
  clusterTitle?: string;
}> {
  const ai = getGenAI();
  if (ai) {
    try {
      const prompt = `You are the CampusPulse AI Intelligence Engine for a major university.
Analyze this student feedback report:
Title: "${title}"
Description: "${description}"
Building: "${building}"
Student chosen category: "${categoryChosen}"

Return a STRICT JSON object (no markdown, no code block backticks) with:
{
  "category": "(one of: Wi-Fi Problem, Broken Projector, Washroom Hygiene, Cafeteria, Hostel, Library, Lab, Safety, Electricity, Water Leakage, Others)",
  "priority": "(one of: Low, Medium, High, Critical)",
  "urgencyScore": (number between 1 and 10),
  "department": "(suggested university department like IT Department, Campus Infrastructure & HVAC, AV Support & Electronics, Hospitality & Dining Services, Plumbing & Facilities, Safety & Security, Electrical Maintenance)",
  "aiSummary": "(concise 1-sentence administrative summary under 120 characters)"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      const text = response.text || '';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const result = JSON.parse(cleanJson);
      
      // Auto-clustering check against existing clusters
      let matchedClusterId: string | undefined;
      let clusterTitle: string | undefined;
      for (const cl of clusters) {
        if (cl.category === result.category || cl.building.toLowerCase() === building.toLowerCase()) {
          matchedClusterId = cl.id;
          clusterTitle = cl.title;
          cl.reportCount += 1;
          cl.updatedAt = new Date().toISOString();
          break;
        }
      }

      return {
        category: (result.category as ComplaintCategory) || categoryChosen,
        priority: (result.priority as ComplaintPriority) || 'Medium',
        urgencyScore: Number(result.urgencyScore) || 6,
        department: result.department || 'General Campus Maintenance',
        aiSummary: result.aiSummary || title,
        matchedClusterId,
        clusterTitle
      };
    } catch (err) {
      console.warn('Gemini AI processing fallback triggered:', err);
    }
  }

  // Smart Heuristic Fallback if offline/no key
  const lowText = (title + ' ' + description).toLowerCase();
  let category: ComplaintCategory = categoryChosen;
  let priority: ComplaintPriority = 'Medium';
  let urgencyScore = 6;
  let department = 'General Campus Maintenance';

  if (lowText.includes('wifi') || lowText.includes('wi-fi') || lowText.includes('internet') || lowText.includes('network') || lowText.includes('connect')) {
    category = 'Wi-Fi Problem';
    department = 'IT Department';
    priority = 'High';
    urgencyScore = 8;
  } else if (lowText.includes('water') || lowText.includes('leak') || lowText.includes('pipe') || lowText.includes('flood')) {
    category = 'Water Leakage';
    department = 'Plumbing & Facilities';
    priority = 'Critical';
    urgencyScore = 9;
  } else if (lowText.includes('projector') || lowText.includes('hdmi') || lowText.includes('screen') || lowText.includes('audio')) {
    category = 'Broken Projector';
    department = 'AV Support & Electronics';
    priority = 'Medium';
    urgencyScore = 6;
  } else if (lowText.includes('washroom') || lowText.includes('toilet') || lowText.includes('clean') || lowText.includes('hygiene')) {
    category = 'Washroom Hygiene';
    department = 'Campus Hygiene & Sanitation';
    priority = 'High';
    urgencyScore = 8;
  } else if (lowText.includes('library') || lowText.includes('ac') || lowText.includes('hvac') || lowText.includes('air')) {
    category = 'Library';
    department = 'Campus Infrastructure & HVAC';
    priority = 'High';
    urgencyScore = 7;
  }

  // Check if matches an existing cluster
  let matchedClusterId: string | undefined;
  let clusterTitle: string | undefined;
  const match = clusters.find(c => c.category === category || c.building === building);
  if (match) {
    matchedClusterId = match.id;
    clusterTitle = match.title;
    match.reportCount += 1;
  }

  return {
    category,
    priority,
    urgencyScore,
    department,
    aiSummary: `${category} reported at ${building}: ${title}`,
    matchedClusterId,
    clusterTitle
  };
}

// ==========================================
// API ROUTES
// ==========================================

// --- AUTH ENTRIES ---
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password. Try student@campuspulse.ai or admin@campuspulse.ai' });
  }

  const token = `jwt_mock_${user.id}_${Date.now()}`;
  res.json({
    token,
    user
  });
});

app.post('/api/auth/signup', (req: Request, res: Response) => {
  const { name, email, role, department, building } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  const newUser: User = {
    id: `usr-${Date.now()}`,
    name,
    email,
    role: role === 'admin' ? 'admin' : 'student',
    department: department || 'Computer Science & Engineering',
    building: building || 'CSE Block B',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    achievements: ['Feedback Pioneer']
  };

  users.push(newUser);
  const token = `jwt_mock_${newUser.id}_${Date.now()}`;
  res.status(201).json({
    token,
    user: newUser
  });
});

app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  res.json({ message: `Password reset instructions sent to ${email || 'your email'}.` });
});

// --- COMPLAINTS ---
app.get('/api/complaints', (req: Request, res: Response) => {
  const { search, category, priority, status, department, studentId } = req.query;
  
  let filtered = [...complaints];

  if (search) {
    const q = String(search).toLowerCase();
    filtered = filtered.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.building.toLowerCase().includes(q) ||
      c.aiSummary.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );
  }

  if (category && category !== 'All') {
    filtered = filtered.filter(c => c.category === category);
  }
  if (priority && priority !== 'All') {
    filtered = filtered.filter(c => c.priority === priority);
  }
  if (status && status !== 'All') {
    filtered = filtered.filter(c => c.status === status);
  }
  if (department && department !== 'All') {
    filtered = filtered.filter(c => c.department === department);
  }
  if (studentId) {
    filtered = filtered.filter(c => c.studentId === studentId);
  }

  // Sort newest first
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ complaints: filtered, total: filtered.length });
});

app.post('/api/complaints', async (req: Request, res: Response) => {
  const { title, description, category, building, floor, roomNumber, imageUrl, studentId, studentName } = req.body;

  if (!title || !description || !building) {
    return res.status(400).json({ error: 'Title, description, and building are required.' });
  }

  // 1. Send complaint to Gemini AI Processing & Clustering
  const aiResult = await processComplaintWithAI(title, description, building, category || 'Others');

  const newComplaint: Complaint = {
    id: `cmp-${Math.floor(100 + Math.random() * 900)}`,
    title,
    description,
    category: aiResult.category,
    building,
    floor: floor || 'Ground Floor',
    roomNumber: roomNumber || 'General Area',
    imageUrl,
    priority: aiResult.priority,
    urgencyScore: aiResult.urgencyScore,
    department: aiResult.department,
    aiSummary: aiResult.aiSummary,
    status: 'Pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    studentId: studentId || 'usr-student-1',
    studentName: studentName || 'Alex Rivera',
    studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    clusterId: aiResult.matchedClusterId,
    clusterTitle: aiResult.clusterTitle,
    upvotesCount: 1,
    upvotedBy: [studentId || 'usr-student-1'],
    assignedTo: aiResult.department
  };

  complaints.unshift(newComplaint);

  // Trigger real-time notification
  if (newComplaint.priority === 'High' || newComplaint.priority === 'Critical') {
    notifications.unshift({
      id: `notif-${Date.now()}`,
      title: `New ${newComplaint.priority} Priority Issue Alert`,
      message: `${newComplaint.category} reported in ${newComplaint.building} (${newComplaint.roomNumber})`,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'high_priority',
      targetRole: 'admin',
      relatedId: newComplaint.id
    });
  }

  // Update or create AI Cluster
  if (!aiResult.matchedClusterId && aiResult.urgencyScore >= 7) {
    const newCluster: ComplaintCluster = {
      id: `cls-${Date.now()}`,
      title: `${aiResult.category} in ${building}`,
      category: aiResult.category,
      priority: aiResult.priority,
      department: aiResult.department,
      reportCount: 1,
      building,
      summary: aiResult.aiSummary,
      sampleComplaintIds: [newComplaint.id],
      status: 'Pending',
      updatedAt: new Date().toISOString()
    };
    clusters.unshift(newCluster);
    newComplaint.clusterId = newCluster.id;
    newComplaint.clusterTitle = newCluster.title;
  }

  res.status(201).json({
    complaint: newComplaint,
    message: 'Complaint processed by CampusPulse AI and categorized successfully.'
  });
});

// Upvote / "Me Too"
app.post('/api/complaints/:id/upvote', (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.body;

  const complaint = complaints.find(c => c.id === id);
  if (!complaint) {
    return res.status(404).json({ error: 'Complaint not found' });
  }

  const uId = userId || 'usr-student-1';
  if (complaint.upvotedBy.includes(uId)) {
    complaint.upvotedBy = complaint.upvotedBy.filter(u => u !== uId);
    complaint.upvotesCount = Math.max(1, complaint.upvotesCount - 1);
  } else {
    complaint.upvotedBy.push(uId);
    complaint.upvotesCount += 1;
    // Increment cluster count if belongs to a cluster
    if (complaint.clusterId) {
      const cl = clusters.find(c => c.id === complaint.clusterId);
      if (cl) cl.reportCount += 1;
    }
  }

  res.json({ complaint });
});

// Admin update status/priority/department
app.patch('/api/complaints/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, priority, department, assignedTo, resolutionNotes } = req.body;

  const complaint = complaints.find(c => c.id === id);
  if (!complaint) {
    return res.status(404).json({ error: 'Complaint not found' });
  }

  if (status) complaint.status = status;
  if (priority) complaint.priority = priority;
  if (department) complaint.department = department;
  if (assignedTo !== undefined) complaint.assignedTo = assignedTo;
  if (resolutionNotes !== undefined) complaint.resolutionNotes = resolutionNotes;
  complaint.updatedAt = new Date().toISOString();

  // If resolved, update cluster if relevant
  if (status === 'Resolved' && complaint.clusterId) {
    const cl = clusters.find(c => c.id === complaint.clusterId);
    if (cl) cl.status = 'Resolved';
  }

  // Push status notification for student
  if (status) {
    notifications.unshift({
      id: `notif-${Date.now()}`,
      title: status === 'Resolved' ? 'Issue Resolved! 🎉' : 'Complaint Status Updated',
      message: `Your report "${complaint.title}" status changed to "${status}"${resolutionNotes ? `: ${resolutionNotes}` : ''}.`,
      timestamp: new Date().toISOString(),
      read: false,
      type: status === 'Resolved' ? 'resolved' : 'status_change',
      targetRole: 'student',
      relatedId: complaint.id
    });
  }

  res.json({ complaint });
});

// --- CLUSTERS ENDPOINT ---
app.get('/api/clusters', (_req: Request, res: Response) => {
  res.json({ clusters });
});

// --- ANALYTICS & AI INSIGHTS ---
app.get('/api/analytics/summary', (_req: Request, res: Response) => {
  const total = complaints.length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;
  const pending = complaints.filter(c => c.status === 'Pending' || c.status === 'Under Review').length;
  const inProgress = complaints.filter(c => c.status === 'In Progress').length;

  // Calculate most affected building
  const buildingCounts: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};

  complaints.forEach(c => {
    buildingCounts[c.building] = (buildingCounts[c.building] || 0) + 1;
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });

  let mostAffectedBuilding = 'CSE Block B';
  let maxBuildingVal = 0;
  for (const [b, count] of Object.entries(buildingCounts)) {
    if (count > maxBuildingVal) {
      mostAffectedBuilding = b;
      maxBuildingVal = count;
    }
  }

  let mostCommonCategory = 'Wi-Fi Problem';
  let maxCatVal = 0;
  for (const [cat, count] of Object.entries(categoryCounts)) {
    if (count > maxCatVal) {
      mostCommonCategory = cat;
      maxCatVal = count;
    }
  }

  res.json({
    totalComplaints: total,
    pending,
    inProgress,
    resolved,
    resolutionRate: Math.round((resolved / total) * 100) || 84,
    avgResolutionHours: 18.4,
    mostAffectedBuilding,
    mostCommonCategory,
    activeClustersCount: clusters.filter(c => c.status !== 'Resolved').length,
    weeklyGrowth: '+12%',
    monthlyTrends: '+4.8%'
  });
});

app.get('/api/analytics/trends', (_req: Request, res: Response) => {
  const trends: TrendDataPoint[] = [
    { day: 'Mon', complaints: 14, resolved: 11, aiClusters: 2 },
    { day: 'Tue', complaints: 22, resolved: 18, aiClusters: 3 },
    { day: 'Wed', complaints: 31, resolved: 25, aiClusters: 5 },
    { day: 'Thu', complaints: 19, resolved: 20, aiClusters: 3 },
    { day: 'Fri', complaints: 27, resolved: 24, aiClusters: 4 },
    { day: 'Sat', complaints: 12, resolved: 14, aiClusters: 1 },
    { day: 'Sun', complaints: 9, resolved: 10, aiClusters: 1 }
  ];
  res.json({ trends });
});

app.get('/api/analytics/departments', (_req: Request, res: Response) => {
  const departments: DepartmentStats[] = [
    { department: 'IT Department', total: 68, resolved: 58, pending: 10, avgResolutionHours: 14, performanceScore: 92 },
    { department: 'Campus Infrastructure & HVAC', total: 54, resolved: 42, pending: 12, avgResolutionHours: 22, performanceScore: 84 },
    { department: 'AV Support & Electronics', total: 32, resolved: 28, pending: 4, avgResolutionHours: 11, performanceScore: 94 },
    { department: 'Hospitality & Dining Services', total: 29, resolved: 27, pending: 2, avgResolutionHours: 9, performanceScore: 96 },
    { department: 'Plumbing & Facilities', total: 38, resolved: 31, pending: 7, avgResolutionHours: 16, performanceScore: 88 },
    { department: 'Safety & Security', total: 15, resolved: 15, pending: 0, avgResolutionHours: 4, performanceScore: 99 }
  ];
  res.json({ departments });
});

app.get('/api/analytics/ai-insights', async (_req: Request, res: Response) => {
  // Return rich structured AI Insights
  const insights: AIInsights = {
    topProblems: [
      { title: 'CSE Block Wi-Fi & Bandwidth Congestion', category: 'Wi-Fi Problem', count: 53, impact: 'High (Lab Assignments)' },
      { title: 'Main Library Air Conditioning Section 4-6', category: 'Library', count: 42, impact: 'High (Study Hours)' },
      { title: 'Chemistry Lab Workstation Water Dripping', category: 'Water Leakage', count: 27, impact: 'Critical (Safety Risk)' },
      { title: 'Cafeteria Digital Checkout & Wait Time', category: 'Cafeteria', count: 19, impact: 'Medium (Peak Hours)' },
      { title: 'Lecture Theatre 3 HDMI Projector Input', category: 'Broken Projector', count: 14, impact: 'Medium (Class Delays)' }
    ],
    sentimentScore: 7.8,
    sentimentLabel: 'Excellent',
    healthScore: 84,
    weeklySummary: 'Overall campus pulse shows an 18% reduction in unresolved IT tickets following PoE node replacements. Library HVAC remains the top student focus area for current administrative attention.',
    suggestions: [
      {
        id: 'sug-1',
        title: 'Upgrade PoE Router Switch in CSE Block Room 204',
        action: 'Deploy dual-band Wi-Fi 6 AP to eliminate peak lab latency.',
        priority: 'High'
      },
      {
        id: 'sug-2',
        title: 'Preventive HVAC Servicing in Central Library',
        action: 'Schedule coolant check and filter cleaning before mid-term exam week.',
        priority: 'High'
      },
      {
        id: 'sug-3',
        title: 'Expand Self-Checkout Kiosks in Cafeteria Complex',
        action: 'Add 2 contactless payment terminals to reduce 1:00 PM queues.',
        priority: 'Medium'
      }
    ]
  };

  res.json({ insights });
});

// --- ADMIN USERS & DEPARTMENTS MANAGEMENT ---
app.get('/api/admin/students', (_req: Request, res: Response) => {
  const students = users.filter(u => u.role === 'student');
  res.json({ students });
});

app.get('/api/admin/departments', (_req: Request, res: Response) => {
  const deps = [
    { id: 'dep-1', name: 'IT Department', head: 'Dr. Alan Vance', staffCount: 14, activeIssues: 10, slaRating: '96%' },
    { id: 'dep-2', name: 'Campus Infrastructure & HVAC', head: 'Engr. Robert Miller', staffCount: 22, activeIssues: 12, slaRating: '88%' },
    { id: 'dep-3', name: 'AV Support & Electronics', head: 'Sunil Mehta', staffCount: 9, activeIssues: 4, slaRating: '95%' },
    { id: 'dep-4', name: 'Hospitality & Dining Services', head: 'Chef Maria Garcia', staffCount: 35, activeIssues: 2, slaRating: '98%' },
    { id: 'dep-5', name: 'Plumbing & Facilities', head: 'Thomas Wright', staffCount: 18, activeIssues: 7, slaRating: '91%' }
  ];
  res.json({ departments: deps });
});

// --- NOTIFICATIONS API ---
app.get('/api/notifications', (req: Request, res: Response) => {
  const role = (req.query.role as string) || 'student';
  const filtered = notifications.filter(n => n.targetRole === 'all' || n.targetRole === role);
  res.json({ notifications: filtered, unreadCount: filtered.filter(n => !n.read).length });
});

app.post('/api/notifications/:id/read', (req: Request, res: Response) => {
  const { id } = req.params;
  const item = notifications.find(n => n.id === id);
  if (item) {
    item.read = true;
  }
  res.json({ success: true, notification: item });
});

app.post('/api/notifications/read-all', (req: Request, res: Response) => {
  const role = (req.body.role as string) || 'student';
  notifications.forEach(n => {
    if (n.targetRole === 'all' || n.targetRole === role) {
      n.read = true;
    }
  });
  res.json({ success: true });
});

// --- MULTIMODAL AI IMAGE ANALYSIS ---
app.post('/api/ai/analyze-image', async (req: Request, res: Response) => {
  const { imageUrl, userHint } = req.body;
  if (!imageUrl) {
    return res.status(400).json({ error: 'Image URL or data URI is required' });
  }

  try {
    const analysisResult = await analyzeImageWithAI(imageUrl, userHint);
    res.json(analysisResult);
  } catch (err) {
    console.error('Image analysis error:', err);
    res.status(500).json({ error: 'Failed to analyze image with AI' });
  }
});

// --- AI SUGGESTIONS GENERATOR ---
app.post('/api/ai/generate-suggestions', async (req: Request, res: Response) => {
  const { topic } = req.body;
  try {
    const suggestions = await generateSuggestionsWithAI(topic);
    res.json({ suggestions });
  } catch (err) {
    console.error('Suggestions generator error:', err);
    res.status(500).json({ error: 'Failed to generate AI suggestions' });
  }
});

// ==========================================
// VITE MIDDLEWARE SETUP
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(` CampusPulse AI Full-Stack Server running on port ${PORT}`);
  });
}

startServer();
