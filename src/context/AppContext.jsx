import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  hashPassword,
  generateSessionToken,
  saveSession,
  getActiveSession,
  clearSession,
  recordFailedAttempt,
  clearFailedAttempts,
  getLockoutInfo,
} from '../utils/authUtils';
import {
  INITIAL_SYSTEM_SETTINGS,
  INITIAL_ROLES,
  INITIAL_PROFILES,
  INITIAL_DROPDOWNS,
  INITIAL_LOCATIONS,
  INITIAL_QUESTION_SETS,
  INITIAL_AUDITS,
  INITIAL_INCIDENT_REPORTS,
  INITIAL_SHIFT_AUDITS
} from '../data/initialData';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Theme
  const [theme, setTheme] = useState(() => localStorage.getItem('sentri_theme') || 'light');

  // ─── Authentication ──────────────────────────────────────────────────────────
  // Determine initial auth state by checking persisted session
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getActiveSession()));
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'

  // Navigation / Views: 'dashboard' | 'audit' | 'analytics' | 'admin' | 'sentri_core'
  const [currentView, setCurrentView] = useState('dashboard');
  const [activeAuditId, setActiveAuditId] = useState(null);
  const [viewingReportAuditId, setViewingReportAuditId] = useState(null);
  const [showSendSummaryModal, setShowSendSummaryModal] = useState(false);
  const [showUserManualModal, setShowUserManualModal] = useState(false);
  const [showNewAuditModal, setShowNewAuditModal] = useState(false);

  // Sentri Core Modals State
  const [showIncidentReportModal, setShowIncidentReportModal] = useState(false);
  const [activeIncidentReportId, setActiveIncidentReportId] = useState(null);
  const [showShiftAuditModal, setShowShiftAuditModal] = useState(false);
  const [activeShiftAuditId, setActiveShiftAuditId] = useState(null);
  
  // Toast notifications
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // State with LocalStorage
  const [systemSettings, setSystemSettings] = useState(() => {
    const saved = localStorage.getItem('sentri_settings');
    return saved ? JSON.parse(saved) : INITIAL_SYSTEM_SETTINGS;
  });

  const [roles, setRoles] = useState(() => {
    const saved = localStorage.getItem('sentri_roles');
    if (!saved) return INITIAL_ROLES;
    try {
      const parsed = JSON.parse(saved);
      // Ensure Admin has all 25 permissions and Operator has 16 permissions as updated in Oct 6 manual
      return parsed.map(r => {
        if (r.id === 'role-admin') {
          return { ...r, permissions: INITIAL_ROLES[0].permissions };
        }
        if (r.id === 'role-operator' && r.permissions.length < 16) {
          const defaultOp = INITIAL_ROLES.find(ir => ir.id === 'role-operator');
          return { ...r, permissions: defaultOp ? defaultOp.permissions : r.permissions };
        }
        return r;
      });
    } catch {
      return INITIAL_ROLES;
    }
  });

  const [profiles, setProfiles] = useState(() => {
    const saved = localStorage.getItem('sentri_profiles');
    if (!saved) return INITIAL_PROFILES;
    try {
      const parsed = JSON.parse(saved);
      // Backfill passwordHash from INITIAL_PROFILES for any profile missing it
      // (happens when localStorage was saved before auth was added)
      return parsed.map(p => {
        if (!p.passwordHash) {
          const seed = INITIAL_PROFILES.find(ip => ip.id === p.id || ip.email === p.email);
          return seed ? { ...p, passwordHash: seed.passwordHash } : p;
        }
        return p;
      });
    } catch {
      return INITIAL_PROFILES;
    }
  });

  const [currentUserId, setCurrentUserId] = useState(() => {
    // Restore the session user if a remembered/active session exists
    const session = getActiveSession();
    if (session?.userId) return session.userId;
    return profiles[0]?.id || 'prof-1';
  });

  const [locations, setLocations] = useState(() => {
    const saved = localStorage.getItem('sentri_locations');
    return saved ? JSON.parse(saved) : INITIAL_LOCATIONS;
  });

  const [questionSets, setQuestionSets] = useState(() => {
    const saved = localStorage.getItem('sentri_questionSets');
    return saved ? JSON.parse(saved) : INITIAL_QUESTION_SETS;
  });

  const [dropdowns, setDropdowns] = useState(() => {
    const saved = localStorage.getItem('sentri_dropdowns');
    if (!saved) return INITIAL_DROPDOWNS;
    try {
      const parsed = JSON.parse(saved);
      return {
        ...INITIAL_DROPDOWNS,
        ...parsed,
        sentriIncidentTitles: parsed.sentriIncidentTitles || INITIAL_DROPDOWNS.sentriIncidentTitles,
        facilityZones: parsed.facilityZones || INITIAL_DROPDOWNS.facilityZones,
        reportTypes: parsed.reportTypes || INITIAL_DROPDOWNS.reportTypes
      };
    } catch {
      return INITIAL_DROPDOWNS;
    }
  });

  const [audits, setAudits] = useState(() => {
    const saved = localStorage.getItem('sentri_audits');
    return saved ? JSON.parse(saved) : INITIAL_AUDITS;
  });

  // Sentri Core State
  const [incidentReports, setIncidentReports] = useState(() => {
    const saved = localStorage.getItem('sentri_incidentReports');
    return saved ? JSON.parse(saved) : INITIAL_INCIDENT_REPORTS;
  });

  const [shiftAudits, setShiftAudits] = useState(() => {
    const saved = localStorage.getItem('sentri_shiftAudits');
    return saved ? JSON.parse(saved) : INITIAL_SHIFT_AUDITS;
  });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('sentri_settings', JSON.stringify(systemSettings));
  }, [systemSettings]);

  useEffect(() => {
    localStorage.setItem('sentri_roles', JSON.stringify(roles));
  }, [roles]);

  useEffect(() => {
    localStorage.setItem('sentri_profiles', JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem('sentri_locations', JSON.stringify(locations));
  }, [locations]);

  useEffect(() => {
    localStorage.setItem('sentri_questionSets', JSON.stringify(questionSets));
  }, [questionSets]);

  useEffect(() => {
    localStorage.setItem('sentri_dropdowns', JSON.stringify(dropdowns));
  }, [dropdowns]);

  useEffect(() => {
    localStorage.setItem('sentri_audits', JSON.stringify(audits));
  }, [audits]);

  useEffect(() => {
    localStorage.setItem('sentri_incidentReports', JSON.stringify(incidentReports));
  }, [incidentReports]);

  useEffect(() => {
    localStorage.setItem('sentri_shiftAudits', JSON.stringify(shiftAudits));
  }, [shiftAudits]);

  useEffect(() => {
    localStorage.setItem('sentri_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Current User & Permission Resolution
  const currentUser = profiles.find(p => p.id === currentUserId) || profiles[0];
  const currentRole = roles.find(r => r.id === currentUser?.roleId) || roles[0];

  const hasPermission = (permissionKey) => {
    if (!currentRole || !currentRole.permissions) return false;
    return currentRole.permissions.includes(permissionKey);
  };

  // ─── Auth Functions ───────────────────────────────────────────────────────────

  const login = async (email, password, rememberMe = false) => {
    // Brute-force lockout check
    const { locked, remainingMs } = getLockoutInfo();
    if (locked) {
      const mins = Math.ceil(remainingMs / 60000);
      return { success: false, message: `Account temporarily locked. Try again in ${mins} minute${mins !== 1 ? 's' : ''}.` };
    }

    const profile = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
    if (!profile) {
      recordFailedAttempt();
      return { success: false, message: 'No account found with that email address.' };
    }
    if (profile.status === 'Inactive') {
      return { success: false, message: 'This account has been deactivated. Contact your administrator.' };
    }

    const hash = await hashPassword(password);
    if (hash !== profile.passwordHash) {
      const attempts = recordFailedAttempt();
      const remaining = 5 - attempts;
      if (remaining > 0) {
        return { success: false, message: `Incorrect password. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining before lockout.` };
      }
      return { success: false, message: 'Too many failed attempts. Account locked for 15 minutes.' };
    }

    // Credentials valid
    clearFailedAttempts();
    const token = generateSessionToken();
    saveSession(token, profile.id, rememberMe);
    setCurrentUserId(profile.id);
    setIsAuthenticated(true);
    setCurrentView('dashboard');
    showToast(`Welcome back, ${profile.name}!`, 'success');
    return { success: true };
  };

  const logout = () => {
    clearSession();
    setIsAuthenticated(false);
    setAuthView('login');
    setCurrentView('dashboard');
    showToast('You have been signed out securely.', 'info');
  };

  /**
   * Register a new user account.
   * Only accessible if no Admin exists yet OR the current user is an Admin.
   */
  const register = async ({ name, email, password, roleId }) => {
    if (!name?.trim() || !email?.trim() || !password) {
      return { success: false, message: 'All fields are required.' };
    }
    const emailLower = email.trim().toLowerCase();
    const duplicate = profiles.find(p => p.email.toLowerCase() === emailLower);
    if (duplicate) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    const targetRole  = roles.find(r => r.id === roleId) || roles.find(r => r.id === 'role-operator') || roles[0];
    const initials    = name.trim().split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const hash        = await hashPassword(password);

    const newProfile = {
      id:           `prof-${Date.now()}`,
      name:         name.trim(),
      email:        emailLower,
      roleId:       targetRole.id,
      roleName:     targetRole.name,
      status:       'Active',
      avatar:       initials,
      passwordHash: hash,
      createdAt:    new Date().toISOString(),
    };
    setProfiles(prev => [...prev, newProfile]);
    showToast(`Account created for ${newProfile.name}!`, 'success');
    return { success: true, profile: newProfile };
  };

  const switchUser = (profileId) => {
    const target = profiles.find(p => p.id === profileId);
    if (target) {
      setCurrentUserId(profileId);
      showToast(`Switched user to ${target.name} (${target.roleName})`, 'info');
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Score Calculation Utility
  const calculateAuditScore = (audit, qSet) => {
    if (!audit) return { percentage: 0, earnedPoints: 0, maxPossiblePoints: 0, passedCount: 0, failedCount: 0, naCount: 0, unansweredCount: 0, totalQuestions: 0, answeredCount: 0 };
    const questions = qSet?.questions || [];
    let earnedPoints = 0;
    let maxPossiblePoints = 0;
    let passedCount = 0;
    let failedCount = 0;
    let naCount = 0;
    let unansweredCount = 0;

    questions.forEach(q => {
      const ansData = audit.answers?.[q.id];
      const answer = ansData?.answer;
      const isOverridden = audit.pointOverrides && audit.pointOverrides[q.id] !== undefined;

      if (answer === 'N/A') {
        naCount++;
      } else if (answer === 'Yes') {
        passedCount++;
        maxPossiblePoints += q.points;
        earnedPoints += isOverridden ? Number(audit.pointOverrides[q.id]) : q.points;
      } else if (answer === 'No') {
        failedCount++;
        maxPossiblePoints += q.points;
        earnedPoints += isOverridden ? Number(audit.pointOverrides[q.id]) : 0;
      } else {
        unansweredCount++;
        maxPossiblePoints += q.points;
        if (isOverridden) {
          earnedPoints += Number(audit.pointOverrides[q.id]);
        }
      }
    });

    const percentage = maxPossiblePoints > 0 
      ? Math.round((earnedPoints / maxPossiblePoints) * 1000) / 10 
      : 0;

    return {
      percentage,
      earnedPoints,
      maxPossiblePoints,
      passedCount,
      failedCount,
      naCount,
      unansweredCount,
      totalQuestions: questions.length,
      answeredCount: passedCount + failedCount + naCount
    };
  };

  // Audit Operations
  const startOrResumeAudit = (auditId) => {
    const audit = audits.find(a => a.id === auditId);
    if (!audit) return;

    if (!hasPermission('start_audit')) {
      showToast('Permission denied: You do not have permission to start audits.', 'error');
      return;
    }

    const now = new Date();
    const currentDateStr = now.toISOString().split('T')[0];
    const currentTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    if (audit.status === 'Scheduled') {
      setAudits(prev => prev.map(a => {
        if (a.id === auditId) {
          return {
            ...a,
            status: 'In Progress',
            actualDate: a.actualDate || currentDateStr,
            actualTime: a.actualTime || currentTimeStr,
            auditor: a.auditor || currentUser.name
          };
        }
        return a;
      }));
    }

    setActiveAuditId(auditId);
    setCurrentView('audit');
  };

  const updateAuditAnswer = (auditId, questionId, { answer, notes, attachments }) => {
    setAudits(prev => prev.map(a => {
      if (a.id === auditId) {
        const existingAnswers = a.answers || {};
        const prevAnswerData = existingAnswers[questionId] || { answer: null, notes: '', attachments: [] };
        
        return {
          ...a,
          answers: {
            ...existingAnswers,
            [questionId]: {
              answer: answer !== undefined ? answer : prevAnswerData.answer,
              notes: notes !== undefined ? notes : prevAnswerData.notes,
              attachments: attachments !== undefined ? attachments : prevAnswerData.attachments
            }
          }
        };
      }
      return a;
    }));
  };

  const overrideQuestionPoints = (auditId, questionId, points) => {
    setAudits(prev => prev.map(a => {
      if (a.id === auditId) {
        return {
          ...a,
          pointOverrides: {
            ...(a.pointOverrides || {}),
            [questionId]: points
          }
        };
      }
      return a;
    }));
    showToast(`Points adjusted to ${points}*`, 'info');
  };

  const resetQuestionPointOverrides = (auditId) => {
    setAudits(prev => prev.map(a => {
      if (a.id === auditId) {
        return {
          ...a,
          pointOverrides: {}
        };
      }
      return a;
    }));
    showToast('All point overrides reset to automatic scoring', 'info');
  };

  const updateAuditSchedule = (auditId, { actualDate, actualTime }) => {
    setAudits(prev => prev.map(a => {
      if (a.id === auditId) {
        return {
          ...a,
          actualDate: actualDate !== undefined ? actualDate : a.actualDate,
          actualTime: actualTime !== undefined ? actualTime : a.actualTime
        };
      }
      return a;
    }));
  };

  const addIncident = (auditId, { type, description }) => {
    if (!hasPermission('manage_incidents')) {
      showToast('Permission denied: You cannot manage incidents.', 'error');
      return;
    }
    const newIncident = {
      id: `inc-${Date.now()}`,
      type,
      description,
      reportedAt: new Date().toLocaleString()
    };
    setAudits(prev => prev.map(a => {
      if (a.id === auditId) {
        return {
          ...a,
          incidents: [...(a.incidents || []), newIncident]
        };
      }
      return a;
    }));
    showToast(`Incident reported: ${type}`, 'warning');
  };

  const removeIncident = (auditId, incidentId) => {
    if (!hasPermission('manage_incidents')) {
      showToast('Permission denied: You cannot manage incidents.', 'error');
      return;
    }
    setAudits(prev => prev.map(a => {
      if (a.id === auditId) {
        return {
          ...a,
          incidents: (a.incidents || []).filter(i => i.id !== incidentId)
        };
      }
      return a;
    }));
    showToast('Incident removed', 'info');
  };

  const addSosRecord = (auditId, record) => {
    if (!hasPermission('manage_sos')) {
      showToast('Permission denied: You cannot manage speed of service.', 'error');
      return;
    }
    const newRecord = {
      id: `sos-${Date.now()}`,
      ...record
    };
    setAudits(prev => prev.map(a => {
      if (a.id === auditId) {
        return {
          ...a,
          speedOfService: {
            isNA: false,
            records: [...(a.speedOfService?.records || []), newRecord]
          }
        };
      }
      return a;
    }));
    showToast(`Speed of Service measurement added (${record.type})`, 'success');
  };

  const toggleSosNA = (auditId) => {
    if (!hasPermission('manage_sos')) {
      showToast('Permission denied: You cannot manage speed of service.', 'error');
      return;
    }
    setAudits(prev => prev.map(a => {
      if (a.id === auditId) {
        const currentNA = a.speedOfService?.isNA || false;
        return {
          ...a,
          speedOfService: {
            ...a.speedOfService,
            isNA: !currentNA
          }
        };
      }
      return a;
    }));
    showToast('Speed of Service marked as N/A', 'info');
  };

  const addAuditNote = (auditId, noteText) => {
    if (!hasPermission('manage_notes')) {
      showToast('Permission denied: You cannot manage notes.', 'error');
      return;
    }
    const newNote = {
      id: `note-${Date.now()}`,
      author: currentUser.name,
      date: new Date().toLocaleString(),
      text: noteText
    };
    setAudits(prev => prev.map(a => {
      if (a.id === auditId) {
        return {
          ...a,
          notes: [...(a.notes || []), newNote]
        };
      }
      return a;
    }));
    showToast('Note added successfully', 'success');
  };

  const finalizeAndSendAudit = (auditId, recipientEmail) => {
    if (!hasPermission('send_audit')) {
      showToast('Permission denied: You cannot send audit reports.', 'error');
      return false;
    }
    setAudits(prev => prev.map(a => {
      if (a.id === auditId) {
        return {
          ...a,
          status: 'Sent',
          ownerEmail: recipientEmail || a.ownerEmail
        };
      }
      return a;
    }));
    showToast(`Audit finalized and sent to ${recipientEmail || 'stakeholders'}!`, 'success');
    return true;
  };

  const createAudit = (auditData) => {
    if (!hasPermission('create_audit')) {
      showToast('Permission denied: You cannot create new audits.', 'error');
      return false;
    }
    const reportNumber = 1000 + audits.length + 1;
    const newAudit = {
      id: `audit-${Date.now()}`,
      reportId: `SRR-2026-${reportNumber}`,
      answers: {},
      pointOverrides: {},
      incidents: [],
      speedOfService: { isNA: false, records: [] },
      notes: [],
      status: 'Scheduled',
      ...auditData
    };
    setAudits(prev => [newAudit, ...prev]);
    showToast('New audit successfully scheduled!', 'success');
    return true;
  };

  // Location Management
  const createLocation = (locData) => {
    const newLoc = {
      id: `loc-${Date.now()}`,
      ...locData
    };
    setLocations(prev => [...prev, newLoc]);
    showToast(`Location '${locData.name}' created`, 'success');
    return newLoc;
  };

  const updateLocation = (locId, locData) => {
    setLocations(prev => prev.map(l => l.id === locId ? { ...l, ...locData } : l));
    showToast('Location updated', 'success');
  };

  const deleteLocation = (locId) => {
    setLocations(prev => prev.filter(l => l.id !== locId));
    showToast('Location removed', 'info');
  };

  // Question Set Management
  const createQuestionSet = (name, description) => {
    const newSet = {
      id: `qs-${Date.now()}`,
      name,
      description: description || '',
      questions: []
    };
    setQuestionSets(prev => [...prev, newSet]);
    showToast(`Question set '${name}' created`, 'success');
    return newSet;
  };

  const addQuestionToSet = (setId, questionData) => {
    const newQ = {
      id: `q-${Date.now()}`,
      ...questionData,
      points: Number(questionData.points) || 5
    };
    setQuestionSets(prev => prev.map(qs => {
      if (qs.id === setId) {
        return {
          ...qs,
          questions: [...qs.questions, newQ]
        };
      }
      return qs;
    }));
    showToast('Question added to set', 'success');
  };

  const deleteQuestionFromSet = (setId, questionId) => {
    setQuestionSets(prev => prev.map(qs => {
      if (qs.id === setId) {
        return {
          ...qs,
          questions: qs.questions.filter(q => q.id !== questionId)
        };
      }
      return qs;
    }));
    showToast('Question deleted', 'info');
  };

  // Dropdown Management
  const addDropdownOption = (groupKey, name) => {
    const newItem = {
      id: `item-${Date.now()}`,
      name
    };
    setDropdowns(prev => ({
      ...prev,
      [groupKey]: [...(prev[groupKey] || []), newItem]
    }));
    showToast(`Option '${name}' added`, 'success');
  };

  const updateDropdownOption = (groupKey, id, newName) => {
    setDropdowns(prev => ({
      ...prev,
      [groupKey]: prev[groupKey].map(item => item.id === id ? { ...item, name: newName } : item)
    }));
    showToast('Dropdown option updated', 'success');
  };

  const deleteDropdownOption = (groupKey, id) => {
    setDropdowns(prev => ({
      ...prev,
      [groupKey]: prev[groupKey].filter(item => item.id !== id)
    }));
    showToast('Dropdown option removed', 'info');
  };

  // Role Management
  const createRole = (roleName, initialPermissions = []) => {
    const newRole = {
      id: `role-${Date.now()}`,
      name: roleName,
      description: `Custom role configured by administrator`,
      permissions: initialPermissions
    };
    setRoles(prev => [...prev, newRole]);
    showToast(`Role '${roleName}' created`, 'success');
    return newRole;
  };

  const updateRole = (roleId, updatedData) => {
    setRoles(prev => prev.map(r => r.id === roleId ? { ...r, ...updatedData } : r));
    showToast('Role permissions updated', 'success');
  };

  const renameRole = (roleId, newName) => {
    setRoles(prev => prev.map(r => r.id === roleId ? { ...r, name: newName } : r));
    showToast('Role renamed', 'success');
  };

  // Profile Management
  const createProfile = (profileData) => {
    const targetRole = roles.find(r => r.id === profileData.roleId) || roles[0];
    const initials = profileData.name ? profileData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
    const newProfile = {
      id: `prof-${Date.now()}`,
      avatar: initials,
      status: 'Active',
      roleName: targetRole.name,
      ...profileData
    };
    setProfiles(prev => [...prev, newProfile]);
    showToast(`User profile created for ${newProfile.name}`, 'success');
  };

  const updateProfile = (profileId, data) => {
    setProfiles(prev => prev.map(p => {
      if (p.id === profileId) {
        const role = data.roleId ? roles.find(r => r.id === data.roleId) : null;
        return {
          ...p,
          ...data,
          ...(role ? { roleName: role.name } : {})
        };
      }
      return p;
    }));
    showToast('Profile updated', 'success');
  };

  const deleteProfile = (profileId) => {
    if (profiles.length <= 1) {
      showToast('Cannot delete the last remaining user profile', 'error');
      return;
    }
    setProfiles(prev => prev.filter(p => p.id !== profileId));
    if (currentUserId === profileId) {
      const remaining = profiles.filter(p => p.id !== profileId);
      setCurrentUserId(remaining[0].id);
    }
    showToast('User profile removed', 'info');
  };

  // Settings
  const updateSystemSettings = (newSettings) => {
    setSystemSettings(prev => ({ ...prev, ...newSettings }));
    showToast('System branding updated', 'success');
  };

  // ==========================================
  // SENTRI CORE ACTIONS (Sections 18-22)
  // ==========================================

  // Auto-generate synopsis number SC-YYYYMMDD-####
  const generateSynopsisNumber = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const num = String(incidentReports.length + 42).padStart(4, '0');
    return `SC-${y}${m}${d}-${num}`;
  };

  const createIncidentReport = (reportData, submitDirectly = false) => {
    if (!hasPermission('create_incident_report')) {
      showToast('Permission denied: You cannot create incident reports.', 'error');
      return null;
    }
    const today = new Date().toISOString().split('T')[0];
    const newReport = {
      id: `ir-${Date.now()}`,
      synopsisNumber: generateSynopsisNumber(),
      creationDate: today,
      reportedBy: currentUser.name,
      evidenceImages: [],
      status: submitDirectly ? 'In Review' : 'Pending',
      reviewerName: '',
      closedDate: '',
      reopenHistory: [],
      ...reportData
    };

    setIncidentReports(prev => [newReport, ...prev]);
    showToast(`Incident Report ${newReport.synopsisNumber} created (${newReport.status})`, 'success');
    return newReport;
  };

  const updateIncidentReport = (reportId, updatedData) => {
    setIncidentReports(prev => prev.map(r => r.id === reportId ? { ...r, ...updatedData } : r));
    showToast('Incident report updated', 'success');
  };

  const sendIncidentReportForReview = (reportId) => {
    if (!hasPermission('send_incident_report')) {
      showToast('Permission denied: You cannot send reports for review.', 'error');
      return;
    }
    setIncidentReports(prev => prev.map(r => {
      if (r.id === reportId) {
        return { ...r, status: 'In Review' };
      }
      return r;
    }));
    showToast('Report submitted for supervisor review (Status: In Review)', 'success');
  };

  const reviewAndCloseIncidentReport = (reportId) => {
    if (!hasPermission('manage_incident_reports')) {
      showToast('Permission denied: Only supervisors or managers can close incident reports.', 'error');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    setIncidentReports(prev => prev.map(r => {
      if (r.id === reportId) {
        return {
          ...r,
          status: 'Closed',
          reviewerName: currentUser.name,
          closedDate: today
        };
      }
      return r;
    }));
    showToast('Incident report reviewed and Closed', 'success');
  };

  const sendBackIncidentReport = (reportId) => {
    if (!hasPermission('manage_incident_reports')) {
      showToast('Permission denied: Only supervisors can send reports back.', 'error');
      return;
    }
    setIncidentReports(prev => prev.map(r => {
      if (r.id === reportId) {
        return { ...r, status: 'Pending' };
      }
      return r;
    }));
    showToast('Report sent back to author (Status: Pending)', 'info');
  };

  const reopenIncidentReport = (reportId) => {
    if (!hasPermission('edit_closed_incident_report')) {
      showToast('Permission denied: Requires manager-level edit closed reports permission.', 'error');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    setIncidentReports(prev => prev.map(r => {
      if (r.id === reportId) {
        return {
          ...r,
          status: 'In Review',
          reopenHistory: [...(r.reopenHistory || []), { reopenedBy: currentUser.name, date: today }]
        };
      }
      return r;
    }));
    showToast('Closed report reopened back to In Review', 'warning');
  };

  const voidIncidentReport = (reportId) => {
    if (!hasPermission('edit_closed_incident_report') && !hasPermission('manage_incident_reports')) {
      showToast('Permission denied: Only managers can void reports.', 'error');
      return;
    }
    setIncidentReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'Void' } : r));
    showToast('Report status set to Void', 'info');
  };

  // Shift Audits (Section 21, 22)
  const createShiftAudit = (auditData) => {
    if (!hasPermission('create_sentri_audit')) {
      showToast('Permission denied: You cannot create shift audits.', 'error');
      return null;
    }
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const num = String(shiftAudits.length + 1).padStart(2, '0');
    
    const newShift = {
      id: `sa-${Date.now()}`,
      auditNumber: `SA-${y}${m}${d}-${num}`,
      shiftDate: now.toISOString().split('T')[0],
      shiftHours: '08:00 - 16:00',
      operatorName: currentUser.name,
      operatorId: 'OP-' + Math.floor(100 + Math.random() * 900),
      facilityZone: 'Mall',
      status: 'In Progress',
      sections: {
        hardware: {
          ptzCameras: { checked: true, note: 'Normal pan/tilt/zoom operation' },
          recordingServer: { checked: true, note: 'NVR recording active' },
          monitorWall: { checked: true, note: 'All streams clear' }
        },
        perimeter: {
          fenceIntegrity: { checked: true, note: 'No breaks or gaps' },
          accessDoorsAlarmed: { checked: true, note: 'Contacts reporting closed' },
          barrierGates: { checked: true, note: 'Access readers responsive' }
        },
        highRisk: {
          cashDropArea: { checked: true, note: 'Safe zone camera verified' },
          loadingDock: { checked: true, note: 'Overhead door sensors checked' },
          keyControlLog: { checked: true, note: 'Key custody log verified' }
        }
      },
      handoverSummary: '',
      pendingItems: '',
      operatorSignature: '',
      submittedAt: '',
      ...auditData
    };

    setShiftAudits(prev => [newShift, ...prev]);
    showToast(`Shift Audit ${newShift.auditNumber} started (In Progress)`, 'success');
    return newShift;
  };

  const updateShiftAudit = (auditId, updatedData) => {
    setShiftAudits(prev => prev.map(a => a.id === auditId ? { ...a, ...updatedData } : a));
  };

  const submitShiftAudit = (auditId, signature) => {
    if (!hasPermission('manage_sentri_audits')) {
      showToast('Permission denied: You cannot submit shift audits.', 'error');
      return;
    }
    const timestamp = new Date().toLocaleString();
    setShiftAudits(prev => prev.map(a => {
      if (a.id === auditId) {
        return {
          ...a,
          status: 'Submitted',
          operatorSignature: signature || `${currentUser.name} (Verified)`,
          submittedAt: timestamp
        };
      }
      return a;
    }));
    showToast('Shift Audit submitted and finalized!', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        // Auth
        isAuthenticated,
        authView,
        setAuthView,
        login,
        logout,
        register,
        // Theme
        theme,
        toggleTheme,
        currentView,
        setCurrentView,
        activeAuditId,
        setActiveAuditId,
        viewingReportAuditId,
        setViewingReportAuditId,
        showSendSummaryModal,
        setShowSendSummaryModal,
        showUserManualModal,
        setShowUserManualModal,
        showNewAuditModal,
        setShowNewAuditModal,
        // Sentri Core State
        showIncidentReportModal,
        setShowIncidentReportModal,
        activeIncidentReportId,
        setActiveIncidentReportId,
        showShiftAuditModal,
        setShowShiftAuditModal,
        activeShiftAuditId,
        setActiveShiftAuditId,
        toast,
        showToast,
        systemSettings,
        updateSystemSettings,
        currentUser,
        currentRole,
        currentUserId,
        switchUser,
        hasPermission,
        roles,
        createRole,
        updateRole,
        renameRole,
        profiles,
        createProfile,
        updateProfile,
        deleteProfile,
        locations,
        createLocation,
        updateLocation,
        deleteLocation,
        questionSets,
        createQuestionSet,
        addQuestionToSet,
        deleteQuestionFromSet,
        dropdowns,
        addDropdownOption,
        updateDropdownOption,
        deleteDropdownOption,
        audits,
        calculateAuditScore,
        startOrResumeAudit,
        updateAuditAnswer,
        overrideQuestionPoints,
        resetQuestionPointOverrides,
        updateAuditSchedule,
        addIncident,
        removeIncident,
        addSosRecord,
        toggleSosNA,
        addAuditNote,
        finalizeAndSendAudit,
        createAudit,
        // Sentri Core Operations
        incidentReports,
        createIncidentReport,
        updateIncidentReport,
        sendIncidentReportForReview,
        reviewAndCloseIncidentReport,
        sendBackIncidentReport,
        reopenIncidentReport,
        voidIncidentReport,
        shiftAudits,
        createShiftAudit,
        updateShiftAudit,
        submitShiftAudit
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
