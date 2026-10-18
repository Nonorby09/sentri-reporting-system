import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  TrendingUp, 
  PieChart as PieIcon, 
  BarChart2, 
  Award, 
  CheckCircle2, 
  Store,
  Clock,
  Filter,
  Calendar,
  RotateCcw,
  FileText,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Check
} from 'lucide-react';

export function AnalyticsDashboard() {
  const { 
    audits = [], 
    questionSets = [], 
    calculateAuditScore, 
    locations = [], 
    setViewingReportAuditId 
  } = useApp();

  // Interactive Filter States
  const [dateRange, setDateRange] = useState('all'); // 'all' | '30d' | '7d'
  const [selectedBrand, setSelectedBrand] = useState('all'); // 'all' | brandName
  const [selectedStatus, setSelectedStatus] = useState('all'); // 'all' | 'Sent' | 'In Progress' | 'Scheduled'
  const [activePoint, setActivePoint] = useState(null);

  // Safe data arrays
  const safeAudits = useMemo(() => Array.isArray(audits) ? audits : [], [audits]);
  const safeLocations = useMemo(() => Array.isArray(locations) ? locations : [], [locations]);
  const safeQuestionSets = useMemo(() => Array.isArray(questionSets) ? questionSets : [], [questionSets]);

  // Extract unique brands for filtering
  const availableBrands = useMemo(() => {
    const set = new Set();
    safeAudits.forEach(a => {
      if (a?.brand) set.add(a.brand);
      else if (a?.organization) set.add(a.organization);
    });
    return Array.from(set);
  }, [safeAudits]);

  // Filtered audits based on user controls
  const filteredAudits = useMemo(() => {
    const now = new Date();

    return safeAudits.filter(a => {
      // 1. Date Range Filter
      if (dateRange !== 'all') {
        const rawDate = a.actualDate || a.scheduledDate;
        if (!rawDate) return false;
        const auditDate = new Date(rawDate);
        if (isNaN(auditDate.getTime())) return false;
        const diffDays = Math.ceil((now.getTime() - auditDate.getTime()) / (1000 * 60 * 60 * 24));
        if (dateRange === '7d' && diffDays > 7) return false;
        if (dateRange === '30d' && diffDays > 30) return false;
      }

      // 2. Brand Filter
      if (selectedBrand !== 'all') {
        const auditBrand = a.brand || a.organization;
        if (auditBrand !== selectedBrand) return false;
      }

      // 3. Status Filter
      if (selectedStatus !== 'all' && a.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [safeAudits, dateRange, selectedBrand, selectedStatus]);

  // 1. Calculate Score Trend over chronological audits
  const trendData = useMemo(() => {
    const sorted = [...filteredAudits].sort((a, b) => {
      const da = a.actualDate || a.scheduledDate || '';
      const db = b.actualDate || b.scheduledDate || '';
      return da.localeCompare(db);
    });

    return sorted.map((audit) => {
      const qSet = safeQuestionSets.find(qs => qs.id === audit.questionSetId);
      const scoreObj = typeof calculateAuditScore === 'function' ? calculateAuditScore(audit, qSet) : { percentage: 0 };
      const rawScore = Number(scoreObj?.percentage);
      const score = !isNaN(rawScore) ? Math.max(0, Math.min(100, rawScore)) : 0;
      
      const locName = typeof audit.locationName === 'string' ? audit.locationName : '';
      const label = locName.includes('-')
        ? locName.split('-')[1]?.trim() || locName
        : locName || audit.reportId || `Audit ${audit.id}`;

      return {
        id: audit.id,
        audit,
        label,
        locationFullName: locName || audit.locationId || 'Unknown Location',
        date: audit.actualDate || audit.scheduledDate || 'Unscheduled',
        score,
        status: audit.status || 'Scheduled',
        auditor: audit.auditor || 'Unassigned',
        brand: audit.brand || audit.organization || 'General'
      };
    });
  }, [filteredAudits, safeQuestionSets, calculateAuditScore]);

  // 2. Status Distribution (Donut Chart)
  const statusCounts = useMemo(() => {
    const total = filteredAudits.length;
    const scheduled = filteredAudits.filter(a => a.status === 'Scheduled').length;
    const inProgress = filteredAudits.filter(a => a.status === 'In Progress').length;
    const sent = filteredAudits.filter(a => a.status === 'Sent').length;

    if (total === 0) {
      return {
        scheduled: 0,
        inProgress: 0,
        sent: 0,
        total: 0,
        scheduledPct: 0,
        inProgressPct: 0,
        sentPct: 0
      };
    }

    return {
      scheduled,
      inProgress,
      sent,
      total,
      scheduledPct: Math.round((scheduled / total) * 100),
      inProgressPct: Math.round((inProgress / total) * 100),
      sentPct: Math.round((sent / total) * 100)
    };
  }, [filteredAudits]);

  // 3. Brand Comparison
  const brandData = useMemo(() => {
    const brandMap = {};
    filteredAudits.forEach(a => {
      const brand = a.brand || a.organization || 'General';
      if (!brandMap[brand]) {
        brandMap[brand] = { brand, totalScore: 0, count: 0 };
      }
      const qSet = safeQuestionSets.find(qs => qs.id === a.questionSetId);
      const scoreObj = typeof calculateAuditScore === 'function' ? calculateAuditScore(a, qSet) : { percentage: 0 };
      const rawScore = Number(scoreObj?.percentage);
      brandMap[brand].totalScore += !isNaN(rawScore) ? rawScore : 0;
      brandMap[brand].count += 1;
    });

    return Object.values(brandMap).map(b => ({
      brand: b.brand,
      avgScore: b.count > 0 ? Math.round((b.totalScore / b.count) * 10) / 10 : 0,
      count: b.count
    }));
  }, [filteredAudits, safeQuestionSets, calculateAuditScore]);

  // Overall average compliance score
  const overallAvgScore = useMemo(() => {
    if (trendData.length === 0) return 0;
    const sum = trendData.reduce((acc, curr) => acc + curr.score, 0);
    return Math.round((sum / trendData.length) * 10) / 10;
  }, [trendData]);

  // Donut SVG circumference calculations
  const circumference = 251.2; // 2 * PI * 40
  const sentArc = Math.max(0, (statusCounts.sentPct * circumference) / 100);
  const inProgressArc = Math.max(0, (statusCounts.inProgressPct * circumference) / 100);
  const scheduledArc = Math.max(0, (statusCounts.scheduledPct * circumference) / 100);

  const resetFilters = () => {
    setDateRange('all');
    setSelectedBrand('all');
    setSelectedStatus('all');
    setActivePoint(null);
  };

  const isFiltered = dateRange !== 'all' || selectedBrand !== 'all' || selectedStatus !== 'all';

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Analytics &amp; Quality Intelligence
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Longitudinal audit trends, pipeline distribution, and brand benchmarking analytics.
          </p>
        </div>

        {/* Global Filter Bar Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Range Selector */}
          <div className="inline-flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 text-xs shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
            {[
              { id: 'all', label: 'All Time' },
              { id: '30d', label: '30 Days' },
              { id: '7d', label: '7 Days' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setDateRange(tab.id)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  dateRange === tab.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Brand Selector */}
          {availableBrands.length > 0 && (
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              <option value="all">All Brands</option>
              {availableBrands.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          )}

          {/* Reset Filters */}
          {isFiltered && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Analytics KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Assessments */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Audits Analyzed</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{filteredAudits.length}</div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 truncate">Across {safeLocations.length} Master Sites</p>
          </div>
        </div>

        {/* KPI 2: Overall Compliance Avg */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Average Compliance</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{overallAvgScore}%</div>
            <p className={`text-[11px] font-semibold mt-0.5 ${overallAvgScore >= 85 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {overallAvgScore >= 85 ? 'Standard Met (≥85%)' : 'Below Benchmark Target'}
            </p>
          </div>
        </div>

        {/* KPI 3: Completion Rate */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Delivered Finalized</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{statusCounts.sentPct}%</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{statusCounts.sent} Delivered Reports</p>
          </div>
        </div>

        {/* KPI 4: In Progress Queue */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">In Progress Queue</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{statusCounts.inProgress}</div>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5 truncate">Active Inspections</p>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CHART 1: Score Trend Chart (Line Chart over Time) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Score Trend Chart</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Audit compliance performance over chronological inspection dates. Click any point to inspect.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Benchmark: 85%
              </span>
            </div>
          </div>

          {/* SVG Line Chart */}
          <div className="h-64 w-full relative pt-2">
            {trendData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs py-12">
                <TrendingUp className="w-8 h-8 opacity-30 mb-2" />
                <p className="font-semibold text-slate-500">No audit records match the selected filters</p>
                <p className="text-[11px] text-slate-400 mt-1">Try resetting the date range or brand filter</p>
              </div>
            ) : (
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 220" preserveAspectRatio="none">
                {/* Grid lines */}
                <line x1="20" y1="40" x2="480" y2="40" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeDasharray="3 3" />
                <line x1="20" y1="90" x2="480" y2="90" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeDasharray="3 3" />
                <line x1="20" y1="140" x2="480" y2="140" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeDasharray="3 3" />
                <line x1="20" y1="185" x2="480" y2="185" stroke="currentColor" className="text-slate-200 dark:text-slate-700" />

                {/* Benchmark threshold line 85% */}
                <line x1="20" y1="62" x2="480" y2="62" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
                <text x="475" y="56" textAnchor="end" fill="#10b981" fontSize="9" fontWeight="bold">85% Target</text>

                {/* Polyline connect points */}
                {trendData.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={trendData.map((d, i) => {
                      const x = (i / (trendData.length - 1)) * 440 + 30;
                      const y = 185 - ((d.score / 100) * 145);
                      return `${x},${y}`;
                    }).join(' ')}
                  />
                )}

                {/* Interactive Points */}
                {trendData.map((d, i) => {
                  const x = trendData.length === 1 ? 250 : (i / (trendData.length - 1)) * 440 + 30;
                  const y = 185 - ((d.score / 100) * 145);
                  const isSelected = activePoint?.id === d.id;

                  return (
                    <g 
                      key={d.id} 
                      className="cursor-pointer group"
                      onClick={() => setActivePoint(d)}
                    >
                      <circle
                        cx={x}
                        cy={y}
                        r={isSelected ? 8 : 5.5}
                        className={`transition-all ${
                          isSelected 
                            ? 'fill-indigo-600 stroke-white dark:stroke-slate-900 stroke-[3px]' 
                            : 'fill-white dark:fill-slate-900 stroke-indigo-600 stroke-[3px] group-hover:r-7'
                        }`}
                      />
                      <text
                        x={x}
                        y={y - 10}
                        textAnchor="middle"
                        fill="currentColor"
                        className={`text-[10px] font-bold ${isSelected ? 'fill-indigo-600 dark:fill-indigo-400 font-extrabold' : 'fill-slate-800 dark:fill-slate-200'}`}
                      >
                        {d.score}%
                      </text>
                      <text
                        x={x}
                        y={202}
                        textAnchor="middle"
                        fill="currentColor"
                        className="text-[9px] fill-slate-400 font-medium"
                      >
                        {d.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}
          </div>

          {/* Active Point Card Inspector */}
          {activePoint ? (
            <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">{activePoint.locationFullName}</span>
                <span className="text-slate-500 text-[11px]">
                  Date: {activePoint.date} • Score: <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{activePoint.score}%</strong> • Status: {activePoint.status}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewingReportAuditId(activePoint.id)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center space-x-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Open Report</span>
                </button>
                <button
                  onClick={() => setActivePoint(null)}
                  className="px-2 py-1.5 text-slate-400 hover:text-slate-600 text-xs"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span>Chronological audit sequence</span>
              <span>Click any inspection node to inspect &rarr;</span>
            </div>
          )}
        </div>

        {/* CHART 2: Status Distribution (Donut / Pie Chart) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
              <PieIcon className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Status Distribution</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Breakdown of audits across the delivery pipeline.
            </p>
          </div>

          {/* SVG Donut Visualizer */}
          <div className="relative flex items-center justify-center py-4">
            <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="currentColor"
                className="text-slate-100 dark:text-slate-800"
                strokeWidth="14"
              />
              {/* Sent arc (Green) */}
              {statusCounts.sentPct > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="14"
                  strokeDasharray={`${sentArc} ${circumference}`}
                  strokeDashoffset="0"
                />
              )}
              {/* In Progress arc (Amber) */}
              {statusCounts.inProgressPct > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#f59e0b"
                  strokeWidth="14"
                  strokeDasharray={`${inProgressArc} ${circumference}`}
                  strokeDashoffset={`-${sentArc}`}
                />
              )}
              {/* Scheduled arc (Blue) */}
              {statusCounts.scheduledPct > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#3b82f6"
                  strokeWidth="14"
                  strokeDasharray={`${scheduledArc} ${circumference}`}
                  strokeDashoffset={`-${sentArc + inProgressArc}`}
                />
              )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                {statusCounts.total}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1">
                Audits
              </span>
            </div>
          </div>

          {/* Interactive Legend with Clickable Filters */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <button
              onClick={() => setSelectedStatus(selectedStatus === 'Sent' ? 'all' : 'Sent')}
              className={`w-full flex items-center justify-between p-1.5 rounded-lg transition-colors ${
                selectedStatus === 'Sent' ? 'bg-emerald-50 dark:bg-emerald-950/40' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Sent (Completed)</span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white">{statusCounts.sent} ({statusCounts.sentPct}%)</span>
            </button>
            <button
              onClick={() => setSelectedStatus(selectedStatus === 'In Progress' ? 'all' : 'In Progress')}
              className={`w-full flex items-center justify-between p-1.5 rounded-lg transition-colors ${
                selectedStatus === 'In Progress' ? 'bg-amber-50 dark:bg-amber-950/40' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">In Progress</span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white">{statusCounts.inProgress} ({statusCounts.inProgressPct}%)</span>
            </button>
            <button
              onClick={() => setSelectedStatus(selectedStatus === 'Scheduled' ? 'all' : 'Scheduled')}
              className={`w-full flex items-center justify-between p-1.5 rounded-lg transition-colors ${
                selectedStatus === 'Scheduled' ? 'bg-blue-50 dark:bg-blue-950/40' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Scheduled</span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white">{statusCounts.scheduled} ({statusCounts.scheduledPct}%)</span>
            </button>
          </div>
        </div>

      </div>

      {/* CHART 3: Brand Comparison (Bar Chart) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Brand Comparison Benchmark</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Average audit compliance percentage benchmarked across franchise brands. Click a brand to filter.
            </p>
          </div>
          <span className="text-xs text-slate-400">
            {brandData.length} brand{brandData.length !== 1 ? 's' : ''} monitored
          </span>
        </div>

        {brandData.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            <Store className="w-8 h-8 opacity-30 mx-auto mb-2" />
            <span>No brand benchmarks available for current selection</span>
          </div>
        ) : (
          <div className="space-y-4">
            {brandData.map((b) => {
              const isSelected = selectedBrand === b.brand;
              return (
                <div 
                  key={b.brand} 
                  onClick={() => setSelectedBrand(isSelected ? 'all' : b.brand)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30' 
                      : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <Store className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>{b.brand}</span>
                      <span className="text-slate-400 font-normal">({b.count} audit{b.count > 1 ? 's' : ''})</span>
                      {isSelected && (
                        <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.2 rounded font-semibold">Active Filter</span>
                      )}
                    </span>
                    <span className="font-black text-slate-900 dark:text-white text-sm">
                      {b.avgScore}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all duration-700 ${
                        b.avgScore >= 85 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-indigo-600 to-indigo-400'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, b.avgScore))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* TABLE 4: Audit Inspection Detail Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Contributing Inspection Logs</h3>
            <p className="text-xs text-slate-400">Detailed records included in this analytical report ({filteredAudits.length} audits)</p>
          </div>
          {isFiltered && (
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">Filtered view active</span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Brand</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Auditor</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Score</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAudits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No audits found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredAudits.map(audit => {
                  const qSet = safeQuestionSets.find(qs => qs.id === audit.questionSetId);
                  const scoreObj = typeof calculateAuditScore === 'function' ? calculateAuditScore(audit, qSet) : { percentage: 0 };
                  const score = scoreObj?.percentage || 0;

                  return (
                    <tr key={audit.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        {audit.locationName || audit.locationId || 'Unspecified Location'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium">
                        {audit.brand || audit.organization || 'General'}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {audit.actualDate || audit.scheduledDate || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium">
                        {audit.auditor || 'Unassigned'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          audit.status === 'Sent'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : audit.status === 'In Progress'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        }`}>
                          {audit.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold">
                        <span className={score >= 85 ? 'text-emerald-600' : 'text-amber-600'}>
                          {score}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setViewingReportAuditId(audit.id)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
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
