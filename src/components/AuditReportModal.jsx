import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Download, 
  Mail, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Edit3, 
  Send,
  FileCheck,
  Building,
  Paperclip,
  Check
} from 'lucide-react';
import { generateAuditReportPDF } from '../utils/pdfGenerator';

export function AuditReportModal() {
  const { 
    viewingReportAuditId, 
    setViewingReportAuditId, 
    audits, 
    questionSets, 
    overrideQuestionPoints, 
    resetQuestionPointOverrides, 
    hasPermission, 
    calculateAuditScore,
    systemSettings,
    showToast
  } = useApp();

  const audit = audits.find(a => a.id === viewingReportAuditId);
  const questionSet = questionSets.find(qs => qs.id === audit?.questionSetId);

  // Partial credit inline editing
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [overrideInputVal, setOverrideInputVal] = useState('');

  // Email modal / status
  const [recipientEmail, setRecipientEmail] = useState(audit?.ownerEmail || '');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);

  if (!audit || !questionSet) return null;

  const score = calculateAuditScore(audit, questionSet);

  const startEditPoints = (qId, currentEarned) => {
    setEditingQuestionId(qId);
    setOverrideInputVal(String(currentEarned));
  };

  const savePointsOverride = (qId, maxPoints) => {
    let num = parseFloat(overrideInputVal);
    if (isNaN(num)) num = 0;
    // Clamped between 0 and max points
    num = Math.max(0, Math.min(maxPoints, num));
    overrideQuestionPoints(audit.id, qId, num);
    setEditingQuestionId(null);
  };

  const handleDownloadPDF = () => {
    if (!hasPermission('download_report')) {
      showToast('Permission denied: You do not have permission to download reports.', 'error');
      return;
    }
    generateAuditReportPDF(audit, questionSet, score, systemSettings);
  };

  const handleSendEmail = (e) => {
    e.preventDefault();
    if (!hasPermission('send_email_report')) {
      showToast('Permission denied: You do not have permission to email reports.', 'error');
      return;
    }
    if (!recipientEmail.trim()) {
      showToast('Please enter a recipient email address', 'error');
      return;
    }

    setIsSendingEmail(true);
    setTimeout(() => {
      setIsSendingEmail(false);
      setEmailSentSuccess(true);
      showToast(`Audit report sent to ${recipientEmail}!`, 'success');
    }, 1200);
  };

  const canDownload = hasPermission('download_report');
  const canEmail = hasPermission('send_email_report');
  const hasAnyOverrides = audit.pointOverrides && Object.keys(audit.pointOverrides).length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40 shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300">
                AUDIT REPORT MODAL
              </span>
              <span className="font-mono text-xs text-slate-400">{audit.reportId}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {audit.locationName}
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPDF}
              disabled={!canDownload}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                canDownload
                  ? 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  : 'opacity-50 cursor-not-allowed text-slate-400'
              }`}
              title={!canDownload ? "Requires 'download_report' permission" : "Generate & download official PDF"}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={() => setViewingReportAuditId(null)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Top Score & Summary Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-100 dark:border-indigo-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Overall Compliance Score
              </span>
              <div className="mt-1 flex items-baseline space-x-3">
                <span className="text-4xl font-black text-slate-900 dark:text-white">
                  {score.percentage}%
                </span>
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  ({score.earnedPoints} / {score.maxPossiblePoints} Points)
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  score.percentage >= 85 
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300' 
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                }`}>
                  {score.percentage >= 85 ? 'PASSED' : 'NEEDS IMPROVEMENT'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Audited by <strong>{audit.auditor}</strong> on {audit.actualDate || audit.scheduledDate} {audit.actualTime || audit.scheduledTime || ''}
              </p>
            </div>

            {/* Metrics pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800">
                <span className="block text-emerald-600 dark:text-emerald-400 font-black text-lg">{score.passedCount}</span>
                <span className="text-slate-400 font-medium">Passed</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800">
                <span className="block text-rose-600 dark:text-rose-400 font-black text-lg">{score.failedCount}</span>
                <span className="text-slate-400 font-medium">Failed</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800">
                <span className="block text-slate-600 dark:text-slate-300 font-black text-lg">{score.naCount}</span>
                <span className="text-slate-400 font-medium">N/A</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800">
                <span className="block text-amber-600 dark:text-amber-400 font-black text-lg">{score.unansweredCount}</span>
                <span className="text-slate-400 font-medium">Pending</span>
              </div>
            </div>
          </div>

          {/* Section: Email Report to Stakeholder (Section 10) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center space-x-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-500" />
              <span>Email Report to Property Owner / Stakeholders</span>
            </h3>

            {emailSentSuccess ? (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Report PDF & summary email successfully dispatched to <strong>{recipientEmail}</strong>!</span>
                </div>
                <button
                  onClick={() => setEmailSentSuccess(false)}
                  className="text-xs underline text-emerald-800 dark:text-emerald-200 font-semibold"
                >
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendEmail} className="flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="recipient@franchise.com"
                  className="flex-1 w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!canEmail || isSendingEmail}
                  className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors ${
                    canEmail
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                  title={!canEmail ? "Requires 'send_email_report' permission" : "Email Report"}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingEmail ? 'Dispatching...' : 'Email Report'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Section: Partial Credit Question Results Table (Section 10) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Audit Findings & Points Scoring
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Click any points value (e.g. "3/5") to award partial credit. Adjusted points are marked with an asterisk (*).
                </p>
              </div>

              {hasAnyOverrides && (
                <button
                  onClick={() => resetQuestionPointOverrides(audit.id)}
                  className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Overrides</span>
                </button>
              )}
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase font-bold border-b border-slate-200 dark:border-slate-800 text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Item & Question</th>
                    <th className="py-3 px-4">Answer</th>
                    <th className="py-3 px-4 text-center">Points (Earned / Max)</th>
                    <th className="py-3 px-4">Auditor Findings / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {questionSet.questions.map((q) => {
                    const ansData = audit.answers?.[q.id] || { answer: 'Unanswered', notes: '', attachments: [] };
                    const ans = ansData.answer || 'Unanswered';
                    const isOverridden = audit.pointOverrides && audit.pointOverrides[q.id] !== undefined;

                    let earned = 0;
                    if (isOverridden) {
                      earned = audit.pointOverrides[q.id];
                    } else if (ans === 'Yes') {
                      earned = q.points;
                    } else {
                      earned = 0;
                    }

                    const isEditing = editingQuestionId === q.id;

                    return (
                      <tr key={q.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        {/* Question Column */}
                        <td className="py-3.5 px-4 max-w-sm">
                          <span className="font-bold text-slate-800 dark:text-slate-200 block">
                            {q.text}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Category: {q.category}
                          </span>
                        </td>

                        {/* Answer Column */}
                        <td className="py-3.5 px-4">
                          {ans === 'Yes' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              Yes
                            </span>
                          )}
                          {ans === 'No' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                              No
                            </span>
                          )}
                          {ans === 'N/A' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                              N/A
                            </span>
                          )}
                          {ans === 'Unanswered' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60">
                              Unanswered
                            </span>
                          )}
                        </td>

                        {/* Editable Points Column (Partial Credit) */}
                        <td className="py-3.5 px-4 text-center">
                          {ans === 'N/A' ? (
                            <span className="text-slate-400">N/A</span>
                          ) : isEditing ? (
                            <div className="inline-flex items-center space-x-1">
                              <input
                                type="number"
                                step="0.5"
                                min="0"
                                max={q.points}
                                autoFocus
                                value={overrideInputVal}
                                onChange={(e) => setOverrideInputVal(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') savePointsOverride(q.id, q.points);
                                  if (e.key === 'Escape') setEditingQuestionId(null);
                                }}
                                onBlur={() => savePointsOverride(q.id, q.points)}
                                className="w-14 px-1.5 py-0.5 text-center text-xs font-bold rounded border border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                              />
                              <span className="text-slate-400">/{q.points}</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEditPoints(q.id, earned)}
                              className="group inline-flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors cursor-pointer"
                              title="Click to edit partial credit"
                            >
                              <span className="font-bold text-slate-900 dark:text-white text-xs">
                                {earned}/{q.points}
                              </span>
                              {isOverridden && (
                                <span className="text-amber-500 font-bold text-sm" title="Manual point override">*</span>
                              )}
                              <Edit3 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                          )}
                        </td>

                        {/* Notes & Attachments Column */}
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                          {ansData.notes ? (
                            <p className="italic">"{ansData.notes}"</p>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600">-</span>
                          )}
                          {ansData.attachments?.length > 0 && (
                            <div className="mt-1 flex items-center space-x-1 text-[11px] text-indigo-600 dark:text-indigo-400">
                              <Paperclip className="w-3 h-3" />
                              <span>{ansData.attachments.length} attachment(s)</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Incidents & Speed of Service Summaries */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Speed of Service Summary */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span>Speed of Service Metrics</span>
              </h4>
              {audit.speedOfService?.isNA ? (
                <p className="text-xs text-slate-400">Excluded (Marked as N/A)</p>
              ) : audit.speedOfService?.records?.length > 0 ? (
                <div className="space-y-1.5 text-xs">
                  {audit.speedOfService.records.map((r) => (
                    <div key={r.id} className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/50">
                      <span>{r.type} ({r.mode}):</span>
                      <strong className="text-indigo-600 dark:text-indigo-400">{r.durationFormatted}</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No service recordings made</p>
              )}
            </div>

            {/* Incidents Summary */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Reported Incidents</span>
              </h4>
              {audit.incidents?.length > 0 ? (
                <div className="space-y-1 text-xs">
                  {audit.incidents.map((i) => (
                    <div key={i.id} className="py-1 border-b border-slate-100 dark:border-slate-700/50">
                      <strong className="text-rose-600 dark:text-rose-400">[{i.type}]</strong> {i.description}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">Zero incidents flagged</p>
              )}
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40 shrink-0">
          <p className="text-xs text-slate-400">
            * Overridden points are preserved across PDF generation and email exports.
          </p>
          <button
            onClick={() => setViewingReportAuditId(null)}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-bold transition-colors"
          >
            Close Report
          </button>
        </div>

      </div>
    </div>
  );
}

