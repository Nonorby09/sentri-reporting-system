import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ClipboardCheck, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Search, 
  Filter, 
  Plus, 
  Play, 
  RotateCcw, 
  FileText, 
  Paperclip, 
  ExternalLink,
  Building,
  Store,
  Calendar,
  Sparkles,
  X
} from 'lucide-react';

export function Dashboard() {
  const { 
    audits, 
    locations, 
    questionSets, 
    startOrResumeAudit, 
    setViewingReportAuditId, 
    setShowNewAuditModal, 
    hasPermission,
    calculateAuditScore,
    currentRole
  } = useApp();

  // Filters state
  const [statusFilter, setStatusFilter] = useState('All');
  const [brandFilter, setBrandFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique brands for filtering
  const uniqueBrands = useMemo(() => {
    const brands = new Set();
    audits.forEach(a => {
      if (a.brand) brands.add(a.brand);
    });
    return Array.from(brands);
  }, [audits]);

  // Filtered audits
  const filteredAudits = useMemo(() => {
    return audits.filter(audit => {
      const matchStatus = statusFilter === 'All' || audit.status === statusFilter;
      const matchBrand = brandFilter === 'All' || audit.brand === brandFilter || audit.organization === brandFilter;
      const query = searchQuery.toLowerCase().trim();
      const matchSearch = !query || 
        audit.locationName?.toLowerCase().includes(query) ||
        audit.organization?.toLowerCase().includes(query) ||
        audit.reportId?.toLowerCase().includes(query) ||
        audit.auditor?.toLowerCase().includes(query);

      return matchStatus && matchBrand && matchSearch;
    });
  }, [audits, statusFilter, brandFilter, searchQuery]);

  // KPI Calculations
  const kpiStats = useMemo(() => {
    const total = audits.length;
    const scheduled = audits.filter(a => a.status === 'Scheduled').length;
    const inProgress = audits.filter(a => a.status === 'In Progress').length;
    const sent = audits.filter(a => a.status === 'Sent').length;
    const completionRate = total > 0 ? Math.round((sent / total) * 100) : 0;

    // Completed audits average score
    const completedAudits = audits.filter(a => a.status === 'Sent');
    let totalScoreSum = 0;
    completedAudits.forEach(a => {
      const qSet = questionSets.find(qs => qs.id === a.questionSetId);
      const score = calculateAuditScore(a, qSet);
      totalScoreSum += score.percentage;
    });
    const avgScore = completedAudits.length > 0 ? Math.round((totalScoreSum / completedAudits.length) * 10) / 10 : 0;

    // Total incidents reported
    let totalIncidents = 0;
    audits.forEach(a => {
      totalIncidents += (a.incidents?.length || 0);
    });

    return {
      total,
      scheduled,
      inProgress,
      sent,
      completionRate,
      avgScore,
      totalIncidents
    };
  }, [audits, questionSets, calculateAuditScore]);

  const clearFilters = () => {
    setStatusFilter('All');
    setBrandFilter('All');
    setSearchQuery('');
  };

  const canCreateAudit = hasPermission('create_audit');
  const canStartAudit = hasPermission('start_audit');

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Schedule Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time operational audit schedule, field progress tracking, and key performance indicators.
          </p>
        </div>

        {/* New Audit Action Button */}
        <div>
          <button
            onClick={() => setShowNewAuditModal(true)}
            disabled={!canCreateAudit}
            className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-sm shadow-xs transition-all ${
              canCreateAudit
                ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white shadow-indigo-600/20'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
            }`}
            title={!canCreateAudit ? "Creating new audits requires the 'create_audit' permission" : "Schedule a new audit"}
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>New Audit</span>
          </button>
        </div>
      </div>

      {/* KPI Cards (Section 4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Audits & Completion Rate */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Audits
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <ClipboardCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{kpiStats.total}</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
              {kpiStats.completionRate}% complete
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${kpiStats.completionRate}%` }}
            />
          </div>
        </div>

        {/* Audits by Status */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Audit Pipeline
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-center space-x-3 text-xs font-medium text-slate-600 dark:text-slate-300">
            <div>
              <span className="block text-xl font-bold text-slate-900 dark:text-white">{kpiStats.inProgress}</span>
              <span className="text-amber-600 dark:text-amber-400 font-semibold">In Progress</span>
            </div>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
            <div>
              <span className="block text-xl font-bold text-slate-900 dark:text-white">{kpiStats.sent}</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Sent</span>
            </div>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
            <div>
              <span className="block text-xl font-bold text-slate-900 dark:text-white">{kpiStats.scheduled}</span>
              <span className="text-blue-600 dark:text-blue-400 font-semibold">Scheduled</span>
            </div>
          </div>
        </div>

        {/* Average Score */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Avg Audit Score
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{kpiStats.avgScore}%</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">across finalized</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Standard compliance target: &ge; 85%
          </p>
        </div>

        {/* Incidents & Alerts */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Incident Alerts
            </span>
            <div className={`p-2 rounded-xl ${kpiStats.totalIncidents > 0 ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className={`text-3xl font-black ${kpiStats.totalIncidents > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
              {kpiStats.totalIncidents}
            </span>
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
              {kpiStats.totalIncidents === 1 ? 'Incident logged' : 'Incidents logged'}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Road Block, Trespassing, Cash Theft
          </p>
        </div>

      </div>

      {/* Filter Bar (Section 4) */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search location, organization, report ID, or auditor..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
          />
        </div>

        {/* Filters and Clear */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Status Filter */}
          <div className="inline-flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
            {['All', 'Scheduled', 'In Progress', 'Sent'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Brand Filter */}
          {uniqueBrands.length > 0 && (
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
            >
              <option value="All">All Brands</option>
              {uniqueBrands.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          )}

          {/* Clear Button */}
          {(statusFilter !== 'All' || brandFilter !== 'All' || searchQuery) && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <X className="w-3.5 h-3.5 shrink-0" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Audit Table (Section 4) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Question Set</th>
                <th className="py-3.5 px-4">Scheduled</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Progress</th>
                <th className="py-3.5 px-4 text-center">Files</th>
                <th className="py-3.5 px-4 text-center">Incidents</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredAudits.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <Store className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-base font-semibold">No audits match your filters</p>
                    <p className="text-xs mt-1">Try resetting filters or schedule a new audit.</p>
                  </td>
                </tr>
              ) : (
                filteredAudits.map((audit) => {
                  const qSet = questionSets.find(qs => qs.id === audit.questionSetId);
                  const totalQuestions = qSet?.questions?.length || 0;
                  
                  // Calculate answered questions
                  let answeredCount = 0;
                  let attachmentsCount = 0;
                  if (audit.answers) {
                    Object.values(audit.answers).forEach(a => {
                      if (a?.answer) answeredCount++;
                      if (a?.attachments) attachmentsCount += a.attachments.length;
                    });
                  }
                  const progressPct = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
                  const score = calculateAuditScore(audit, qSet);

                  return (
                    <tr 
                      key={audit.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Location Column */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                          <span>{audit.locationName}</span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-2 mt-0.5">
                          <span>{audit.organization}</span>
                          {audit.brand && (
                            <>
                              <span>•</span>
                              <span className="font-medium text-indigo-600 dark:text-indigo-400">{audit.brand}</span>
                            </>
                          )}
                          <span>•</span>
                          <span className="text-[10px] font-mono text-slate-400">{audit.reportId}</span>
                        </div>
                      </td>

                      {/* Question Set Column */}
                      <td className="py-4 px-4">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {audit.questionSetName}
                        </span>
                        <div className="text-xs text-slate-400">
                          {totalQuestions} questions
                        </div>
                      </td>

                      {/* Scheduled Column */}
                      <td className="py-4 px-4 text-xs">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {audit.scheduledDate}
                        </div>
                        <div className="text-slate-400">
                          {audit.scheduledTime || 'Unspecified'}
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="py-4 px-4">
                        {audit.status === 'Sent' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
                            Sent ({score.percentage}%)
                          </span>
                        )}
                        {audit.status === 'In Progress' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 animate-pulse-subtle">
                            In Progress
                          </span>
                        )}
                        {audit.status === 'Scheduled' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300">
                            Scheduled
                          </span>
                        )}
                      </td>

                      {/* Progress Column */}
                      <td className="py-4 px-4">
                        <div className="w-28 sm:w-32">
                          <div className="flex justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                            <span>{answeredCount} / {totalQuestions}</span>
                            <span>{progressPct}%</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-1.5 rounded-full transition-all duration-300 ${
                                audit.status === 'Sent' ? 'bg-emerald-500' : 'bg-indigo-600'
                              }`}
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Attachments Column */}
                      <td className="py-4 px-4 text-center">
                        {attachmentsCount > 0 ? (
                          <span className="inline-flex items-center space-x-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            <Paperclip className="w-3 h-3 text-slate-400" />
                            <span>{attachmentsCount}</span>
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600 text-xs">-</span>
                        )}
                      </td>

                      {/* Incidents Column */}
                      <td className="py-4 px-4 text-center">
                        {audit.incidents && audit.incidents.length > 0 ? (
                          <div 
                            title={`${audit.incidents.length} incident(s) reported: ${audit.incidents.map(i => i.type).join(', ')}`}
                            className="inline-flex items-center justify-center p-1 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400"
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600 text-xs">-</span>
                        )}
                      </td>

                      {/* Actions Column */}
                      <td className="py-4 px-4 text-right">
                        {audit.status === 'Scheduled' && (
                          <button
                            onClick={() => startOrResumeAudit(audit.id)}
                            disabled={!canStartAudit}
                            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors ${
                              canStartAudit
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                            }`}
                            title={!canStartAudit ? "Requires 'start_audit' permission" : "Start Audit"}
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>Start</span>
                          </button>
                        )}

                        {audit.status === 'In Progress' && (
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => startOrResumeAudit(audit.id)}
                              disabled={!canStartAudit}
                              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors ${
                                canStartAudit
                                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                              }`}
                              title="Continue conducting audit"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Continue</span>
                            </button>
                            <button
                              onClick={() => setViewingReportAuditId(audit.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                              title="Preview Report"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        {audit.status === 'Sent' && (
                          <button
                            onClick={() => setViewingReportAuditId(audit.id)}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 transition-colors"
                            title="View and download finalized audit report"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>View Report</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

