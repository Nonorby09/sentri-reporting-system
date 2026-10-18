import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { AuditForm } from './components/AuditForm';
import { AdminView } from './components/AdminView';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { SentriCoreView } from './components/SentriCore/SentriCoreView';
import { NewAuditModal } from './components/NewAuditModal';
import { AuditReportModal } from './components/AuditReportModal';
import { SendSummaryModal } from './components/SendSummaryModal';
import { UserManualModal } from './components/UserManualModal';
import { IncidentReportModal } from './components/SentriCore/IncidentReportModal';
import { ShiftAuditModal } from './components/SentriCore/ShiftAuditModal';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react';

// ─── Toast Notification ───────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  const styles = {
    error:   'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-900',
    warning: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-900',
    info:    'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-900',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-900',
  };
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
      <div className={`px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-3 text-xs font-semibold border ${styles[toast.type] || styles.success}`}>
        {toast.type === 'error'   && <XCircle       className="w-4 h-4 text-rose-500 shrink-0" />}
        {toast.type === 'warning' && <AlertTriangle  className="w-4 h-4 text-amber-500 shrink-0" />}
        {toast.type === 'info'    && <Info           className="w-4 h-4 text-blue-500 shrink-0" />}
        {toast.type === 'success' && <CheckCircle2   className="w-4 h-4 text-emerald-500 shrink-0" />}
        <span>{toast.message}</span>
      </div>
    </div>
  );
}

// ─── Authenticated Main Content ───────────────────────────────────────────────
function MainContent() {
  const { currentView, toast } = useApp();
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />
      <Toast toast={toast} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'dashboard'   && <Dashboard />}
        {currentView === 'audit'       && <AuditForm />}
        {currentView === 'sentri_core' && <SentriCoreView />}
        {currentView === 'analytics'   && <AnalyticsDashboard />}
        {currentView === 'admin'       && <AdminView />}
      </main>

      {/* Persistent Modals */}
      <NewAuditModal />
      <AuditReportModal />
      <SendSummaryModal />
      <UserManualModal />
      <IncidentReportModal />
      <ShiftAuditModal />

      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>Sentri Remote Reporting System &amp; Sentri Core • Version 1.0 (October 6, 2026 Edition)</p>
          <p className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Security &amp; Role-Based Access Control Active (25 System Permissions)</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

// ─── Auth Gate ────────────────────────────────────────────────────────────────
function AuthGate() {
  const { isAuthenticated, authView, toast } = useApp();

  if (!isAuthenticated) {
    return (
      <>
        {authView === 'register' ? <RegisterPage /> : <LoginPage />}
        {/* Toast is available on auth pages too */}
        <Toast toast={toast} />
      </>
    );
  }

  return <MainContent />;
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AppProvider>
      <AuthGate />
    </AppProvider>
  );
}
