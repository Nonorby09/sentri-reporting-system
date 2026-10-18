import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ALL_PERMISSIONS, PERMISSION_CATEGORIES } from '../types/permissions';
import { 
  FolderCheck, 
  ListFilter, 
  MapPin, 
  Users, 
  ShieldAlert, 
  Settings2, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Download, 
  Mail, 
  Building, 
  Search,
  Sparkles,
  Save,
  Shield,
  BookOpen
} from 'lucide-react';
import { generateUserManualPDF } from '../utils/pdfGenerator';

export function AdminView() {
  const { 
    hasPermission, 
    questionSets, 
    createQuestionSet, 
    addQuestionToSet, 
    deleteQuestionFromSet,
    dropdowns, 
    addDropdownOption, 
    updateDropdownOption, 
    deleteDropdownOption,
    locations, 
    createLocation, 
    updateLocation, 
    deleteLocation,
    profiles, 
    createProfile, 
    updateProfile, 
    deleteProfile,
    roles, 
    createRole, 
    updateRole, 
    renameRole,
    systemSettings, 
    updateSystemSettings,
    setShowUserManualModal,
    showToast
  } = useApp();

  // Tab State: 'fields' | 'dropdowns' | 'locations' | 'profiles' | 'roles' | 'settings'
  const [activeTab, setActiveTab] = useState(() => {
    if (hasPermission('admin_fields')) return 'fields';
    if (hasPermission('admin_dropdowns')) return 'dropdowns';
    if (hasPermission('manage_locations')) return 'locations';
    if (hasPermission('admin_profiles')) return 'profiles';
    if (hasPermission('admin_roles')) return 'roles';
    return 'settings';
  });

  // TAB 1: Fields / Question Sets
  const [selectedQsId, setSelectedQsId] = useState(questionSets[0]?.id || '');
  const selectedQuestionSet = questionSets.find(qs => qs.id === selectedQsId) || questionSets[0];
  const [showAddQsModal, setShowAddQsModal] = useState(false);
  const [newQsName, setNewQsName] = useState('');
  const [newQsDesc, setNewQsDesc] = useState('');

  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [newQText, setNewQText] = useState('');
  const [newQCategory, setNewQCategory] = useState(dropdowns.questionCategories[0]?.name || 'Food Safety');
  const [newQPoints, setNewQPoints] = useState(10);
  const [newQGuideline, setNewQGuideline] = useState('');

  // TAB 2: Dropdowns
  const [selectedDropdownTab, setSelectedDropdownTab] = useState('incidentTypes'); // 'incidentTypes' | 'questionCategories' | 'sosTypes'
  const [newDropdownItemName, setNewDropdownItemName] = useState('');
  const [editingDropdownItemId, setEditingDropdownItemId] = useState(null);
  const [editingDropdownItemVal, setEditingDropdownItemVal] = useState('');

  // TAB 3: Locations
  const [showAddLocModal, setShowAddLocModal] = useState(false);
  const [locName, setLocName] = useState('');
  const [locAddress, setLocAddress] = useState('');
  const [locOrg, setLocOrg] = useState('Jollibee Foods Corp');
  const [locBrand, setLocBrand] = useState('Jollibee');
  const [locSegment, setLocSegment] = useState('QSR');
  const [locTags, setLocTags] = useState('Drive-thru, Core');
  const [locOwnerEmail, setLocOwnerEmail] = useState('');

  // TAB 4: Profiles & Users
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRoleId, setInviteRoleId] = useState(roles[0]?.id || '');
  const [profileSearchQuery, setProfileSearchQuery] = useState('');

  // TAB 5: Roles & Permissions
  const [selectedRoleId, setSelectedRoleId] = useState(roles[0]?.id || '');
  const selectedRole = roles.find(r => r.id === selectedRoleId) || roles[0];
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [editingRoleName, setEditingRoleName] = useState('');

  // TAB 6: Settings
  const [sysName, setSysName] = useState(systemSettings.systemName);
  const [sysTagline, setSysTagline] = useState(systemSettings.tagline || '');
  const [sysLogoUrl, setSysLogoUrl] = useState(systemSettings.logoUrl || '');

  // Handlers for Question Sets
  const handleCreateQs = (e) => {
    e.preventDefault();
    if (!newQsName.trim()) return;
    const created = createQuestionSet(newQsName.trim(), newQsDesc.trim());
    setSelectedQsId(created.id);
    setShowAddQsModal(false);
    setNewQsName('');
    setNewQsDesc('');
  };

  const handleAddQuestion = (e) => {
    e.preventDefault();
    if (!newQText.trim()) return;
    addQuestionToSet(selectedQuestionSet.id, {
      text: newQText.trim(),
      category: newQCategory,
      points: Number(newQPoints) || 5,
      guideline: newQGuideline.trim()
    });
    setShowAddQuestionModal(false);
    setNewQText('');
    setNewQGuideline('');
  };

  // Handlers for Dropdown Options
  const handleAddDropdownOption = (e) => {
    e.preventDefault();
    if (!newDropdownItemName.trim()) return;
    addDropdownOption(selectedDropdownTab, newDropdownItemName.trim());
    setNewDropdownItemName('');
  };

  const handleSaveEditDropdown = (id) => {
    if (!editingDropdownItemVal.trim()) return;
    updateDropdownOption(selectedDropdownTab, id, editingDropdownItemVal.trim());
    setEditingDropdownItemId(null);
  };

  // Handlers for Locations
  const handleSaveLocation = (e) => {
    e.preventDefault();
    if (!locName.trim()) return;
    createLocation({
      name: locName.trim(),
      address: locAddress.trim(),
      organization: locOrg.trim(),
      brand: locBrand.trim(),
      segment: locSegment.trim(),
      tags: locTags.split(',').map(t => t.trim()).filter(Boolean),
      ownerEmail: locOwnerEmail.trim()
    });
    setShowAddLocModal(false);
    setLocName('');
    setLocAddress('');
    setLocOwnerEmail('');
  };

  // Handlers for Profiles
  const handleInviteUser = (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    createProfile({
      name: inviteName.trim() || inviteEmail.split('@')[0],
      email: inviteEmail.trim(),
      roleId: inviteRoleId
    });
    setShowInviteModal(false);
    setInviteEmail('');
    setInviteName('');
  };

  // Handlers for Roles & Permissions
  const handleTogglePermission = (permKey) => {
    const currentPerms = selectedRole.permissions || [];
    const hasIt = currentPerms.includes(permKey);
    const updated = hasIt ? currentPerms.filter(p => p !== permKey) : [...currentPerms, permKey];
    updateRole(selectedRole.id, { permissions: updated });
  };

  const handleCreateRole = (e) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    const created = createRole(newRoleName.trim(), ['view_schedule', 'download_report']);
    setSelectedRoleId(created.id);
    setShowCreateRoleModal(false);
    setNewRoleName('');
  };

  const handleRenameRole = (roleId) => {
    if (!editingRoleName.trim()) return;
    renameRole(roleId, editingRoleName.trim());
    setEditingRoleId(null);
  };

  // Handlers for System Settings
  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateSystemSettings({
      systemName: sysName.trim(),
      tagline: sysTagline.trim(),
      logoUrl: sysLogoUrl.trim(),
      lastUpdated: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    });
  };

  const handleDownloadManual = () => {
    const summary = {
      totalLocations: locations.length,
      totalQuestionSets: questionSets.length,
      totalCategories: dropdowns.questionCategories.length,
      totalIncidentTypes: dropdowns.incidentTypes.length,
      totalSosTypes: dropdowns.sosTypes.length,
      totalRoles: roles.length
    };
    generateUserManualPDF(systemSettings, summary);
  };

  // Tab definitions with RBAC checks
  const adminTabs = [
    { id: 'fields', label: 'Question Fields', icon: FolderCheck, perm: 'admin_fields' },
    { id: 'dropdowns', label: 'Dropdowns', icon: ListFilter, perm: 'admin_dropdowns' },
    { id: 'locations', label: 'Locations', icon: MapPin, perm: 'manage_locations' },
    { id: 'profiles', label: 'Profiles & Users', icon: Users, perm: 'admin_profiles' },
    { id: 'roles', label: 'Roles & Permissions', icon: ShieldAlert, perm: 'admin_roles' },
    { id: 'settings', label: 'System Settings', icon: Settings2, perm: 'manage_system_settings' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Administration Control Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure audit question checklists, dropdown definitions, location master records, user profiles, and granular role permissions.
          </p>
        </div>

        {/* User Manual quick button */}
        <button
          onClick={handleDownloadManual}
          className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Dynamic Manual (PDF)</span>
        </button>
      </div>

      {/* Admin Subtabs Navigation */}
      <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 space-x-1 pb-px">
        {adminTabs.map((tab) => {
          const Icon = tab.icon;
          const allowed = hasPermission(tab.perm);
          const isSelected = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => allowed && setActiveTab(tab.id)}
              disabled={!allowed}
              className={`flex items-center space-x-2 px-4 py-3 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                isSelected
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                  : allowed
                  ? 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  : 'border-transparent text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {!allowed && <span className="text-[10px] ml-1">(Locked)</span>}
            </button>
          );
        })}
      </div>

      {/* TAB 1: QUESTION FIELDS (Section 11) */}
      {activeTab === 'fields' && hasPermission('admin_fields') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Panel: Question Sets */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Question Sets
              </h3>
              <button
                onClick={() => setShowAddQsModal(true)}
                className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 transition-colors"
                title="Add new Question Set"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              {questionSets.map(qs => (
                <button
                  key={qs.id}
                  onClick={() => setSelectedQsId(qs.id)}
                  className={`w-full text-left p-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                    qs.id === selectedQuestionSet?.id
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 ring-1 ring-indigo-500/20'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <span className="block font-bold">{qs.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{qs.questions.length} questions</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Active</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Panel: Questions within Selected Set */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {selectedQuestionSet?.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedQuestionSet?.description || 'Custom configured audit checklist'}
                </p>
              </div>

              <button
                onClick={() => setShowAddQuestionModal(true)}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            {/* Questions Table */}
            <div className="space-y-3">
              {selectedQuestionSet?.questions.map((q, qIndex) => (
                <div 
                  key={q.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs flex items-start justify-between gap-3"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 font-bold flex items-center justify-center text-[10px]">
                        {qIndex + 1}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300">
                        {q.category}
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {q.points} Points
                      </span>
                    </div>
                    <p className="font-semibold text-slate-900 dark:text-white pt-1">
                      {q.text}
                    </p>
                    {q.guideline && (
                      <p className="text-[11px] text-slate-500 italic">
                        Guideline: {q.guideline}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => deleteQuestionFromSet(selectedQuestionSet.id, q.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                    title="Delete Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: DROPDOWNS (Section 12) */}
      {activeTab === 'dropdowns' && hasPermission('admin_dropdowns') && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              System Dropdown Options Management
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage Incident Types, Question Categories, and Speed of Service service types across the platform.
            </p>
          </div>

          {/* Sub-selectors */}
          <div className="flex flex-wrap gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl text-xs font-medium">
            <button
              onClick={() => setSelectedDropdownTab('incidentTypes')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedDropdownTab === 'incidentTypes' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs font-bold' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Incident Types ({dropdowns.incidentTypes?.length || 0})
            </button>
            <button
              onClick={() => setSelectedDropdownTab('questionCategories')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedDropdownTab === 'questionCategories' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs font-bold' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Question Categories ({dropdowns.questionCategories?.length || 0})
            </button>
            <button
              onClick={() => setSelectedDropdownTab('sosTypes')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedDropdownTab === 'sosTypes' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs font-bold' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Speed of Service Types ({dropdowns.sosTypes?.length || 0})
            </button>
            <button
              onClick={() => setSelectedDropdownTab('sentriIncidentTitles')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedDropdownTab === 'sentriIncidentTitles' ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-xs font-bold' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Sentri Incident Titles ({dropdowns.sentriIncidentTitles?.length || 0})
            </button>
            <button
              onClick={() => setSelectedDropdownTab('facilityZones')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedDropdownTab === 'facilityZones' ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-xs font-bold' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Facility Zones ({dropdowns.facilityZones?.length || 0})
            </button>
            <button
              onClick={() => setSelectedDropdownTab('reportTypes')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedDropdownTab === 'reportTypes' ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-xs font-bold' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Report Types ({dropdowns.reportTypes?.length || 0})
            </button>
          </div>

          {/* Add Option Form */}
          {hasPermission('edit_dropdowns') && (
            <form onSubmit={handleAddDropdownOption} className="flex gap-2 max-w-md">
              <input
                type="text"
                value={newDropdownItemName}
                onChange={(e) => setNewDropdownItemName(e.target.value)}
                placeholder="Enter new option name..."
                className="flex-1 px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>
          )}

          {/* Current Options List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {dropdowns[selectedDropdownTab]?.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs"
              >
                {editingDropdownItemId === item.id ? (
                  <div className="flex items-center space-x-1 flex-1 mr-2">
                    <input
                      type="text"
                      value={editingDropdownItemVal}
                      onChange={(e) => setEditingDropdownItemVal(e.target.value)}
                      className="w-full px-2 py-1 rounded bg-white dark:bg-slate-900 border border-indigo-500 text-xs"
                    />
                    <button onClick={() => handleSaveEditDropdown(item.id)} className="text-emerald-500">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditingDropdownItemId(null)} className="text-slate-400">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {item.name}
                  </span>
                )}

                {hasPermission('edit_dropdowns') && (
                  <div className="flex items-center space-x-1 text-slate-400">
                    <button
                      onClick={() => {
                        setEditingDropdownItemId(item.id);
                        setEditingDropdownItemVal(item.name);
                      }}
                      className="hover:text-indigo-600 p-1"
                      title="Edit Option"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteDropdownOption(selectedDropdownTab, item.id)}
                      className="hover:text-rose-600 p-1"
                      title="Delete Option"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: LOCATIONS (Section 13) */}
      {activeTab === 'locations' && hasPermission('manage_locations') && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Auditable Locations ({locations.length} Sites Configured)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage stores, franchise branches, organizations, and contact emails.
              </p>
            </div>
            <button
              onClick={() => setShowAddLocModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Location</span>
            </button>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Location Name</th>
                  <th className="py-3 px-4">Address</th>
                  <th className="py-3 px-4">Organization & Brand</th>
                  <th className="py-3 px-4">Tags</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {locations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {loc.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {loc.address}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      <div>{loc.organization}</div>
                      <span className="text-[10px] text-indigo-600 font-semibold">{loc.brand} ({loc.segment})</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {loc.tags?.map((t, tid) => (
                          <span key={tid} className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => deleteLocation(loc.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Delete Location"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PROFILES & USERS (Section 14) */}
      {activeTab === 'profiles' && hasPermission('admin_profiles') && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Team Member Profiles & User Management
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Invite new members, assign roles, and manage active account status.
              </p>
            </div>
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs"
            >
              <Mail className="w-4 h-4" />
              <span>Invite New User</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="max-w-xs">
            <input
              type="text"
              placeholder="Search user by name or email..."
              value={profileSearchQuery}
              onChange={(e) => setProfileSearchQuery(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {profiles
                  .filter(p => !profileSearchQuery || p.name.toLowerCase().includes(profileSearchQuery.toLowerCase()) || p.email.toLowerCase().includes(profileSearchQuery.toLowerCase()))
                  .map((prof) => (
                    <tr key={prof.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="w-6 h-6 rounded-md bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                            {prof.avatar}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">{prof.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                        {prof.email}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={prof.roleId}
                          onChange={(e) => updateProfile(prof.id, { roleId: e.target.value })}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-700 dark:text-indigo-300"
                        >
                          {roles.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => updateProfile(prof.id, { status: prof.status === 'Active' ? 'Inactive' : 'Active' })}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            prof.status === 'Active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {prof.status}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => deleteProfile(prof.id)}
                          className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                          title="Remove Profile"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: ROLES & PERMISSIONS (Section 15) */}
      {activeTab === 'roles' && hasPermission('admin_roles') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Panel: Configured Roles */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Configured Roles
              </h3>
              <button
                onClick={() => setShowCreateRoleModal(true)}
                className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400"
                title="Create Role"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {roles.map(r => {
                const isSelected = r.id === selectedRole?.id;
                const isRenaming = editingRoleId === r.id;

                return (
                  <div
                    key={r.id}
                    className={`p-3 rounded-xl border text-xs transition-colors ${
                      isSelected 
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200' 
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      {isRenaming ? (
                        <div className="flex items-center space-x-1 flex-1 mr-2">
                          <input
                            type="text"
                            value={editingRoleName}
                            onChange={(e) => setEditingRoleName(e.target.value)}
                            className="w-full px-2 py-0.5 rounded text-xs bg-white dark:bg-slate-900 border border-indigo-500"
                          />
                          <button onClick={() => handleRenameRole(r.id)} className="text-emerald-500">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setEditingRoleId(null)} className="text-slate-400">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setSelectedRoleId(r.id)}
                          className="font-bold text-left flex-1"
                        >
                          {r.name}
                        </button>
                      )}

                      <div className="flex items-center space-x-1">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                          {r.permissions?.length || 0} perms
                        </span>
                        {!isRenaming && (
                          <button
                            onClick={() => {
                              setEditingRoleId(r.id);
                              setEditingRoleName(r.name);
                            }}
                            className="p-1 text-slate-400 hover:text-indigo-600"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Permissions for Selected Role (Exact 16 Permissions) */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    Permissions: {selectedRole?.name}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {selectedRole?.permissions?.length || 0} / 16 Granted
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Toggle granular permissions for the selected role. Changes take effect immediately across all sessions.
                </p>
              </div>
            </div>

            {/* Categorized Permissions Grid */}
            <div className="space-y-6">
              {PERMISSION_CATEGORIES.map(category => {
                const permsInCategory = ALL_PERMISSIONS.filter(p => p.category === category);

                return (
                  <div key={category} className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {category}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {permsInCategory.map(p => {
                        const isGranted = (selectedRole?.permissions || []).includes(p.key);

                        return (
                          <label
                            key={p.key}
                            className={`p-3 rounded-xl border flex items-start space-x-3 cursor-pointer transition-colors ${
                              isGranted 
                                ? 'bg-indigo-50/40 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/80' 
                                : 'bg-slate-50/40 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-70'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isGranted}
                              onChange={() => handleTogglePermission(p.key)}
                              className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                            />
                            <div className="text-xs">
                              <span className="font-bold text-slate-900 dark:text-white block">
                                {p.name}
                              </span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                                {p.description}
                              </span>
                              <span className="text-[9px] font-mono text-slate-400">
                                {p.key}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      )}

      {/* TAB 6: SYSTEM SETTINGS (Section 16) */}
      {activeTab === 'settings' && hasPermission('manage_system_settings') && (
        <div className="max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              System Branding & Configuration
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Customize the name, logo, and brand appearance seen across the platform and generated PDF reports.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                System Name
              </label>
              <input
                type="text"
                value={sysName}
                onChange={(e) => setSysName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Sub-Tagline
              </label>
              <input
                type="text"
                value={sysTagline}
                onChange={(e) => setSysTagline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Logo URL (recommended 64x64px PNG/SVG)
              </label>
              <input
                type="text"
                value={sysLogoUrl}
                onChange={(e) => setSysLogoUrl(e.target.value)}
                placeholder="https://your-domain.com/logo.png"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            {/* Live Preview Box (Section 16) */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Live Navbar Header Preview
              </label>
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  {sysLogoUrl ? <img src={sysLogoUrl} alt="Logo" className="w-full h-full object-cover rounded-xl" /> : 'S'}
                </div>
                <div>
                  <span className="font-bold text-sm text-slate-900 dark:text-white block">
                    {sysName || 'Sentri Remote Reporting System'}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {sysTagline || 'Audit & Reporting Management System'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={handleDownloadManual}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
              >
                <Download className="w-4 h-4 text-indigo-500" />
                <span>Download User Manual (PDF)</span>
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center space-x-1.5 shadow-sm shadow-indigo-600/25"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Add Question Set */}
      {showAddQsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Create Question Set</h3>
            <form onSubmit={handleCreateQs} className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="Question Set Name (e.g. Food Safety, Operations)"
                required
                value={newQsName}
                onChange={(e) => setNewQsName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
              <textarea
                placeholder="Description / Purpose..."
                rows={2}
                value={newQsDesc}
                onChange={(e) => setNewQsDesc(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowAddQsModal(false)} className="px-4 py-2">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold">Create Set</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Question */}
      {showAddQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Add Question to Checklist</h3>
            <form onSubmit={handleAddQuestion} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Question Text</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Are all food contact surfaces clean and sanitized?"
                  value={newQText}
                  onChange={(e) => setNewQText(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Category</label>
                  <select
                    value={newQCategory}
                    onChange={(e) => setNewQCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    {dropdowns.questionCategories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Points Value</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={newQPoints}
                    onChange={(e) => setNewQPoints(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Auditor Guideline / Standard</label>
                <textarea
                  rows={2}
                  placeholder="Instructions for how the auditor should verify this requirement..."
                  value={newQGuideline}
                  onChange={(e) => setNewQGuideline(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowAddQuestionModal(false)} className="px-4 py-2">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold">Add Question</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Location */}
      {showAddLocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Add New Location</h3>
            <form onSubmit={handleSaveLocation} className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="Location Name"
                required
                value={locName}
                onChange={(e) => setLocName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
              <input
                type="text"
                placeholder="Physical Street Address"
                value={locAddress}
                onChange={(e) => setLocAddress(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Organization"
                  value={locOrg}
                  onChange={(e) => setLocOrg(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
                <input
                  type="text"
                  placeholder="Brand"
                  value={locBrand}
                  onChange={(e) => setLocBrand(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
              <input
                type="email"
                placeholder="Store Email"
                value={locOwnerEmail}
                onChange={(e) => setLocOwnerEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
              <input
                type="text"
                placeholder="Tags (comma separated)"
                value={locTags}
                onChange={(e) => setLocTags(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowAddLocModal(false)} className="px-4 py-2">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold">Save Location</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Invite User */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Invite Team Member</h3>
            <form onSubmit={handleInviteUser} className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="Full Name"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
              <input
                type="email"
                placeholder="Email Address"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
              <div>
                <label className="block font-semibold mb-1">Assign Initial Role</label>
                <select
                  value={inviteRoleId}
                  onChange={(e) => setInviteRoleId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowInviteModal(false)} className="px-4 py-2">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold">Send Invitation</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Create Role */}
      {showCreateRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Create New Role</h3>
            <form onSubmit={handleCreateRole} className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="Role Name (e.g. Field Auditor, Regional Lead)"
                required
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
              <p className="text-[11px] text-slate-500">
                You will be able to configure the specific 16 permissions on the next screen.
              </p>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowCreateRoleModal(false)} className="px-4 py-2">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold">Create Role</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

