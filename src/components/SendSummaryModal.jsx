import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Send, 
  AlertTriangle, 
  CheckCircle2, 
  FileCheck, 
  Mail, 
  Paperclip, 
  Clock, 
  ShieldCheck 
} from 'lucide-react';

export function SendSummaryModal() {
  const { 
    showSendSummaryModal, 
    setShowSendSummaryModal, 
    viewingReportAuditId, 
    audits, 
    questionSets, 
    calculateAuditScore, 
    finalizeAndSendAudit,
    setCurrentView
  } = useApp();

  const audit = audits.find(a => a.id === viewingReportAuditId);
  const questionSet = questionSets.find(qs => qs.id === audit?.questionSetId);

  const [sendEmail, setSendEmail] = useState(true);
  const [recipientEmail, setRecipientEmail] = useState(audit?.ownerEmail || 'store452@jollibeegroup.com');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!showSendSummaryModal || !audit || !questionSet) return null;

  const score = calculateAuditScore(audit, questionSet);

  // Count attachments & SoS records
  let totalAttachments = 0;
  if (audit.answers) {
    Object.values(audit.answers).forEach(a => {
      if (a?.attachments) totalAttachments += a.attachments.length;
    });
  }
  const totalIncidents = audit.incidents?.length || 0;
  const totalSosRecords = audit.speedOfService?.isNA ? 0 : (audit.speedOfService?.records?.length || 0);

  const handleFinalize = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      finalizeAndSendAudit(audit.id, sendEmail ? recipientEmail : '');
      setIsSubmitting(false);
      setShowSendSummaryModal(false);
      setCurrentView('dashboard');
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Send Summary & Pre-Send Review
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verify completion metrics before finalizing audit delivery.
            </p>
          </div>
          <button 
            onClick={() => setShowSendSummaryModal(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleFinalize} className="p-6 space-y-5 text-xs">
          
          {/* Warning banner if unanswered questions */}
          {score.unansweredCount > 0 && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start space-x-2.5 text-amber-800 dark:text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block">Incomplete Checklist Warning</strong>
                <span>
                  {score.unansweredCount} question(s) remain unanswered. Unanswered questions earn 0 points and lower the final score.
                </span>
              </div>
            </div>
          )}

          {/* Audit Score Card */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 uppercase">
                Final Score Calculation
              </span>
              <div className="mt-0.5 flex items-baseline space-x-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  {score.percentage}%
                </span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  ({score.earnedPoints} / {score.maxPossiblePoints} Points)
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                score.percentage >= 85
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200'
              }`}>
                {score.percentage >= 85 ? 'Passed Target' : 'Sub-Threshold'}
              </span>
            </div>
          </div>

          {/* Question Breakdown Counts */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
              <span className="block text-emerald-600 font-bold text-base">{score.passedCount}</span>
              <span className="text-[10px] text-slate-400">Passed</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
              <span className="block text-rose-600 font-bold text-base">{score.failedCount}</span>
              <span className="text-[10px] text-slate-400">Failed</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
              <span className="block text-slate-600 dark:text-slate-300 font-bold text-base">{score.naCount}</span>
              <span className="text-[10px] text-slate-400">N/A</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
              <span className="block text-amber-600 font-bold text-base">{score.unansweredCount}</span>
              <span className="text-[10px] text-slate-400">Unanswered</span>
            </div>
          </div>

          {/* Operation Records Count */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
              <span className="flex items-center space-x-1.5">
                <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                <span>Total Attached Photos / Files</span>
              </span>
              <strong className="font-bold">{totalAttachments}</strong>
            </div>
            <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
              <span className="flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                <span>Recorded Incidents</span>
              </span>
              <strong className={`font-bold ${totalIncidents > 0 ? 'text-rose-600' : ''}`}>{totalIncidents}</strong>
            </div>
            <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
              <span className="flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span>Speed of Service Measurements</span>
              </span>
              <strong className="font-bold">{audit.speedOfService?.isNA ? 'N/A' : totalSosRecords}</strong>
            </div>
          </div>

          {/* Email Recipient Section */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="sendEmailCheck"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <label htmlFor="sendEmailCheck" className="font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                Email finalized report PDF to store owner / manager
              </label>
            </div>

            {sendEmail && (
              <input
                type="email"
                required={sendEmail}
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="store.owner@jollibee.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowSendSummaryModal(false)}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/25 flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Finalizing...' : 'Finalize & Send Audit'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

