import { Complaint } from '../types.js';

/**
 * Generates and downloads a detailed, formatted Progress & Audit Report for a single complaint.
 */
export function downloadComplaintProgressReport(complaint: Complaint) {
  const generatedAt = new Date().toLocaleString();
  const reportId = `CP-RPT-${complaint.id.toUpperCase()}-${Date.now().toString().slice(-4)}`;

  const content = `================================================================================
CAMPUSPULSE AI - OFFICIAL COMPLAINT PROGRESS & RESOLUTION AUDIT REPORT
================================================================================
Report Reference ID : ${reportId}
Generated Date/Time : ${generatedAt}
System Domain       : Campus Infrastructure & Student Welfare Operations

--------------------------------------------------------------------------------
1. TICKET IDENTIFICATION & GENERAL INFORMATION
--------------------------------------------------------------------------------
Complaint ID        : ${complaint.id}
Title               : ${complaint.title}
Category            : ${complaint.category}
Current Status      : [ ${complaint.status.toUpperCase()} ]
Priority Level      : ${complaint.priority}
Community Upvotes   : ${complaint.upvotesCount} ("Me Too" confirmations)
Date Submitted      : ${new Date(complaint.createdAt).toLocaleString()}

--------------------------------------------------------------------------------
2. LOCATION & ASSIGNED DEPARTMENT
--------------------------------------------------------------------------------
Campus Building     : ${complaint.building}
Floor Level         : ${complaint.floor}
Room / Facility     : ${complaint.roomNumber}
Assigned Department : ${complaint.department}

--------------------------------------------------------------------------------
3. STUDENT SUBMISSION DETAILS
--------------------------------------------------------------------------------
Student Name        : ${complaint.studentName}
Student ID          : ${complaint.studentId}
Student Statement   : ${complaint.description}
Photo Evidence Link : ${complaint.imageUrl || 'No photo evidence attached'}

--------------------------------------------------------------------------------
4. GEMINI AI INTELLIGENCE & AUTO-ANALYSIS
--------------------------------------------------------------------------------
Gemini Urgency Score : ${complaint.urgencyScore} / 10
AI Category Match    : ${complaint.category}
AI Executive Summary : ${complaint.aiSummary}
Associated Cluster   : ${complaint.clusterTitle || 'Independent Issue'}

--------------------------------------------------------------------------------
5. RESOLUTION PROGRESS & AUDIT TIMELINE
--------------------------------------------------------------------------------
Stage 1: PENDING            - Ticket generated and logged into CampusPulse database
Stage 2: UNDER REVIEW       - Auto-triaged by Gemini AI & dispatched to ${complaint.department}
Stage 3: IN PROGRESS        - Technical staff assigned to ${complaint.building}
Stage 4: RESOLVED           - Status: ${complaint.status}

Administrative Resolution Notes:
${complaint.resolutionNotes || 'In Progress: Assigned department is working on this facility request.'}

================================================================================
CampusPulse AI Smart University Administrative Operations
End of Report - Document Verified
================================================================================`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Progress_Report_${complaint.id}_${complaint.status}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a bulk audit report for multiple complaints.
 */
export function downloadBulkComplaintsReport(complaints: Complaint[], customTitle = 'Campus Master Complaint Audit') {
  const generatedAt = new Date().toLocaleString();

  let body = `================================================================================
CAMPUSPULSE AI - ${customTitle.toUpperCase()}
================================================================================
Generated Date/Time : ${generatedAt}
Total Records       : ${complaints.length}
================================================================================\n\n`;

  complaints.forEach((c, idx) => {
    body += `--------------------------------------------------------------------------------
RECORD #${idx + 1} | ID: ${c.id} | Status: ${c.status} | Priority: ${c.priority}
--------------------------------------------------------------------------------
Title      : ${c.title}
Category   : ${c.category} | Department: ${c.department}
Location   : ${c.building} (${c.roomNumber})
Submitted  : ${new Date(c.createdAt).toLocaleDateString()}
AI Summary : ${c.aiSummary}
Notes      : ${c.resolutionNotes || 'N/A'}\n\n`;
  });

  body += `================================================================================
End of Bulk Progress Audit Report
================================================================================`;

  const blob = new Blob([body], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Full_Campus_Progress_Report_${Date.now()}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
