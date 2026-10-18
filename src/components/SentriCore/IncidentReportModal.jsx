import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Save, 
  Send, 
  CheckCircle2, 
  RotateCcw, 
  Ban, 
  Download, 
  Camera, 
  Paperclip, 
  AlertTriangle, 
  ShieldAlert,
  Building,
  Calendar,
  Clock,
  User,
  MapPin,
  FileText
} from 'lucide-react';
import { generateIncidentReportPDF } from '../../utils/pdfGenerator';

export function IncidentReportModal() {
  const { 
    showIncidentReportModal, 
    setShowIncidentReportModal, 
    activeIncidentReportId, 
    setActiveIncidentReportId,
    incidentReports, 
    createIncidentReport, 
    updateIncidentReport, 
    sendIncidentReportForReview, 
    reviewAndCloseIncidentReport, 
    sendBackIncidentReport, 
    reopenIncidentReport, 
    voidIncidentReport,
    locations, 
    dropdowns, 
    currentUser, 
    hasPermission, 
    systemSettings,
    showToast 
  } = useApp();

  const isEditing = Boolean(activeIncidentReportId);
  const existingReport = incidentReports.find(r => r.id === activeIncidentReportId);

  // Form State
  const [synopsisNumber, setSynopsisNumber] = useState('');
  const [creationDate, setCreationDate] = useState('');
  const [reportedBy, setReportedBy] = useState('');
  const [locationId, setLocationId] = useState('');
  const [reportType, setReportType] = useState('Observation'); // Observation, Client Reported, Audit
  const [area, setArea] = useState('Perimeter'); // Perimeter, Inner Zone
  const [incidentTitle, setIncidentTitle] = useState('Trespassing');
  const [riskLevel, setRiskLevel] = useState('Medium'); // Low, Medium, High, N/A
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('14:00');
  const [narrative, setNarrative] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [evidenceImages, setEvidenceImages] = useState([]);

  useEffect(() => {
    if (existingReport) {
      setSynopsisNumber(existingReport.synopsisNumber);
      setCreationDate(existingReport.creationDate);
      setReportedBy(existingReport.reportedBy);
      setLocationId(existingReport.locationId);
      setReportType(existingReport.reportType || 'Observation');
      setArea(existingReport.area || 'Perimeter');
      setIncidentTitle(existingReport.incidentTitle || 'Trespassing');
      setRiskLevel(existingReport.riskLevel || 'Medium');
      setEventDate(existingReport.eventDate || existingReport.creationDate);
      setEventTime(existingReport.eventTime || '12:00');
      setNarrative(existingReport.narrative || '');
      setActionTaken(existingReport.actionTaken || '');
      setEvidenceImages(existingReport.evidenceImages || []);
    } else {
      const today = new Date().toISOString().split('T')[0];
      const nowTime = new Date().toTimeString().substring(0, 5);
      const generatedNumber = `SC-${today.replace(/-/g, '')}-${String(incidentReports.length + 42).padStart(4, '0')}`;
      
      setSynopsisNumber(generatedNumber);
      setCreationDate(today);
      setReportedBy(currentUser?.name || 'Security Operator');
      setLocationId(locations[0]?.id || '');
      setReportType('Observation');
      setArea('Perimeter');
      setIncidentTitle(dropdowns.sentriIncidentTitles?.[0]?.name || 'Trespassing');
      setRiskLevel('Medium');
      setEventDate(today);
      setEventTime(nowTime);
      setNarrative('');
      setActionTaken('');
      setEvidenceImages([]);
    }
  }, [existingReport, showIncidentReportModal]);

  if (!showIncidentReportModal) return null;

  const currentStatus = existingReport ? existingReport.status : 'Pending';
  const isClosed = currentStatus === 'Closed';
  const isVoid = currentStatus === 'Void';

  // Permissions
  const canSendForReview = hasPermission('send_incident_report');
  const canManageSupervisor = hasPermission('manage_incident_reports');
  const canEditClosed = hasPermission('edit_closed_incident_report');
  const canDownload = hasPermission('download_sentri_report');

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const names = files.map(f => f.name);
    setEvidenceImages(prev => [...prev, ...names]);
    showToast(`Added ${names.length} image attachment(s)`, 'success');
  };

  const removeEvidence = (fileName) => {
    setEvidenceImages(prev => prev.filter(n => n !== fileName));
  };

  const handleSave = (submitDirectly = false) => {
    const targetLoc = locations.find(l => l.id === locationId);

    const reportPayload = {
      locationId,
      locationName: targetLoc ? targetLoc.name : 'Configured Location',
      reportType,
      area,
      incidentTitle,
      riskLevel,
      eventDate,
      eventTime,
      narrative: narrative.trim(),
      actionTaken: actionTaken.trim(),
      evidenceImages,
      reportedBy
    };

    if (isEditing) {
      updateIncidentReport(existingReport.id, reportPayload);
      if (submitDirectly && canSendForReview) {
        sendIncidentReportForReview(existingReport.id);
      }
    } else {
      createIncidentReport(reportPayload, submitDirectly);
    }

    setShowIncidentReportModal(false);
    setActiveIncidentReportId(null);
  };

  const handleDownloadPDF = () => {
    if (!existingReport) return;
    generateIncidentReportPDF(existingReport, systemSettings);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50 shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 uppercase">
                SENTRI CORE INCIDENT REPORT
              </span>
              <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                {synopsisNumber}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                currentStatus === 'Closed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                currentStatus === 'In Review' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                currentStatus === 'Void' ? 'bg-slate-200 text-slate-700' :
                'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
              }`}>
                {currentStatus}
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1">
              {isEditing ? `Review Incident: ${incidentTitle}` : 'Create Security Incident Report'}
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            {isEditing && canDownload && (
              <button
                onClick={handleDownloadPDF}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Download Official Incident Report PDF"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => {
                setShowIncidentReportModal(false);
                setActiveIncidentReportId(null);
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          
          {/* Top Audit-Trail Strip (Immutable fields from Section 19) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px]">
            <div>
              <span className="text-slate-400 font-semibold block">Synopsis Number (Immutable)</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{synopsisNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">Creation Date (Auto-filled)</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{creationDate}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">Reported By</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{reportedBy}</span>
            </div>
          </div>

          {/* Location & Categorization */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Client / Location <span className="text-rose-500">*</span>
              </label>
              <select
                disabled={isClosed}
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Report Type <span className="text-rose-500">*</span>
              </label>
              <select
                disabled={isClosed}
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="Observation">Observation</option>
                <option value="Client Reported">Client Reported</option>
                <option value="Audit">Audit</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Security Area Zone <span className="text-rose-500">*</span>
              </label>
              <select
                disabled={isClosed}
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="Perimeter">Perimeter</option>
                <option value="Inner Zone">Inner Zone</option>
              </select>
            </div>
          </div>

          {/* Incident Title & Risk Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Incident Title (Technical Category) <span className="text-rose-500">*</span>
              </label>
              <select
                disabled={isClosed}
                value={incidentTitle}
                onChange={(e) => setIncidentTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
              >
                {dropdowns.sentriIncidentTitles?.map(t => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assessed Risk Level <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['Low', 'Medium', 'High', 'N/A'].map(level => (
                  <button
                    key={level}
                    type="button"
                    disabled={isClosed}
                    onClick={() => setRiskLevel(level)}
                    className={`py-2 rounded-xl font-bold transition-all ${
                      riskLevel === level
                        ? level === 'High' ? 'bg-rose-600 text-white shadow-xs'
                        : level === 'Medium' ? 'bg-amber-600 text-white shadow-xs'
                        : level === 'Low' ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Event Date & Event Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Event Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                disabled={isClosed}
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Event Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                disabled={isClosed}
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
              />
            </div>
          </div>

          {/* Narrative */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Incident Narrative (Detailed Description of Events) <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              disabled={isClosed}
              required
              value={narrative}
              onChange={(e) => setNarrative(e.target.value)}
              placeholder="Detail observations, camera feeds monitored, individuals, and chronological timeline..."
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          {/* Action Taken */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Action Taken by Operators / Supervisors <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              disabled={isClosed}
              required
              value={actionTaken}
              onChange={(e) => setActionTaken(e.target.value)}
              placeholder="e.g. Guard dispatched, area quarantined, manager briefed, police report filed..."
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          {/* Evidence Attachments */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Evidence Images & Camera Captures
              </label>
              {!isClosed && (
                <label className="cursor-pointer text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center space-x-1">
                  <Camera className="w-3.5 h-3.5" />
                  <span>Upload / Add Files</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {evidenceImages.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {evidenceImages.map((img, i) => (
                  <div key={i} className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <Paperclip className="w-3 h-3 text-slate-400" />
                    <span className="font-medium text-slate-700 dark:text-slate-200">{img}</span>
                    {!isClosed && (
                      <button type="button" onClick={() => removeEvidence(img)} className="text-slate-400 hover:text-rose-500 ml-1">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 italic">No evidence images attached.</p>
            )}
          </div>

          {/* Workflow Sign-off Status Info */}
          {existingReport && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
              <span>
                Status: <strong className="text-slate-900 dark:text-white">{existingReport.status}</strong>
                {existingReport.reviewerName && ` • Reviewed by ${existingReport.reviewerName}`}
                {existingReport.closedDate && ` on ${existingReport.closedDate}`}
              </span>
            </div>
          )}

        </div>

        {/* Modal Footer Workflow Actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50 dark:bg-slate-800/40 shrink-0">
          
          <div className="flex items-center space-x-2">
            {/* If In Review and supervisor: Close or Send Back */}
            {currentStatus === 'In Review' && canManageSupervisor && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    reviewAndCloseIncidentReport(existingReport.id);
                    setShowIncidentReportModal(false);
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center space-x-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Review & Close Report</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sendBackIncidentReport(existingReport.id);
                    setShowIncidentReportModal(false);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
                >
                  Send Back to Author
                </button>
              </>
            )}

            {/* If Closed: Reopen (requires edit_closed_incident_report) */}
            {isClosed && canEditClosed && (
              <button
                type="button"
                onClick={() => {
                  reopenIncidentReport(existingReport.id);
                  setShowIncidentReportModal(false);
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white flex items-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reopen Report (Manager)</span>
              </button>
            )}

            {/* Void Report (Manager) */}
            {existingReport && !isVoid && (canManageSupervisor || canEditClosed) && (
              <button
                type="button"
                onClick={() => {
                  voidIncidentReport(existingReport.id);
                  setShowIncidentReportModal(false);
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-600"
              >
                Void Report
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                setShowIncidentReportModal(false);
                setActiveIncidentReportId(null);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400"
            >
              Cancel
            </button>

            {!isClosed && (
              <>
                <button
                  type="button"
                  onClick={() => handleSave(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-300"
                >
                  Save as Draft (Pending)
                </button>

                <button
                  type="button"
                  onClick={() => handleSave(true)}
                  disabled={!canSendForReview}
                  className={`px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center space-x-1.5 ${
                    canSendForReview
                      ? 'bg-rose-600 hover:bg-rose-700 shadow-sm'
                      : 'bg-slate-300 dark:bg-slate-800 cursor-not-allowed'
                  }`}
                  title={!canSendForReview ? "Requires 'send_incident_report' permission" : "Submit for review"}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send for Review</span>
                </button>
              </>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

