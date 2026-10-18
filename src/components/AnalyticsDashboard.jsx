import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  TrendingUp, 
  PieChart as PieIcon, 
  BarChart2, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  Store,
  Layers,
  ArrowUpRight,
  Clock
} from 'lucide-react';

export function AnalyticsDashboard() {
  const { audits, questionSets, calculateAuditScore, locations } = useApp();

  // 1. Calculate Score Trend over audits
  const trendData = useMemo(() => {
    // Sort audits by date
    const sorted = [...audits].sort((a, b) => {
      const da = a.actualDate || a.scheduledDate || '';
      const db = b.actualDate || b.scheduledDate || '';
      return da.localeCompare(db);
    });

    return sorted.map((audit) => {
      const qSet = questionSets.find(qs => qs.id === audit.questionSetId);
      const score = calculateAuditScore(audit, qSet);
      return {
        id: audit.id,
        label: audit.locationName.split('-')[1]?.trim() || audit.locationName,
        date: audit.actualDate || audit.scheduledDate,
        score: score.percentage,
        status: audit.status
      };
    });
  }, [audits, questionSets, calculateAuditScore]);

  // 2. Status Distribution (Donut Chart)
  const statusCounts = useMemo(() => {
    const scheduled = audits.filter(a => a.status === 'Scheduled').length;
    const inProgress = audits.filter(a => a.status === 'In Progress').length;
    const sent = audits.filter(a => a.status === 'Sent').length;
    const total = audits.length || 1;

    return {
      scheduled,
      inProgress,
      sent,
      total,
      scheduledPct: Math.round((scheduled / total) * 100),
      inProgressPct: Math.round((inProgress / total) * 100),
      sentPct: Math.round((sent / total) * 100)
    };
  }, [audits]);

  // 3. Brand Comparison
  const brandData = useMemo(() => {
    const brandMap = {};
    audits.forEach(a => {
      const brand = a.brand || 'Unassigned';
      if (!brandMap[brand]) {
        brandMap[brand] = { brand, totalScore: 0, count: 0 };
      }
      const qSet = questionSets.find(qs => qs.id === a.questionSetId);
      const score = calculateAuditScore(a, qSet);
      brandMap[brand].totalScore += score.percentage;
      brandMap[brand].count += 1;
    });

    return Object.values(brandMap).map(b => ({
      brand: b.brand,
      avgScore: Math.round((b.totalScore / b.count) * 10) / 10,
      count: b.count
    }));
  }, [audits, questionSets, calculateAuditScore]);

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Analytics & Quality Intelligence
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Longitudinal audit trends, pipeline distribution, and brand benchmarking analytics.
        </p>
      </div>

      {/* Analytics KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Total Assessments</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{audits.length}</div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Across {locations.length} Sites</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Completion Rate</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{statusCounts.sentPct}%</div>
            <p className="text-[11px] text-slate-500 mt-0.5">{statusCounts.sent} Delivered to Stakeholders</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">In Progress Queue</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{statusCounts.inProgress}</div>
            <p className="text-[11px] text-amber-600 font-semibold mt-0.5">Active Field Assessments</p>
          </div>
        </div>
      </div>

      {/* Main Charts Grid (Section 17: Score Trend, Status Distribution, Brand Comparison) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CHART 1: Score Trend Chart (Line Chart over Time) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>Score Trend Chart</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Audit compliance performance over chronological inspection dates.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              Target: 85%
            </span>
          </div>

          {/* SVG Line Chart */}
          <div className="h-64 w-full relative pt-4">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200" preserveAspectRatio="none">
              {/* Grid lines */}
              <line x1="0" y1="40" x2="500" y2="40" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeDasharray="3 3" />
              <line x1="0" y1="90" x2="500" y2="90" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeDasharray="3 3" />
              <line x1="0" y1="140" x2="500" y2="140" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeDasharray="3 3" />
              <line x1="0" y1="190" x2="500" y2="190" stroke="currentColor" className="text-slate-200 dark:text-slate-700" />

              {/* Threshold line 85% */}
              <line x1="0" y1="60" x2="500" y2="60" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
              <text x="490" y="55" textAnchor="end" fill="#10b981" fontSize="9" fontWeight="bold">85% Target</text>

              {/* Data points & polyline */}
              {trendData.length > 1 && (
                <>
                  <polyline
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={trendData.map((d, i) => {
                      const x = (i / (trendData.length - 1)) * 460 + 20;
                      // scale score 0-100 to y 190 down to 20
                      const y = 190 - ((d.score / 100) * 160);
                      return `${x},${y}`;
                    }).join(' ')}
                  />

                  {trendData.map((d, i) => {
                    const x = (i / (trendData.length - 1)) * 460 + 20;
                    const y = 190 - ((d.score / 100) * 160);
                    return (
                      <g key={d.id} className="cursor-pointer group">
                        <circle
                          cx={x}
                          cy={y}
                          r="5.5"
                          className="fill-white dark:fill-slate-900 stroke-indigo-600 stroke-[3px] group-hover:r-7 transition-all"
                        />
                        <text
                          x={x}
                          y={y - 10}
                          textAnchor="middle"
                          fill="currentColor"
                          className="text-[10px] font-bold fill-slate-800 dark:fill-slate-200"
                        >
                          {d.score}%
                        </text>
                        <text
                          x={x}
                          y={205}
                          textAnchor="middle"
                          fill="currentColor"
                          className="text-[9px] fill-slate-400 font-medium"
                        >
                          {d.label}
                        </text>
                      </g>
                    );
                  })}
                </>
              )}
            </svg>
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Historical audits</span>
            <span>Latest inspections &rarr;</span>
          </div>
        </div>

        {/* CHART 2: Status Distribution (Donut / Pie Chart) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
              <PieIcon className="w-4 h-4 text-indigo-600" />
              <span>Status Distribution</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Audit volume across lifecycle states.
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
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#10b981"
                strokeWidth="14"
                strokeDasharray={`${(statusCounts.sentPct * 251.2) / 100} 251.2`}
                strokeDashoffset="0"
                strokeLinecap="round"
              />
              {/* In Progress arc (Amber) */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#f59e0b"
                strokeWidth="14"
                strokeDasharray={`${(statusCounts.inProgressPct * 251.2) / 100} 251.2`}
                strokeDashoffset={`-${(statusCounts.sentPct * 251.2) / 100}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {statusCounts.total}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Audits
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-700 dark:text-slate-300">Sent (Completed)</span>
              </div>
              <strong className="font-bold">{statusCounts.sent} ({statusCounts.sentPct}%)</strong>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-slate-700 dark:text-slate-300">In Progress</span>
              </div>
              <strong className="font-bold">{statusCounts.inProgress} ({statusCounts.inProgressPct}%)</strong>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-slate-700 dark:text-slate-300">Scheduled</span>
              </div>
              <strong className="font-bold">{statusCounts.scheduled} ({statusCounts.scheduledPct}%)</strong>
            </div>
          </div>
        </div>

      </div>

      {/* CHART 3: Brand Comparison (Bar Chart) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
            <BarChart2 className="w-4 h-4 text-indigo-600" />
            <span>Brand Comparison Benchmark</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Average audit compliance percentage benchmarked across individual franchise brands.
          </p>
        </div>

        <div className="space-y-4">
          {brandData.map((b) => (
            <div key={b.brand} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <Store className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{b.brand}</span>
                  <span className="text-slate-400 font-normal">({b.count} audit{b.count > 1 ? 's' : ''})</span>
                </span>
                <span className="font-black text-slate-900 dark:text-white text-sm">
                  {b.avgScore}%
                </span>
              </div>

              {/* Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-700 ${
                    b.avgScore >= 85 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-indigo-600 to-indigo-400'
                  }`}
                  style={{ width: `${Math.min(100, b.avgScore)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

