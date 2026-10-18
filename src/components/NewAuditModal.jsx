import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Plus, Building, MapPin, Sparkles, Check, AlertCircle } from 'lucide-react';

export function NewAuditModal() {
  const { 
    showNewAuditModal, 
    setShowNewAuditModal, 
    locations, 
    createLocation, 
    questionSets, 
    createAudit, 
    currentUser,
    hasPermission
  } = useApp();

  const [locationId, setLocationId] = useState(locations[0]?.id || '');
  const [questionSetId, setQuestionSetId] = useState(questionSets[0]?.id || '');
  const [scheduledDate, setScheduledDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [scheduledTime, setScheduledTime] = useState('10:00');
  const [auditor, setAuditor] = useState(currentUser?.name || '');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [brand, setBrand] = useState('Jollibee');
  const [segment, setSegment] = useState('QSR');
  const [tagsInput, setTagsInput] = useState('Drive-thru, Core');
  const [posCount, setPosCount] = useState(4);
  const [contracted, setContracted] = useState(true);
  const [ticketsCount, setTicketsCount] = useState(300);

  // Inline Location Modal State
  const [isAddingLocationInline, setIsAddingLocationInline] = useState(false);
  const [inlineLocName, setInlineLocName] = useState('');
  const [inlineLocAddress, setInlineLocAddress] = useState('');
  const [inlineLocOrg, setInlineLocOrg] = useState('Jollibee Foods Corp');
  const [inlineLocBrand, setInlineLocBrand] = useState('Jollibee');
  const [inlineLocSegment, setInlineLocSegment] = useState('QSR');
  const [inlineLocOwnerEmail, setInlineLocOwnerEmail] = useState('');

  if (!showNewAuditModal) return null;

  const handleSaveInlineLocation = (e) => {
    e.preventDefault();
    if (!inlineLocName.trim()) return;

    const created = createLocation({
      name: inlineLocName.trim(),
      address: inlineLocAddress.trim() || 'Store Location',
      organization: inlineLocOrg.trim() || 'Jollibee Foods Corp',
      brand: inlineLocBrand.trim() || 'Jollibee',
      segment: inlineLocSegment.trim() || 'QSR',
      tags: ['Inline-Created'],
      ownerEmail: inlineLocOwnerEmail.trim()
    });

    setLocationId(created.id);
    if (created.brand) setBrand(created.brand);
    if (created.segment) setSegment(created.segment);
    if (created.ownerEmail) setOwnerEmail(created.ownerEmail);
    setIsAddingLocationInline(false);
    // Reset inline form
    setInlineLocName('');
    setInlineLocAddress('');
  };

  const handleLocationChange = (e) => {
    const selectedId = e.target.value;
    setLocationId(selectedId);
    const loc = locations.find(l => l.id === selectedId);
    if (loc) {
      if (loc.brand) setBrand(loc.brand);
      if (loc.segment) setSegment(loc.segment);
      if (loc.ownerEmail) setOwnerEmail(loc.ownerEmail);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const loc = locations.find(l => l.id === locationId);
    const qSet = questionSets.find(qs => qs.id === questionSetId);

    if (!loc || !qSet || !scheduledDate) return;

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

    createAudit({
      locationId: loc.id,
      locationName: loc.name,
      organization: loc.organization || 'Jollibee Foods Corp',
      brand: brand || loc.brand || 'Jollibee',
      questionSetId: qSet.id,
      questionSetName: qSet.name,
      scheduledDate,
      scheduledTime,
      auditor: auditor.trim() || currentUser?.name,
      ownerEmail: ownerEmail.trim() || loc.ownerEmail || '',
      segment,
      tags,
      posCount: Number(posCount) || 1,
      contracted: Boolean(contracted),
      ticketsCount: Number(ticketsCount) || 0
    });

    setShowNewAuditModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Schedule New Audit
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure target location, question checklist, and operational parameters.
            </p>
          </div>
          <button
            onClick={() => setShowNewAuditModal(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Section: Required Fields */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3 flex items-center space-x-1.5">
              <span>Required Audit Details</span>
            </h3>
            
            <div className="space-y-4">
              
              {/* Location Select with Inline Creation button */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Location <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsAddingLocationInline(true)}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add new location inline</span>
                  </button>
                </div>

                <select
                  value={locationId}
                  onChange={handleLocationChange}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  <option value="" disabled>Select an auditable location...</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.organization})
                    </option>
                  ))}
                </select>
              </div>

              {/* Inline Add Location Sub-Card */}
              {isAddingLocationInline && (
                <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Quick Add Location</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddingLocationInline(false)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Location Name (e.g. Jollibee - City Mall)"
                      value={inlineLocName}
                      onChange={(e) => setInlineLocName(e.target.value)}
                      className="px-3 py-2 rounded-lg text-xs bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      type="text"
                      placeholder="Street Address"
                      value={inlineLocAddress}
                      onChange={(e) => setInlineLocAddress(e.target.value)}
                      className="px-3 py-2 rounded-lg text-xs bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      type="text"
                      placeholder="Organization (e.g. Jollibee Foods Corp)"
                      value={inlineLocOrg}
                      onChange={(e) => setInlineLocOrg(e.target.value)}
                      className="px-3 py-2 rounded-lg text-xs bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      type="text"
                      placeholder="Store Owner/Manager Email"
                      value={inlineLocOwnerEmail}
                      onChange={(e) => setInlineLocOwnerEmail(e.target.value)}
                      className="px-3 py-2 rounded-lg text-xs bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveInlineLocation}
                      disabled={!inlineLocName.trim()}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
                    >
                      Save & Select Location
                    </button>
                  </div>
                </div>
              )}

              {/* Question Set Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Question Set <span className="text-rose-500">*</span>
                </label>
                <select
                  value={questionSetId}
                  onChange={(e) => setQuestionSetId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  {questionSets.map(qs => (
                    <option key={qs.id} value={qs.id}>
                      {qs.name} ({qs.questions.length} questions)
                    </option>
                  ))}
                </select>
              </div>

              {/* Scheduled Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Scheduled Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Scheduled Time
                  </label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Section: Optional Fields (Section 5) */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Optional Audit Metadata & Scope
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Auditor Name
                </label>
                <input
                  type="text"
                  value={auditor}
                  onChange={(e) => setAuditor(e.target.value)}
                  placeholder="e.g. Carlos Reyes"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Owner / Store Email
                </label>
                <input
                  type="email"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  placeholder="owner@domain.com (for PDF delivery)"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Brand & Segment
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Brand (Jollibee)"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    value={segment}
                    onChange={(e) => setSegment(e.target.value)}
                    placeholder="Segment (QSR)"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Classification Tags
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Comma separated (e.g. Drive-thru, High-Volume)"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  POS Count & Est. Tickets
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min="1"
                    value={posCount}
                    onChange={(e) => setPosCount(e.target.value)}
                    placeholder="POS Terminals"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                  <input
                    type="number"
                    min="0"
                    value={ticketsCount}
                    onChange={(e) => setTicketsCount(e.target.value)}
                    placeholder="Daily Tickets"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="contracted"
                  checked={contracted}
                  onChange={(e) => setContracted(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <label htmlFor="contracted" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Contracted Franchise Location
                </label>
              </div>

            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowNewAuditModal(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/25 transition-all active:scale-95 flex items-center space-x-2"
            >
              <Check className="w-4 h-4" />
              <span>Schedule Audit</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

