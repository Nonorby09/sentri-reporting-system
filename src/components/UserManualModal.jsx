import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ALL_PERMISSIONS } from '../types/permissions';
import { 
  X, 
  Download, 
  BookOpen, 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Shield,
  Activity,
  Layers
} from 'lucide-react';
import { generateUserManualPDF } from '../utils/pdfGenerator';

export function UserManualModal() {
  const { 
    showUserManualModal, 
    setShowUserManualModal, 
    systemSettings, 
    locations, 
    questionSets, 
    dropdowns, 
    roles 
  } = useApp();

  const [activeSection, setActiveSection] = useState(1);

  if (!showUserManualModal) return null;

  const configSummary = {
    totalLocations: locations.length,
    totalQuestionSets: questionSets.length,
    totalCategories: dropdowns.questionCategories.length,
    totalIncidentTypes: dropdowns.incidentTypes.length,
    totalSosTypes: dropdowns.sosTypes.length,
    totalRoles: roles.length
  };

  const sections = [
    { id: 1, title: '1. Purpose & Scope' },
    { id: 2, title: '2. System Overview' },
    { id: 3, title: '3. Getting Started' },
    { id: 4, title: '4. Schedule Dashboard' },
    { id: 5, title: '5. Creating a New Audit' },
    { id: 6, title: '6. Conducting an Audit' },
    { id: 7, title: '7. Speed of Service' },
    { id: 8, title: '8. Incidents' },
    { id: 9, title: '9. Notes & Location Info' },
    { id: 10, title: '10. Audit Reports & Scoring' },
    { id: 11, title: '11. Admin: Question Fields' },
    { id: 12, title: '12. Admin: Dropdowns' },
    { id: 13, title: '13. Admin: Locations' },
    { id: 14, title: '14. Admin: Profiles & Users' },
    { id: 15, title: '15. Admin: Roles & Permissions' },
    { id: 16, title: '16. Admin: System Settings' },
    { id: 17, title: '17. Analytics Dashboard' },
    { id: 18, title: '18. Sentri Core Overview' },
    { id: 19, title: '19. Incident Reports' },
    { id: 20, title: '20. Real-Time Audit Dashboard' },
    { id: 21, title: '21. Surveillance Audit & Review' },
    { id: 22, title: '22. Sentri Shift Audits' },
    { id: 23, title: '23. System Configuration Summary' },
  ];

  const handleDownload = () => {
    generateUserManualPDF(systemSettings, configSummary);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6 h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-indigo-600 text-white shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center font-bold text-lg">
              S
            </div>
            <div>
              <h2 className="font-bold text-base tracking-tight">
                {systemSettings.systemName} — Operating Guide & Specification
              </h2>
              <p className="text-xs text-indigo-100">
                Official User Manual • Version {systemSettings.version || '1.0'} (October 6, 2026 Edition • 23 Sections)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={() => setShowUserManualModal(false)}
              className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Layout */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* TOC Sidebar */}
          <div className="w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-4 overflow-y-auto space-y-1 shrink-0 hidden md:block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 px-2">
              Table of Contents (23 Sections)
            </span>
            {sections.map(sec => (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                  activeSection === sec.id
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="truncate">{sec.title}</span>
                {activeSection === sec.id && <ChevronRight className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
              </button>
            ))}
          </div>

          {/* Main Manual Content */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-8 text-sm text-slate-700 dark:text-slate-300">
            
            {/* Section 18: Sentri Core Overview */}
            <section className="space-y-3">
              <div className="border-b border-rose-200 dark:border-rose-900/60 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Section 18</span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  18. Sentri Core Overview
                </h3>
              </div>
              <p className="text-xs leading-relaxed">
                Sentri Core is a standalone security reporting module within Sentri Remote Reporting System. It is designed for security operators and supervisors to capture, review, and close incident reports, monitor live activity on a real-time dashboard, and conduct standardized surveillance shift audits. Access to Sentri Core is controlled by a dedicated permission set.
              </p>
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs">
                <strong className="block text-rose-800 dark:text-rose-200 mb-1">Accessing Sentri Core</strong>
                <p>
                  Click the "Sentri Core" link in the top navigation bar (visible only to users with the "Sentri Core: access module" permission). The Sentri Core landing page provides entry points to three sub-areas:
                </p>
                <ul className="list-disc pl-5 mt-1 space-y-0.5 text-slate-700 dark:text-slate-300">
                  <li><strong>Real-Time Audit Reports</strong> — the list and live dashboard of incident reports.</li>
                  <li><strong>Surveillance Audit & Review</strong> — the surveillance audit schedule (My Schedule) and shift audits.</li>
                  <li><strong>Incident Report Creation</strong> — a "New Report" action available throughout the module.</li>
                </ul>
              </div>
            </section>

            {/* Section 19: Incident Reports */}
            <section className="space-y-3">
              <div className="border-b border-rose-200 dark:border-rose-900/60 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Section 19</span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  19. Incident Reports
                </h3>
              </div>
              <p className="text-xs leading-relaxed">
                Incident reports are the core record in Sentri Core. Each report captures a single security event observed during a shift, along with evidence and the action taken. Reports move through a supervisor-to-manager approval workflow.
              </p>
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4">Meaning</th>
                      <th className="py-2.5 px-4">Who Can Edit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-blue-600">Pending</td>
                      <td className="py-2.5 px-4">Newly created, not yet submitted.</td>
                      <td className="py-2.5 px-4">Creator and supervisors.</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-amber-600">In Review</td>
                      <td className="py-2.5 px-4">Submitted by creator for supervisor/manager review.</td>
                      <td className="py-2.5 px-4">Supervisors and managers.</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-emerald-600">Closed</td>
                      <td className="py-2.5 px-4">Reviewed and closed by a manager. Locked from editing.</td>
                      <td className="py-2.5 px-4">Managers with edit-closed permission can reopen.</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-slate-500">Void</td>
                      <td className="py-2.5 px-4">Cancelled / voided report.</td>
                      <td className="py-2.5 px-4">Managers only.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 20: Real-Time Audit Dashboard */}
            <section className="space-y-3">
              <div className="border-b border-rose-200 dark:border-rose-900/60 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Section 20</span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  20. Real-Time Audit Dashboard
                </h3>
              </div>
              <p className="text-xs leading-relaxed">
                The Real-Time Audit Dashboard provides a live, interactive view of all incident reports. It updates automatically as new reports are created or existing ones change status — a pulsing "Live" indicator confirms the connection is active. Features include Date-range toggles (7 days, 30 days, all time), summary cards, donut charts, reports-over-time trend lines, and bulk download.
              </p>
            </section>

            {/* Section 21 & 22: Surveillance Audit & Review & Shift Audits */}
            <section className="space-y-3">
              <div className="border-b border-rose-200 dark:border-rose-900/60 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Sections 21 & 22</span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  21 & 22. Surveillance Audit & Review & Shift Audits
                </h3>
              </div>
              <p className="text-xs leading-relaxed">
                Combines standard audits with surveillance operator shift inspections. Each shift audit records Location, Shift Date, Shift Hours, Operator name/ID, Facility Zone (Office Tower, Mall, or Parking), checklist section results, handover summary, pending items, and electronic operator signature.
              </p>
            </section>

            {/* Section 23: System Configuration Summary */}
            <section className="space-y-4">
              <div className="border-b border-indigo-200 dark:border-indigo-800 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Section 23</span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  23. Live System Configuration Summary
                </h3>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-w-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-indigo-600 text-white font-bold">
                    <tr>
                      <th className="py-2.5 px-4">Configuration Item</th>
                      <th className="py-2.5 px-4">Live System Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="py-2 px-4 font-medium">System Name</td>
                      <td className="py-2 px-4 font-bold text-slate-900 dark:text-white">{systemSettings.systemName}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 font-medium">Total Locations</td>
                      <td className="py-2 px-4 font-bold text-slate-900 dark:text-white">{configSummary.totalLocations}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 font-medium">Question Sets</td>
                      <td className="py-2 px-4 font-bold text-slate-900 dark:text-white">{configSummary.totalQuestionSets}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 font-medium">Question Categories</td>
                      <td className="py-2 px-4 font-bold text-slate-900 dark:text-white">{configSummary.totalCategories}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 font-medium">Incident Types</td>
                      <td className="py-2 px-4 font-bold text-slate-900 dark:text-white">{configSummary.totalIncidentTypes}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 font-medium">Speed of Service Types</td>
                      <td className="py-2 px-4 font-bold text-slate-900 dark:text-white">{configSummary.totalSosTypes}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 font-medium">Roles Defined</td>
                      <td className="py-2 px-4 font-bold text-slate-900 dark:text-white">{configSummary.totalRoles}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 font-medium">Total Permissions Available</td>
                      <td className="py-2 px-4 font-bold text-rose-600 dark:text-rose-400">25 (16 Standard + 9 Sentri Core)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 15: All 25 Permissions Table */}
            <section className="space-y-4">
              <div className="border-b border-indigo-200 dark:border-indigo-800 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Section 15</span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Full 25 System Permissions Reference
                </h3>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">Permission Name</th>
                      <th className="py-2.5 px-4">System Key</th>
                      <th className="py-2.5 px-4">Group</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {ALL_PERMISSIONS.map(p => (
                      <tr key={p.key} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">{p.name}</td>
                        <td className="py-2.5 px-4 font-mono text-indigo-600 dark:text-indigo-400 text-[11px]">{p.key}</td>
                        <td className="py-2.5 px-4 text-slate-500 font-semibold">{p.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

          </div>

        </div>

      </div>
    </div>
  );
}
