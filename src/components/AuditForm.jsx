import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeft, 
  Pause, 
  Send, 
  Download, 
  Info, 
  Clock, 
  AlertTriangle, 
  StickyNote, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  X, 
  HelpCircle, 
  Upload, 
  Trash2, 
  Plus, 
  Calendar, 
  Camera, 
  FileCheck,
  ShieldCheck,
  Sparkles,
  Paperclip
} from 'lucide-react';
import { generateAuditReportPDF } from '../utils/pdfGenerator';

export function AuditForm() {
  const { 
    activeAuditId, 
    audits, 
    questionSets, 
    locations, 
    setCurrentView, 
    updateAuditAnswer, 
    updateAuditSchedule,
    addIncident, 
    removeIncident, 
    addSosRecord, 
    toggleSosNA, 
    addAuditNote, 
    dropdowns, 
    hasPermission, 
    calculateAuditScore,
    systemSettings,
    setShowSendSummaryModal,
    setViewingReportAuditId,
    currentUser,
    showToast
  } = useApp();

  const audit = audits.find(a => a.id === activeAuditId);
  const questionSet = questionSets.find(qs => qs.id === audit?.questionSetId);
  const location = locations.find(l => l.id === audit?.locationId);

  // State for expanded question cards
  const [expandedQuestions, setExpandedQuestions] = useState({});

  // Location Info Modal state
  const [showLocationInfoModal, setShowLocationInfoModal] = useState(false);

  // Speed of Service Add Modal
  const [showAddSosModal, setShowAddSosModal] = useState(false);
  const [sosType, setSosType] = useState(dropdowns.sosTypes[0]?.name || 'Counter');
  const [sosMode, setSosMode] = useState('Single');
  const [sosStartTime, setSosStartTime] = useState('11:00:00 AM');
  const [sosEndTime, setSosEndTime] = useState('11:02:30 AM');
  const [sosDesc, setSosDesc] = useState('');

  // Incidents Add Modal
  const [showAddIncidentModal, setShowAddIncidentModal] = useState(false);
  const [incidentType, setIncidentType] = useState(dropdowns.incidentTypes[0]?.name || 'Road Block');
  const [incidentDesc, setIncidentDesc] = useState('');

  // Notes Add Modal
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');

  // File upload input ref
  const fileInputRefs = useRef({});

  if (!audit || !questionSet) {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-500">No active audit selected.</p>
        <button
          onClick={() => setCurrentView('dashboard')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const calculatedScore = calculateAuditScore(audit, questionSet);

  const toggleExpand = (qId) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  const handleAnswerSelect = (qId, answerValue) => {
    const existing = audit.answers?.[qId] || {};
    // If clicking same answer, keep it or toggle
    updateAuditAnswer(audit.id, qId, {
      answer: answerValue,
      notes: existing.notes,
      attachments: existing.attachments
    });
  };

  const handleNotesChange = (qId, text) => {
    const existing = audit.answers?.[qId] || {};
    updateAuditAnswer(audit.id, qId, {
      answer: existing.answer,
      notes: text,
      attachments: existing.attachments
    });
  };

  const handleFileUpload = (qId, e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    const existing = audit.answers?.[qId] || {};
    const existingAttachments = existing.attachments || [];
    const newFileNames = files.map(f => f.name);

    updateAuditAnswer(audit.id, qId, {
      answer: existing.answer,
      notes: existing.notes,
      attachments: [...existingAttachments, ...newFileNames]
    });
    showToast(`Attached ${files.length} file(s)`, 'success');
  };

  const removeAttachment = (qId, fileName) => {
    const existing = audit.answers?.[qId] || {};
    const updated = (existing.attachments || []).filter(name => name !== fileName);
    updateAuditAnswer(audit.id, qId, {
      answer: existing.answer,
      notes: existing.notes,
      attachments: updated
    });
  };

  // Duration parser for SoS
  const calculateDuration = (startStr, endStr) => {
    try {
      const parseTime = (str) => {
        const parts = str.match(/(\d+):(\d+):?(\d+)?\s*(AM|PM)?/i);
        if (!parts) return null;
        let h = parseInt(parts[1], 10);
        const m = parseInt(parts[2], 10);
        const s = parts[3] ? parseInt(parts[3], 10) : 0;
        const ampm = parts[4]?.toUpperCase();
        if (ampm === 'PM' && h < 12) h += 12;
        if (ampm === 'AM' && h === 12) h = 0;
        return (h * 3600) + (m * 60) + s;
      };

      const sSec = parseTime(startStr);
      const eSec = parseTime(endStr);
      if (sSec !== null && eSec !== null && eSec >= sSec) {
        const diff = eSec - sSec;
        const diffM = Math.floor(diff / 60);
        const diffS = diff % 60;
        return {
          seconds: diff,
          formatted: `${diffM}m ${diffS}s`
        };
      }
    } catch {
      // fallback
    }
    return { seconds: 120, formatted: '2m 00s' };
  };

  const handleSaveSos = (e) => {
    e.preventDefault();
    const dur = calculateDuration(sosStartTime, sosEndTime);
    addSosRecord(audit.id, {
      type: sosType,
      mode: sosMode,
      startTime: sosStartTime,
      endTime: sosEndTime,
      durationSeconds: dur.seconds,
      durationFormatted: dur.formatted,
      description: sosDesc.trim(),
      screenshots: []
    });
    setShowAddSosModal(false);
    setSosDesc('');
  };

  const handleSaveIncident = (e) => {
    e.preventDefault();
    if (!incidentDesc.trim()) return;
    addIncident(audit.id, {
      type: incidentType,
      description: incidentDesc.trim()
    });
    setShowAddIncidentModal(false);
    setIncidentDesc('');
  };

  const handleSaveNote = (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    addAuditNote(audit.id, newNoteText.trim());
    setShowAddNoteModal(false);
    setNewNoteText('');
  };

  const handleDownloadPDF = () => {
    if (!hasPermission('download_report')) {
      showToast('Permission denied: You do not have permission to download reports.', 'error');
      return;
    }
    generateAuditReportPDF(audit, questionSet, calculatedScore, systemSettings);
  };

  const handleSendClick = () => {
    if (!hasPermission('send_audit')) {
      showToast('Permission denied: You do not have permission to send audit reports.', 'error');
      return;
    }
    setViewingReportAuditId(audit.id);
    setShowSendSummaryModal(true);
  };

  const canManageSos = hasPermission('manage_sos');
  const canManageIncidents = hasPermission('manage_incidents');
  const canManageNotes = hasPermission('manage_notes');
  const canDownload = hasPermission('download_report');
  const canSend = hasPermission('send_audit');

  return (
    <div className="space-y-6">
      
      {/* Top Header Bar (Section 6) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sticky top-20 z-30 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Location & Breadcrumb */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Return to Schedule Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                  {audit.locationName}
                </h1>
                <button
                  onClick={() => setShowLocationInfoModal(true)}
                  className="p-1 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors"
                  title="View Location Info & Audit History"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">{audit.questionSetName}</span>
                <span>•</span>
                <span>{audit.organization}</span>
                <span>•</span>
                <span className="font-mono text-slate-400">{audit.reportId}</span>
              </div>
            </div>
          </div>

          {/* Audit Date & Time Pickers (Auto-saved, Section 6) */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="date"
                value={audit.actualDate || audit.scheduledDate}
                onChange={(e) => updateAuditSchedule(audit.id, { actualDate: e.target.value })}
                className="bg-transparent text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
                title="Actual Audit Date (auto-saved)"
              />
            </div>

            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="time"
                value={audit.actualTime || audit.scheduledTime || '10:00'}
                onChange={(e) => updateAuditSchedule(audit.id, { actualTime: e.target.value })}
                className="bg-transparent text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
                title="Actual Audit Time (auto-saved)"
              />
            </div>
          </div>

          {/* Actions: Pause, Download PDF, Send */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
              title="Pause audit and return to dashboard (auto-saved)"
            >
              <Pause className="w-3.5 h-3.5 text-amber-500" />
              <span>Pause</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={!canDownload}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                canDownload
                  ? 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  : 'opacity-50 cursor-not-allowed text-slate-400'
              }`}
              title={!canDownload ? "Requires 'download_report' permission" : "Download current PDF report"}
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download PDF</span>
            </button>

            <button
              onClick={handleSendClick}
              disabled={!canSend}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all ${
                canSend
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/25 active:scale-95'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
              title={!canSend ? "Requires 'send_audit' permission" : "Review & Finalize Audit Report"}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Report</span>
            </button>
          </div>

        </div>

        {/* Live Progress Bar & Quick Stats */}
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
          <div className="flex items-center space-x-4">
            <span>
              Score: <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{calculatedScore.percentage}%</strong> ({calculatedScore.earnedPoints}/{calculatedScore.maxPossiblePoints} pts)
            </span>
            <span>•</span>
            <span>
              Passed: <strong className="text-emerald-600 dark:text-emerald-400">{calculatedScore.passedCount}</strong>
            </span>
            <span>•</span>
            <span>
              Failed: <strong className="text-rose-600 dark:text-rose-400">{calculatedScore.failedCount}</strong>
            </span>
            <span>•</span>
            <span>
              N/A: <strong>{calculatedScore.naCount}</strong>
            </span>
            <span>•</span>
            <span>
              Unanswered: <strong className="text-amber-600 dark:text-amber-400">{calculatedScore.unansweredCount}</strong>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>All changes auto-saved</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Content: Left = Questions List, Right = Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Scrollable List of Question Blocks (Left 2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Audit Checklist ({questionSet.questions.length} Items)
            </h2>
            <div className="text-xs text-slate-400">
              Select Yes, No, or N/A for each question
            </div>
          </div>

          {questionSet.questions.map((q, idx) => {
            const answerData = audit.answers?.[q.id] || { answer: null, notes: '', attachments: [] };
            const isExpanded = expandedQuestions[q.id];
            const answer = answerData.answer;

            return (
              <div 
                key={q.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all ${
                  answer === 'Yes' 
                    ? 'border-emerald-200 dark:border-emerald-900/60 shadow-xs' 
                    : answer === 'No'
                    ? 'border-rose-200 dark:border-rose-900/60 shadow-xs'
                    : answer === 'N/A'
                    ? 'border-slate-300 dark:border-slate-700'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Question Header & Summary */}
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    
                    <div className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center justify-center mt-0.5">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 uppercase">
                            {q.category}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            {q.points} Points
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                          {q.text}
                        </h3>
                        {q.guideline && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">
                            Guideline: {q.guideline}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Chevron to expand details */}
                    <button
                      onClick={() => toggleExpand(q.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title={isExpanded ? 'Collapse notes and attachments' : 'Expand notes and file attachments'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Yes / No / N/A Answer Buttons */}
                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center space-x-2">
                      {/* Yes Button */}
                      <button
                        onClick={() => handleAnswerSelect(q.id, 'Yes')}
                        className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          answer === 'Yes'
                            ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 ring-2 ring-emerald-500/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Yes</span>
                        <span className="text-[10px] opacity-80">(+{q.points})</span>
                      </button>

                      {/* No Button */}
                      <button
                        onClick={() => handleAnswerSelect(q.id, 'No')}
                        className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          answer === 'No'
                            ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30 ring-2 ring-rose-500/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600'
                        }`}
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>No</span>
                        <span className="text-[10px] opacity-80">(0 pts)</span>
                      </button>

                      {/* N/A Button */}
                      <button
                        onClick={() => handleAnswerSelect(q.id, 'N/A')}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          answer === 'N/A'
                            ? 'bg-slate-700 text-white dark:bg-slate-600 shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        <span>N/A</span>
                      </button>
                    </div>

                    {/* Attachment & Notes indicator badges */}
                    <div className="flex items-center space-x-2 text-xs text-slate-400">
                      {answerData.attachments?.length > 0 && (
                        <span className="flex items-center space-x-1 text-indigo-600 dark:text-indigo-400 font-medium">
                          <Paperclip className="w-3.5 h-3.5" />
                          <span>{answerData.attachments.length}</span>
                        </span>
                      )}
                      {answerData.notes && (
                        <span className="flex items-center space-x-1 text-slate-500 dark:text-slate-400">
                          <StickyNote className="w-3.5 h-3.5" />
                        </span>
                      )}
                      <button
                        onClick={() => toggleExpand(q.id)}
                        className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        {isExpanded ? 'Hide Details' : 'Add Details'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Section: Photo/File Upload & Notes Textarea */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4 animate-in fade-in duration-200">
                      
                      {/* Description / Comment Text Area */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Auditor Comment / Findings Description
                        </label>
                        <textarea
                          rows={2}
                          value={answerData.notes || ''}
                          onChange={(e) => handleNotesChange(q.id, e.target.value)}
                          placeholder="Provide specific context or justification for this score..."
                          className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      {/* File / Photo Attachments Dropzone (Section 6) */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Photo & Document Attachments (JPG, PNG, WebP, PDF)
                          </label>
                          <span className="text-[10px] text-slate-400">
                            Drag & drop or click browse
                          </span>
                        </div>

                        <input
                          type="file"
                          multiple
                          accept="image/*,.pdf,.doc,.docx"
                          ref={el => fileInputRefs.current[q.id] = el}
                          onChange={(e) => handleFileUpload(q.id, e)}
                          className="hidden"
                        />

                        {/* Drop Zone Box */}
                        <div 
                          onClick={() => fileInputRefs.current[q.id]?.click()}
                          className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-xl p-4 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-800/30 transition-colors"
                        >
                          <Upload className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Upload photos or audit documentation
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Files are automatically saved with the answer
                          </p>
                        </div>

                        {/* Attachments List */}
                        {answerData.attachments?.length > 0 && (
                          <div className="mt-2.5 flex flex-wrap gap-2">
                            {answerData.attachments.map((fileName, fIdx) => (
                              <div
                                key={fIdx}
                                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs"
                              >
                                <Paperclip className="w-3 h-3 text-indigo-400" />
                                <span className="font-medium truncate max-w-[150px]">{fileName}</span>
                                <button
                                  type="button"
                                  onClick={() => removeAttachment(q.id, fileName)}
                                  className="text-indigo-400 hover:text-rose-500"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>

        {/* Side Panel: Speed of Service, Incidents, Notes (Right Column) */}
        <div className="space-y-6">
          
          {/* Card 1: Speed of Service (Section 7) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Speed of Service
                </h3>
              </div>
              
              {/* Mark as N/A toggle */}
              <button
                onClick={() => toggleSosNA(audit.id)}
                disabled={!canManageSos}
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-md transition-colors ${
                  audit.speedOfService?.isNA
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60'
                }`}
                title="Mark speed of service as Not Applicable for this audit"
              >
                {audit.speedOfService?.isNA ? 'N/A (Excluded)' : 'Mark as N/A'}
              </button>
            </div>

            {audit.speedOfService?.isNA ? (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center text-xs text-slate-400">
                Speed of Service is marked as Not Applicable for this audit.
              </div>
            ) : (
              <>
                {/* Records List */}
                {audit.speedOfService?.records?.length > 0 ? (
                  <div className="space-y-2.5">
                    {audit.speedOfService.records.map((rec) => (
                      <div 
                        key={rec.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {rec.type} <span className="font-normal text-slate-400">({rec.mode})</span>
                          </span>
                          <span className="font-black text-indigo-600 dark:text-indigo-400">
                            {rec.durationFormatted}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {rec.startTime} &rarr; {rec.endTime}
                        </div>
                        {rec.description && (
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 italic">
                            "{rec.description}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    No service timings recorded yet.
                  </p>
                )}

                {/* Add Timing Button */}
                <button
                  onClick={() => setShowAddSosModal(true)}
                  disabled={!canManageSos}
                  className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors ${
                    canManageSos
                      ? 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Timing Measurement</span>
                </button>
              </>
            )}
          </div>

          {/* Card 2: Incidents (Section 8) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Reported Incidents
                </h3>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                {audit.incidents?.length || 0}
              </span>
            </div>

            {audit.incidents?.length > 0 ? (
              <div className="space-y-2.5">
                {audit.incidents.map((inc) => (
                  <div
                    key={inc.id}
                    className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/60 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-700 dark:text-rose-300">
                        {inc.type}
                      </span>
                      {canManageIncidents && (
                        <button
                          onClick={() => removeIncident(audit.id, inc.id)}
                          className="text-rose-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 text-xs">
                      {inc.description}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {inc.reportedAt}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                No incidents reported during this audit.
              </p>
            )}

            <button
              onClick={() => setShowAddIncidentModal(true)}
              disabled={!canManageIncidents}
              className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors ${
                canManageIncidents
                  ? 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Report Incident</span>
            </button>
          </div>

          {/* Card 3: Notes & Location Log (Section 9) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <StickyNote className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Auditor Notes & Log
                </h3>
              </div>
            </div>

            {audit.notes?.length > 0 ? (
              <div className="space-y-2">
                {audit.notes.map((n) => (
                  <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs">
                    <p className="text-slate-800 dark:text-slate-200">{n.text}</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {n.author} • {n.date}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                No general notes added yet.
              </p>
            )}

            <button
              onClick={() => setShowAddNoteModal(true)}
              disabled={!canManageNotes}
              className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors ${
                canManageNotes
                  ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Note</span>
            </button>
          </div>

        </div>

      </div>

      {/* MODAL 1: Add Speed of Service Timing (Section 7) */}
      {showAddSosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Record Speed of Service
              </h3>
              <button onClick={() => setShowAddSosModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSos} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Service Type
                </label>
                <select
                  value={sosType}
                  onChange={(e) => setSosType(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  {dropdowns.sosTypes.map(t => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Record Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSosMode('Single')}
                    className={`py-2 rounded-xl font-bold ${sosMode === 'Single' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                  >
                    Single Timing
                  </button>
                  <button
                    type="button"
                    onClick={() => setSosMode('Average')}
                    className={`py-2 rounded-xl font-bold ${sosMode === 'Average' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                  >
                    Average Mode
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="text"
                    value={sosStartTime}
                    onChange={(e) => setSosStartTime(e.target.value)}
                    placeholder="11:00:00 AM"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    End Time
                  </label>
                  <input
                    type="text"
                    value={sosEndTime}
                    onChange={(e) => setSosEndTime(e.target.value)}
                    placeholder="11:02:30 AM"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Service Observation
                </label>
                <textarea
                  rows={2}
                  value={sosDesc}
                  onChange={(e) => setSosDesc(e.target.value)}
                  placeholder="e.g. Counter transaction order placed to receipt handoff"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSosModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Add Measurement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Report Incident (Section 8) */}
      {showAddIncidentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-rose-600 dark:text-rose-400 flex items-center space-x-1.5">
                <AlertTriangle className="w-5 h-5" />
                <span>Report Audit Incident</span>
              </h3>
              <button onClick={() => setShowAddIncidentModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveIncident} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Incident Type
                </label>
                <select
                  value={incidentType}
                  onChange={(e) => setIncidentType(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  {dropdowns.incidentTypes.map(t => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Incident Description & Details
                </label>
                <textarea
                  rows={3}
                  required
                  value={incidentDesc}
                  onChange={(e) => setIncidentDesc(e.target.value)}
                  placeholder="Detail the issue, persons involved, and immediate containment..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddIncidentModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  Log Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Location Info & Previous History (Section 9) */}
      {showLocationInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Location Information
                </h3>
                <p className="text-xs text-slate-500">{location?.name}</p>
              </div>
              <button onClick={() => setShowLocationInfoModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <p><strong>Address:</strong> {location?.address}</p>
                <p><strong>Organization:</strong> {location?.organization}</p>
                <p><strong>Brand:</strong> {location?.brand} ({location?.segment})</p>
                <p><strong>Store Email:</strong> {location?.ownerEmail || 'Not specified'}</p>
                <p><strong>Tags:</strong> {location?.tags?.join(', ') || 'None'}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Previous Audit History</h4>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {audits.filter(a => a.locationId === location?.id).map(a => (
                    <div key={a.id} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs flex justify-between">
                      <span>{a.reportId} ({a.scheduledDate})</span>
                      <span className="font-bold">{a.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowLocationInfoModal(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Add General Note */}
      {showAddNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Add Auditor Note
              </h3>
              <button onClick={() => setShowAddNoteModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Note Content
                </label>
                <textarea
                  rows={3}
                  required
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Enter observation or shift remark..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddNoteModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

