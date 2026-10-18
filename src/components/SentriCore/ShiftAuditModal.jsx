import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Save, 
  Check, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Clock, 
  Building2, 
  User, 
  FileText,
  PenTool
} from 'lucide-react';
import { generateShiftAuditPDF } from '../../utils/pdfGenerator';

export function ShiftAuditModal() {
  const { 
    showShiftAuditModal, 
    setShowShiftAuditModal, 
    activeShiftAuditId, 
    setActiveShiftAuditId,
    shiftAudits, 
    createShiftAudit, 
    updateShiftAudit, 
    submitShiftAudit,
    locations, 
    currentUser, 
    hasPermission, 
    systemSettings,
    showToast 
  } = useApp();

  const isEditing = Boolean(activeShiftAuditId);
  const existingAudit = shiftAudits.find(a => a.id === activeShiftAuditId);

  // Form State
  const [auditNumber, setAuditNumber] = useState('');
  const [locationId, setLocationId] = useState('');
  const [shiftDate, setShiftDate] = useState('');
  const [shiftHours, setShiftHours] = useState('08:00 - 16:00 (Day Shift)');
  const [operatorName, setOperatorName] = useState('');
  const [operatorId, setOperatorId] = useState('OP-101');
  const [facilityZone, setFacilityZone] = useState('Mall'); // Office Tower, Mall, Parking
  const [sections, setSections] = useState({
    hardware: {
      ptzCameras: { checked: true, note: 'All PTZ motors operational' },
      recordingServer: { checked: true, note: 'Storage retention OK' },
      monitorWall: { checked: true, note: 'Matrix display online' }
    },
    perimeter: {
      fenceIntegrity: { checked: true, note: 'Physical barrier intact' },
      accessDoorsAlarmed: { checked: true, note: 'Access contact closures verified' },
      barrierGates: { checked: true, note: 'Entry boom gates responsive' }
    },
    highRisk: {
      cashDropArea: { checked: true, note: 'Safe zone camera verified' },
      loadingDock: { checked: true, note: 'Overhead door sensors checked' },
      keyControlLog: { checked: true, note: 'Key custody log verified' }
    }
  });
  const [handoverSummary, setHandoverSummary] = useState('');
  const [pendingItems, setPendingItems] = useState('');
  const [operatorSignature, setOperatorSignature] = useState('');

  useEffect(() => {
    if (existingAudit) {
      setAuditNumber(existingAudit.auditNumber);
      setLocationId(existingAudit.locationId);
      setShiftDate(existingAudit.shiftDate);
      setShiftHours(existingAudit.shiftHours);
      setOperatorName(existingAudit.operatorName);
      setOperatorId(existingAudit.operatorId);
      setFacilityZone(existingAudit.facilityZone || 'Mall');
      setSections(existingAudit.sections || {});
      setHandoverSummary(existingAudit.handoverSummary || '');
      setPendingItems(existingAudit.pendingItems || '');
      setOperatorSignature(existingAudit.operatorSignature || '');
    } else {
      const today = new Date().toISOString().split('T')[0];
      setAuditNumber(`SA-${today.replace(/-/g, '')}-0${shiftAudits.length + 1}`);
      setLocationId(locations[0]?.id || '');
      setShiftDate(today);
      setShiftHours('08:00 - 16:00 (Day Shift)');
      setOperatorName(currentUser?.name || 'Surveillance Operator');
      setOperatorId('OP-' + Math.floor(100 + Math.random() * 900));
      setFacilityZone('Mall');
      setHandoverSummary('');
      setPendingItems('');
      setOperatorSignature('');
    }
  }, [existingAudit, showShiftAuditModal]);

  if (!showShiftAuditModal) return null;

  const isSubmitted = existingAudit?.status === 'Submitted';
  const canEditSubmit = hasPermission('manage_sentri_audits');
  const canDownload = hasPermission('download_sentri_report');

  const toggleCheck = (sectionKey, itemKey) => {
    if (isSubmitted) return;
    setSections(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [itemKey]: {
          ...prev[sectionKey][itemKey],
          checked: !prev[sectionKey][itemKey].checked
        }
      }
    }));
  };

  const handleNoteChange = (sectionKey, itemKey, text) => {
    if (isSubmitted) return;
    setSections(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [itemKey]: {
          ...prev[sectionKey][itemKey],
          note: text
        }
      }
    }));
  };

  const handleSaveDraft = () => {
    const loc = locations.find(l => l.id === locationId);
    const payload = {
      locationId,
      locationName: loc ? loc.name : 'Location',
      shiftDate,
      shiftHours,
      operatorName,
      operatorId,
      facilityZone,
      sections,
      handoverSummary,
      pendingItems,
      operatorSignature
    };

    if (isEditing) {
      updateShiftAudit(existingAudit.id, payload);
    } else {
      createShiftAudit(payload);
    }

    setShowShiftAuditModal(false);
    setActiveShiftAuditId(null);
  };

  const handleSubmitAudit = () => {
    if (!operatorSignature.trim()) {
      showToast('Please provide your operator signature before submitting', 'error');
      return;
    }

    const loc = locations.find(l => l.id === locationId);
    const payload = {
      locationId,
      locationName: loc ? loc.name : 'Location',
      shiftDate,
      shiftHours,
      operatorName,
      operatorId,
      facilityZone,
      sections,
      handoverSummary,
      pendingItems,
      operatorSignature
    };

    let targetId = existingAudit?.id;
    if (!isEditing) {
      const created = createShiftAudit(payload);
      targetId = created?.id;
    } else {
      updateShiftAudit(existingAudit.id, payload);
    }

    if (targetId) {
      submitShiftAudit(targetId, operatorSignature);
    }

    setShowShiftAuditModal(false);
    setActiveShiftAuditId(null);
  };

  const handleDownloadPDF = () => {
    if (!existingAudit) return;
    generateShiftAuditPDF(existingAudit, systemSettings);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50 shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 uppercase">
                SURVEILLANCE SHIFT AUDIT
              </span>
              <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                {auditNumber}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isSubmitted ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}>
                {isSubmitted ? 'Submitted' : 'In Progress'}
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1">
              Surveillance Operator Shift Inspection
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            {isSubmitted && canDownload && (
              <button
                onClick={handleDownloadPDF}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Download Shift Audit Report (PDF)"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => {
                setShowShiftAuditModal(false);
                setActiveShiftAuditId(null);
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          
          {/* Shift Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Location</label>
              <select
                disabled={isSubmitted}
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
              >
                {locations.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Shift Date</label>
              <input
                type="date"
                disabled={isSubmitted}
                value={shiftDate}
                onChange={(e) => setShiftDate(e.target.value)}
                className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Shift Hours</label>
              <input
                type="text"
                disabled={isSubmitted}
                value={shiftHours}
                onChange={(e) => setShiftHours(e.target.value)}
                placeholder="08:00 - 16:00"
                className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Facility Zone (Section 22)</label>
              <select
                disabled={isSubmitted}
                value={facilityZone}
                onChange={(e) => setFacilityZone(e.target.value)}
                className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
              >
                <option value="Office Tower">Office Tower</option>
                <option value="Mall">Mall</option>
                <option value="Parking">Parking</option>
              </select>
            </div>
          </div>

          {/* Checklist Sections (Section 22) */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider text-[11px] text-indigo-600 dark:text-indigo-400">
              Checklist Sections & Hardware Verifications
            </h3>

            {/* Section 1: Hardware & Cameras */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
              <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                1. Camera & Hardware Checks
              </h4>
              <div className="space-y-2">
                {[
                  { key: 'ptzCameras', label: 'PTZ Cameras Operational & Zoom Calibration' },
                  { key: 'recordingServer', label: 'NVR / Video Recording Servers Online & Retention Log' },
                  { key: 'monitorWall', label: 'Surveillance Monitor Wall & Video Matrix Optimal' }
                ].map(item => {
                  const data = sections.hardware?.[item.key] || { checked: false, note: '' };
                  return (
                    <div key={item.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                      <label className="flex items-center space-x-2.5 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          disabled={isSubmitted}
                          checked={data.checked}
                          onChange={() => toggleCheck('hardware', item.key)}
                          className="w-4 h-4 text-indigo-600 rounded"
                        />
                        <span className="font-medium text-slate-800 dark:text-slate-200">{item.label}</span>
                      </label>
                      <input
                        type="text"
                        disabled={isSubmitted}
                        value={data.note}
                        onChange={(e) => handleNoteChange('hardware', item.key, e.target.value)}
                        placeholder="Finding / verification note..."
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs w-full sm:w-64"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Perimeter & Access Control */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
              <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                2. Perimeter & Access Control
              </h4>
              <div className="space-y-2">
                {[
                  { key: 'fenceIntegrity', label: 'Perimeter Fence & Boundary Wall Sweep' },
                  { key: 'accessDoorsAlarmed', label: 'Emergency Exit Doors & Contact Sensors Active' },
                  { key: 'barrierGates', label: 'Driveway Boom Gates & Reader Access Verification' }
                ].map(item => {
                  const data = sections.perimeter?.[item.key] || { checked: false, note: '' };
                  return (
                    <div key={item.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                      <label className="flex items-center space-x-2.5 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          disabled={isSubmitted}
                          checked={data.checked}
                          onChange={() => toggleCheck('perimeter', item.key)}
                          className="w-4 h-4 text-indigo-600 rounded"
                        />
                        <span className="font-medium text-slate-800 dark:text-slate-200">{item.label}</span>
                      </label>
                      <input
                        type="text"
                        disabled={isSubmitted}
                        value={data.note}
                        onChange={(e) => handleNoteChange('perimeter', item.key, e.target.value)}
                        placeholder="Finding / verification note..."
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs w-full sm:w-64"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 3: High-Risk Zones & Cash Safe Monitoring */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
              <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                3. High-Risk Zones & Vault / Cash Monitoring
              </h4>
              <div className="space-y-2">
                {[
                  { key: 'cashDropArea', label: 'Cash Drawer Safe & Drop Box Camera Coverage' },
                  { key: 'loadingDock', label: 'Back Delivery Loading Dock Monitored During Unload' },
                  { key: 'keyControlLog', label: 'Key Control Log & Lockbox Custody Verified' }
                ].map(item => {
                  const data = sections.highRisk?.[item.key] || { checked: false, note: '' };
                  return (
                    <div key={item.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                      <label className="flex items-center space-x-2.5 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          disabled={isSubmitted}
                          checked={data.checked}
                          onChange={() => toggleCheck('highRisk', item.key)}
                          className="w-4 h-4 text-indigo-600 rounded"
                        />
                        <span className="font-medium text-slate-800 dark:text-slate-200">{item.label}</span>
                      </label>
                      <input
                        type="text"
                        disabled={isSubmitted}
                        value={data.note}
                        onChange={(e) => handleNoteChange('highRisk', item.key, e.target.value)}
                        placeholder="Finding / verification note..."
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs w-full sm:w-64"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Handover & Pending Items (Section 22) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Handover Summary (Shift End Activity) <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                disabled={isSubmitted}
                value={handoverSummary}
                onChange={(e) => setHandoverSummary(e.target.value)}
                placeholder="Summarize key shift observations, visitor activities, and relief briefing..."
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Pending Items / Follow-ups for Next Shift
              </label>
              <textarea
                rows={3}
                disabled={isSubmitted}
                value={pendingItems}
                onChange={(e) => setPendingItems(e.target.value)}
                placeholder="Action items, equipment needing check, incoming delivery notice..."
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Operator Signature (Section 22) */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                  <PenTool className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Operator Confirmation & Signature</span>
                </label>
                <p className="text-[11px] text-slate-500">
                  Electronic sign-off confirming that all required surveillance checks were performed.
                </p>
              </div>

              <input
                type="text"
                disabled={isSubmitted}
                value={operatorSignature}
                onChange={(e) => setOperatorSignature(e.target.value)}
                placeholder="Type Full Name (Signature)"
                className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 font-bold text-slate-900 dark:text-white text-xs w-full sm:w-64"
              />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40 shrink-0">
          <button
            type="button"
            onClick={() => {
              setShowShiftAuditModal(false);
              setActiveShiftAuditId(null);
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400"
          >
            Close
          </button>

          {!isSubmitted && (
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-300"
              >
                Save Draft (In Progress)
              </button>

              <button
                type="button"
                onClick={handleSubmitAudit}
                disabled={!canEditSubmit}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center space-x-1.5 ${
                  canEditSubmit
                    ? 'bg-indigo-600 hover:bg-indigo-700 shadow-sm'
                    : 'bg-slate-300 dark:bg-slate-800 cursor-not-allowed'
                }`}
                title={!canEditSubmit ? "Requires 'manage_sentri_audits' permission" : "Finalize and submit shift audit"}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Submit Shift Audit</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

