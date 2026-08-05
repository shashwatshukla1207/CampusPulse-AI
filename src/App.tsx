import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { ThemeProvider } from './context/ThemeContext.js';
import { Sidebar } from './components/Sidebar.js';
import { Header } from './components/Header.js';
import { ReportIssueModal } from './components/ReportIssueModal.js';
import { AdminInsightsView } from './components/AdminInsightsView.js';
import { IntelligenceFeedView } from './components/IntelligenceFeedView.js';
import { DepartmentAnalyticsView } from './components/DepartmentAnalyticsView.js';
import { StudentDatabaseView } from './components/StudentDatabaseView.js';
import { StudentHomeView } from './components/StudentHomeView.js';
import { MyComplaintsView } from './components/MyComplaintsView.js';
import { CampusFeedView } from './components/CampusFeedView.js';
import { ProfileView } from './components/ProfileView.js';
import { SettingsView } from './components/SettingsView.js';

function MainAppContent() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [activeTab, setActiveTab] = useState<string>(isAdmin ? 'admin-insights' : 'student-home');
  const [searchQuery, setSearchQuery] = useState('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // If role switches, adapt default tab
  React.useEffect(() => {
    if (isAdmin && (activeTab === 'student-home' || activeTab === 'my-complaints')) {
      setActiveTab('admin-insights');
    } else if (!isAdmin && (activeTab === 'admin-insights' || activeTab === 'intelligence-feed')) {
      setActiveTab('student-home');
    }
  }, [isAdmin]);

  const renderActiveView = () => {
    switch (activeTab) {
      // Admin Views
      case 'admin-insights':
        return <AdminInsightsView />;
      case 'intelligence-feed':
        return <IntelligenceFeedView searchQuery={searchQuery} />;
      case 'department-analytics':
        return <DepartmentAnalyticsView />;
      case 'student-database':
        return <StudentDatabaseView />;

      // Student Views
      case 'student-home':
        return (
          <StudentHomeView
            onOpenReportModal={() => setIsReportModalOpen(true)}
            setActiveTab={setActiveTab}
          />
        );
      case 'my-complaints':
        return <MyComplaintsView onOpenReportModal={() => setIsReportModalOpen(true)} />;
      case 'campus-feed':
        return <CampusFeedView onOpenReportModal={() => setIsReportModalOpen(true)} />;

      // Common Views
      case 'profile':
        return <ProfileView />;
      case 'settings':
        return <SettingsView />;

      default:
        return isAdmin ? <AdminInsightsView /> : <StudentHomeView onOpenReportModal={() => setIsReportModalOpen(true)} setActiveTab={setActiveTab} />;
    }
  };

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'admin-insights':
        return 'Admin Insights & Executive Dashboard';
      case 'intelligence-feed':
        return 'Intelligence Feed & Report Processing';
      case 'department-analytics':
        return 'Department Performance & SLA Analytics';
      case 'student-database':
        return 'Student Directory & Feedback Reporters';
      case 'student-home':
        return 'Student Dashboard Home';
      case 'my-complaints':
        return 'My Complaints & Resolution Tracker';
      case 'campus-feed':
        return 'Live Campus Feedback Feed';
      case 'profile':
        return 'My Profile';
      case 'settings':
        return 'Platform Settings';
      default:
        return 'CampusPulse AI';
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 overflow-hidden transition-colors">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReportModal={() => setIsReportModalOpen(true)}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <Header
          title={getHeaderTitle()}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenReportModal={() => setIsReportModalOpen(true)}
        />

        {/* View Workspace Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {renderActiveView()}
        </main>
      </div>

      {/* Report Issue Modal */}
      <ReportIssueModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSuccess={() => {
          // Trigger refresh if needed
        }}
      />
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

