import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  Activity, 
  Plus, 
  Download, 
  Filter, 
  Calendar, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  PieChart as PieIcon, 
  BarChart3, 
  TrendingUp, 
  RotateCcw, 
  Search, 
  Eye, 
  FileText, 
  Paperclip, 
  X,
  Play,
  ClipboardList,
  Camera,
  Layers,
  Sparkles,
  Archive
} from 'lucide-react';
import { generateIncidentReportPDF, generateShiftAuditPDF } from '../../utils/pdfGenerator';

export function SentriCoreView() {
  const { 
    incidentReports, 
    shiftAudits, 
    audits, 
    questionSets, 
    startOrResumeAudit, 
    setShowNewAuditModal, 
    hasPermission, 
    setShowIncidentReportModal, 
    setActiveIncidentReportId, 
    setShowShiftAuditModal, 
    setActiveShiftAuditId,
    systemSettings,
    showToast 
  } = useApp();

  // Primary Sentri Core Sub-area: 'dashboard' | 'incidents' | 'surveillance'
  const [activeSubArea, setActiveSubArea] = useState('dashboard');

  // Surveillance sub-tabs: 'schedule' | 'shift_audits'
  const [surveillanceTab, setSurveillanceTab] = useState('schedule');

  // Real-Time Dashboard Filters (Section 20)
  const [dateRange, setDateRange] = useState('all'); // '7d' | '30d' | 'all'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'Pending' | 'In Review' | 'Closed' | 'Void'
  const [riskFilter, setRiskFilter] = useState('all'); // 'all' | 'High' | 'Medium' | 'Low'
  const [searchQuery, setSearchQuery] = useState('');

  // Embedded Schedule Filters (Section 21)
  const [scheduleQuickFilter, setScheduleQuickFilter] = useState('all'); // 'all' | 'due_today' | 'overdue' | 'sent'

  // Permissions
  const canViewDashboard = hasPermission('view_sentri_dashboard');
  const canCreateIncident = hasPermission('create_incident_report');
  const canCreateShiftAudit = hasPermission('create_sentri_audit');
  const canDownloadReports = hasPermission('download_sentri_report');

  // Filtered Incident Reports
  const filteredReports = useMemo(() => {
    return incidentReports.filter(rep => {
      // Date range filter
      if (dateRange !== 'all') {
        const repDate = new Date(rep.creationDate);
        const now = new Date();
        const diffDays = Math.ceil((now - repDate) / (1000 * 60 * 60 * 24));
        if (dateRange === '7d' && diffDays > 7) return false;
        if (dateRange === '30d' && diffDays > 30) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && rep.status !== statusFilter) return false;

      // Risk filter
      if (riskFilter !== 'all' && rep.riskLevel !== riskFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = 
          rep.synopsisNumber?.toLowerCase().includes(q) ||
          rep.incidentTitle?.toLowerCase().includes(q) ||
          rep.locationName?.toLowerCase().includes(q) ||
          rep.reportedBy?.toLowerCase().includes(q) ||
          rep.narrative?.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [incidentReports, dateRange, statusFilter, riskFilter, searchQuery]);

  // Dashboard Summary Metrics (Section 20)
  const summaryCounts = useMemo(() => {
    const total = incidentReports.length;
    const pending = incidentReports.filter(r => r.status === 'Pending').length;
    const inReview = incidentReports.filter(r => r.status === 'In Review').length;
    const closed = incidentReports.filter(r => r.status === 'Closed').length;
    const voidCount = incidentReports.filter(r => r.status === 'Void').length;

    // By risk
    const highRisk = incidentReports.filter(r => r.riskLevel === 'High').length;
    const mediumRisk = incidentReports.filter(r => r.riskLevel === 'Medium').length;
    const lowRisk = incidentReports.filter(r => r.riskLevel === 'Low').length;

    return { total, pending, inReview, closed, voidCount, highRisk, mediumRisk, lowRisk };
  }, [incidentReports]);

  // Bulk download filtered reports as PDFs
  const handleBulkDownload = () => {
    if (!canDownloadReports) {
      showToast('Permission denied: Requires download reports permission', 'error');
      return;
    }
    if (filteredReports.length === 0) {
      showToast('No reports to download', 'info');
      return;
    }
    filteredReports.forEach((rep, idx) => {
      setTimeout(() => {
        generateIncidentReportPDF(rep, systemSettings);
      }, idx * 300);
    });
    showToast(`Initiated bulk download of ${filteredReports.length} PDF reports`, 'success');
  };

  // Embedded Schedule Audits (Section 21)
  const filteredScheduleAudits = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return audits.filter(a => {
      if (scheduleQuickFilter === 'due_today') {
        return a.scheduledDate === today && a.status !== 'Sent';
      }
      if (scheduleQuickFilter === 'overdue') {
        return a.scheduledDate < today && a.status !== 'Sent';
      }
      if (scheduleQuickFilter === 'sent') {
        return a.status === 'Sent';
      }
      return true;
    });
  }, [audits, scheduleQuickFilter]);

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Module Title & Pulsing Live Connection Indicator (Section 18 & 20) */}
      <div className="bg-gradient-to-r from-rose-950/80 via-slate-900 to-slate-900 rounded-3xl p-6 border border-rose-900/40 shadow-xl text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1.5">
            <div className="p-2 rounded-xl bg-rose-600 text-white shadow-md shadow-rose-600/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Sentri Core Security Module
            </h1>
            {/* Pulsing Live indicator (Section 20) */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-[11px] font-bold text-rose-300">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              <span>LIVE</span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Real-time incident reporting, supervisor approval workflows, surveillance shift audits, and live event telemetry.
          </p>
        </div>

        {/* Global Action: New Report (Section 18 & 19) */}
        <div className="flex items-center space-x-2">
          {canCreateIncident && (
            <button
              onClick={() => {
                setActiveIncidentReportId(null);
                setShowIncidentReportModal(true);
              }}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Incident Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Sentri Core Navigation Sub-tabs (Section 18) */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubArea('dashboard')}
          className={`flex items-center space-x-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeSubArea === 'dashboard'
              ? 'border-rose-600 text-rose-600 dark:text-rose-400 dark:border-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Real-Time Audit Dashboard</span>
        </button>

        <button
          onClick={() => setActiveSubArea('incidents')}
          className={`flex items-center space-x-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeSubArea === 'incidents'
              ? 'border-rose-600 text-rose-600 dark:text-rose-400 dark:border-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Incident Reports ({incidentReports.length})</span>
        </button>

        <button
          onClick={() => setActiveSubArea('surveillance')}
          className={`flex items-center space-x-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeSubArea === 'surveillance'
              ? 'border-rose-600 text-rose-600 dark:text-rose-400 dark:border-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Surveillance Audit & Review</span>
        </button>
      </div>

      {/* SUB-AREA 1: REAL-TIME AUDIT DASHBOARD (Section 20) */}
      {activeSubArea === 'dashboard' && canViewDashboard && (
        <div className="space-y-6">
          
          {/* Top Controls: Date Range Toggle & Bulk Download */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            
            {/* Date-range toggle (7 days, 30 days, All time) */}
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              {[
                { id: '7d', label: 'Last 7 Days' },
                { id: '30d', label: 'Last 30 Days' },
                { id: 'all', label: 'All Time' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setDateRange(t.id)}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    dateRange === t.id
                      ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Bulk Download & Active Filters summary */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBulkDownload}
                disabled={!canDownloadReports}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  canDownloadReports
                    ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                    : 'opacity-50 cursor-not-allowed'
                }`}
                title="Bulk export filtered incident reports as individual PDFs"
              >
                <Download className="w-3.5 h-3.5 text-rose-500" />
                <span>Bulk Download ({filteredReports.length} Reports)</span>
              </button>
            </div>
          </div>

          {/* Interactive Summary KPI Cards: Click any card to filter! (Section 20) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { id: 'all', label: 'Total Reports', count: summaryCounts.total, color: 'text-slate-900 dark:text-white', border: 'border-slate-200 dark:border-slate-800' },
              { id: 'Pending', label: 'Pending', count: summaryCounts.pending, color: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-900/50' },
              { id: 'In Review', label: 'In Review', count: summaryCounts.inReview, color: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-900/50' },
              { id: 'Closed', label: 'Closed', count: summaryCounts.closed, color: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-900/50' },
              { id: 'Void', label: 'Void', count: summaryCounts.voidCount, color: 'text-slate-400', border: 'border-slate-200 dark:border-slate-800' }
            ].map(c => (
              <button
                key={c.id}
                onClick={() => setStatusFilter(statusFilter === c.id ? 'all' : c.id)}
                className={`p-4 rounded-2xl border text-left bg-white dark:bg-slate-900 shadow-sm transition-all hover:scale-102 ${c.border} ${
                  statusFilter === c.id ? 'ring-2 ring-rose-500 shadow-md' : ''
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  {c.label}
                </span>
                <span className={`text-2xl font-black mt-1 block ${c.color}`}>
                  {c.count}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">Click to filter</span>
              </button>
            ))}
          </div>

          {/* Active Filter Chips (Section 20) */}
          {(statusFilter !== 'all' || riskFilter !== 'all' || searchQuery || dateRange !== 'all') && (
            <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-xs">
              <span className="font-bold text-slate-500">Active Filters:</span>
              {statusFilter !== 'all' && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold">
                  <span>Status: {statusFilter}</span>
                  <button onClick={() => setStatusFilter('all')} className="text-slate-400 hover:text-rose-500"><X className="w-3 h-3" /></button>
                </span>
              )}
              {riskFilter !== 'all' && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold">
                  <span>Risk: {riskFilter}</span>
                  <button onClick={() => setRiskFilter('all')} className="text-slate-400 hover:text-rose-500"><X className="w-3 h-3" /></button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold">
                  <span>Search: "{searchQuery}"</span>
                  <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-rose-500"><X className="w-3 h-3" /></button>
                </span>
              )}
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setRiskFilter('all');
                  setSearchQuery('');
                  setDateRange('all');
                }}
                className="text-xs text-rose-600 dark:text-rose-400 font-bold hover:underline ml-2"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Charts Row: Status Donut Chart & Risk Level Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Status Donut Chart */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                <PieIcon className="w-4 h-4 text-rose-600" />
                <span>Approval Workflow Breakdown</span>
              </h3>

              <div className="flex items-center justify-center py-2">
                <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="14" />
                  {/* Closed (Emerald) */}
                  <circle
                    cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="14"
                    strokeDasharray={`${(summaryCounts.closed / (summaryCounts.total || 1)) * 251.2} 251.2`}
                  />
                  {/* In Review (Amber) */}
                  <circle
                    cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="14"
                    strokeDasharray={`${(summaryCounts.inReview / (summaryCounts.total || 1)) * 251.2} 251.2`}
                    strokeDashoffset={`-${(summaryCounts.closed / (summaryCounts.total || 1)) * 251.2}`}
                  />
                </svg>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span><span>Closed</span></span>
                  <strong>{summaryCounts.closed}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span><span>In Review</span></span>
                  <strong>{summaryCounts.inReview}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span><span>Pending</span></span>
                  <strong>{summaryCounts.pending}</strong>
                </div>
              </div>
            </div>

            {/* Risk-Level & Incident Concentration Bar Charts */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-rose-600" />
                <span>Risk Severity Distribution</span>
              </h3>

              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-bold text-rose-600 dark:text-rose-400">High Risk Incidents</span>
                    <strong className="font-black">{summaryCounts.highRisk}</strong>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div className="bg-rose-600 h-3 rounded-full" style={{ width: `${(summaryCounts.highRisk / (summaryCounts.total || 1)) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-bold text-amber-600 dark:text-amber-400">Medium Risk Incidents</span>
                    <strong className="font-black">{summaryCounts.mediumRisk}</strong>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div className="bg-amber-500 h-3 rounded-full" style={{ width: `${(summaryCounts.mediumRisk / (summaryCounts.total || 1)) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Low Risk Incidents</span>
                    <strong className="font-black">{summaryCounts.lowRisk}</strong>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div className="bg-emerald-500 h-3 rounded-full" style={{ width: `${(summaryCounts.lowRisk / (summaryCounts.total || 1)) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Recent Incident Reports Table (Section 20) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Recent Incident Reports Telemetry ({filteredReports.length} Shown)
              </h3>
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by synopsis or title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Synopsis #</th>
                    <th className="py-3 px-4">Date / Time</th>
                    <th className="py-3 px-4">Incident Title</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Risk Level</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredReports.map(rep => (
                    <tr key={rep.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {rep.synopsisNumber}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        <div>{rep.eventDate}</div>
                        <div className="text-[10px] text-slate-400">{rep.eventTime}</div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                        {rep.incidentTitle}
                        <div className="text-[10px] text-slate-400 font-normal">Type: {rep.reportType} • {rep.area}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {rep.locationName}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rep.riskLevel === 'High' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                          rep.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                          rep.riskLevel === 'Low' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {rep.riskLevel}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          rep.status === 'Closed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                          rep.status === 'In Review' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                          rep.status === 'Void' ? 'bg-slate-200 text-slate-700' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        }`}>
                          {rep.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button
                          onClick={() => {
                            setActiveIncidentReportId(rep.id);
                            setShowIncidentReportModal(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold"
                        >
                          View / Edit
                        </button>
                        {canDownloadReports && (
                          <button
                            onClick={() => generateIncidentReportPDF(rep, systemSettings)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600"
                            title="Download PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* SUB-AREA 2: INCIDENT REPORTS FULL LIST (Section 19) */}
      {activeSubArea === 'incidents' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Master Security Incident Reports
              </h2>
              <p className="text-xs text-slate-500">
                Supervisor-to-manager approval workflow, evidence files, and immutable synopsis records.
              </p>
            </div>

            {canCreateIncident && (
              <button
                onClick={() => {
                  setActiveIncidentReportId(null);
                  setShowIncidentReportModal(true);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Incident Report</span>
              </button>
            )}
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Synopsis #</th>
                  <th className="py-3 px-4">Title & Type</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Reported By</th>
                  <th className="py-3 px-4">Risk</th>
                  <th className="py-3 px-4">Workflow Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {incidentReports.map(rep => (
                  <tr key={rep.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {rep.synopsisNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{rep.incidentTitle}</div>
                      <div className="text-[10px] text-slate-400">{rep.reportType} • {rep.area}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                      {rep.locationName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                      {rep.reportedBy}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rep.riskLevel === 'High' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                        rep.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                        'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        {rep.riskLevel}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        rep.status === 'Closed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        rep.status === 'In Review' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}>
                        {rep.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => {
                          setActiveIncidentReportId(rep.id);
                          setShowIncidentReportModal(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold"
                      >
                        Open
                      </button>
                      {canDownloadReports && (
                        <button
                          onClick={() => generateIncidentReportPDF(rep, systemSettings)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-AREA 3: SURVEILLANCE AUDIT & REVIEW (Section 21 & 22) */}
      {activeSubArea === 'surveillance' && (
        <div className="space-y-6">
          
          {/* Sub-selector: My Schedule (Embedded) vs Shift Audits */}
          <div className="flex space-x-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold max-w-fit">
            <button
              onClick={() => setSurveillanceTab('schedule')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                surveillanceTab === 'schedule' ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              My Schedule (Embedded)
            </button>
            <button
              onClick={() => setSurveillanceTab('shift_audits')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                surveillanceTab === 'shift_audits' ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Sentri Shift Audits ({shiftAudits.length})
            </button>
          </div>

          {/* TAB 1: My Schedule (Embedded) (Section 21) */}
          {surveillanceTab === 'schedule' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Embedded Surveillance Audit Schedule
                  </h3>
                  <p className="text-xs text-slate-500">
                    Direct access to field audits within the surveillance console.
                  </p>
                </div>

                {/* Quick Filters (Section 21) */}
                <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
                  {['all', 'due_today', 'overdue', 'sent'].map(filterKey => (
                    <button
                      key={filterKey}
                      onClick={() => setScheduleQuickFilter(filterKey)}
                      className={`px-3 py-1 rounded-lg capitalize font-medium ${
                        scheduleQuickFilter === filterKey ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs font-bold' : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {filterKey.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Question Set</th>
                      <th className="py-3 px-4">Scheduled Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredScheduleAudits.map(a => (
                      <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{a.locationName}</td>
                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">{a.questionSetName}</td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{a.scheduledDate} {a.scheduledTime}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            a.status === 'Sent' ? 'bg-emerald-100 text-emerald-800' :
                            a.status === 'In Progress' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {a.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => startOrResumeAudit(a.id)}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px]"
                          >
                            {a.status === 'Scheduled' ? 'Start Audit' : 'Continue Audit'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Shift Audits (Section 22) */}
          {surveillanceTab === 'shift_audits' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Surveillance Shift Inspections (Sentri Audits)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Dedicated shift checks for Office Towers, Malls, and Parking facility zones.
                  </p>
                </div>

                {canCreateShiftAudit && (
                  <button
                    onClick={() => {
                      setActiveShiftAuditId(null);
                      setShowShiftAuditModal(true);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Shift Audit</span>
                  </button>
                )}
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Audit #</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Shift Date & Hours</th>
                      <th className="py-3 px-4">Facility Zone</th>
                      <th className="py-3 px-4">Operator</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {shiftAudits.map(sa => (
                      <tr key={sa.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">{sa.auditNumber}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">{sa.locationName}</td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                          <div>{sa.shiftDate}</div>
                          <div className="text-[10px] text-slate-400">{sa.shiftHours}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {sa.facilityZone}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                          {sa.operatorName}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            sa.status === 'Submitted' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {sa.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1">
                          <button
                            onClick={() => {
                              setActiveShiftAuditId(sa.id);
                              setShowShiftAuditModal(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold"
                          >
                            Open / Edit
                          </button>
                          {canDownloadReports && sa.status === 'Submitted' && (
                            <button
                              onClick={() => generateShiftAuditPDF(sa, systemSettings)}
                              className="p-1 rounded-lg text-slate-400 hover:text-indigo-600"
                              title="Download Shift Audit PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}

