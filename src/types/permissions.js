// Sentri Remote Reporting System - Complete 25 System Permissions
// Extracted from Section 15 & 18-23 "Admin: Roles & Permissions & Sentri Core" of the October 6, 2026 User Manual

export const ALL_PERMISSIONS = [
  // Auditing Permissions
  {
    key: 'view_schedule',
    name: 'View schedule',
    description: 'Allows viewing the schedule dashboard and audit lists',
    category: 'Auditing'
  },
  {
    key: 'start_audit',
    name: 'Start / continue audits',
    description: 'Allows opening scheduled audits and recording answers',
    category: 'Auditing'
  },
  {
    key: 'create_audit',
    name: 'Create new audits',
    description: 'Allows scheduling and creating new audit events',
    category: 'Auditing'
  },

  // Reporting Permissions
  {
    key: 'send_audit',
    name: 'Send audit reports',
    description: 'Allows finalizing and sending completed audit reports',
    category: 'Reporting'
  },
  {
    key: 'send_email_report',
    name: 'Email report to owner',
    description: 'Allows emailing generated audit reports to stakeholders',
    category: 'Reporting'
  },
  {
    key: 'download_report',
    name: 'Download audit reports (PDF)',
    description: 'Allows downloading the audit report as a PDF document',
    category: 'Reporting'
  },

  // Field Operations Permissions
  {
    key: 'manage_incidents',
    name: 'Manage incidents',
    description: 'Allows reporting, modifying, and tracking audit incidents',
    category: 'Field Operations'
  },
  {
    key: 'manage_sos',
    name: 'Manage speed of service',
    description: 'Allows recording speed-of-service measurements and timings',
    category: 'Field Operations'
  },
  {
    key: 'manage_notes',
    name: 'Manage client / location notes',
    description: 'Allows viewing and adding client and location notes',
    category: 'Field Operations'
  },

  // Administration Permissions
  {
    key: 'admin_fields',
    name: 'Admin: customize fields',
    description: 'Allows configuring question sets and individual questions',
    category: 'Administration'
  },
  {
    key: 'admin_dropdowns',
    name: 'Admin: manage dropdowns',
    description: 'Allows managing selectable dropdown lists across the system',
    category: 'Administration'
  },
  {
    key: 'edit_dropdowns',
    name: 'Edit dropdown options',
    description: 'Allows adding, editing, and deleting options within dropdown lists',
    category: 'Administration'
  },
  {
    key: 'manage_locations',
    name: 'Admin: manage locations',
    description: 'Allows adding, updating, and removing auditable sites and locations',
    category: 'Administration'
  },
  {
    key: 'admin_profiles',
    name: 'Admin: manage profiles',
    description: 'Allows managing user profiles, invitations, and active status',
    category: 'Administration'
  },
  {
    key: 'admin_roles',
    name: 'Admin: manage roles',
    description: 'Allows creating and editing roles and permission assignments',
    category: 'Administration'
  },
  {
    key: 'manage_system_settings',
    name: 'Admin: system name & logo',
    description: 'Allows modifying branding, system name, and downloading the user manual',
    category: 'Administration'
  },

  // Sentri Core Dedicated Permissions (New in October 6, 2026 Manual)
  {
    key: 'view_sentri_core',
    name: 'Sentri Core: access module',
    description: 'Grants access to the Sentri Core security module navigation and views',
    category: 'Sentri Core'
  },
  {
    key: 'view_sentri_dashboard',
    name: 'Sentri Core: view real-time dashboard',
    description: 'Allows viewing the real-time incident reports dashboard and live activity',
    category: 'Sentri Core'
  },
  {
    key: 'create_incident_report',
    name: 'Sentri Core: create incident reports',
    description: 'Allows creating new security incident reports with synopsis numbers',
    category: 'Sentri Core'
  },
  {
    key: 'send_incident_report',
    name: 'Sentri Core: send reports for review',
    description: 'Allows advancing incident reports from Pending to In Review',
    category: 'Sentri Core'
  },
  {
    key: 'manage_incident_reports',
    name: 'Sentri Core: review & close reports (supervisor)',
    description: 'Allows supervisors and managers to review, return, or close incident reports',
    category: 'Sentri Core'
  },
  {
    key: 'edit_closed_incident_report',
    name: 'Sentri Core: edit closed reports (manager+)',
    description: 'Allows managerial override to reopen or modify closed incident reports',
    category: 'Sentri Core'
  },
  {
    key: 'create_sentri_audit',
    name: 'Sentri Core: create shift audits',
    description: 'Allows creating new surveillance shift audits for facility zones',
    category: 'Sentri Core'
  },
  {
    key: 'manage_sentri_audits',
    name: 'Sentri Core: edit / submit shift audits',
    description: 'Allows completing checklist sections, handovers, and submitting shift audits',
    category: 'Sentri Core'
  },
  {
    key: 'download_sentri_report',
    name: 'Sentri Core: download reports (PDF)',
    description: 'Allows downloading incident report PDFs and shift audit summary PDFs',
    category: 'Sentri Core'
  }
];

export const PERMISSION_CATEGORIES = [
  'Auditing',
  'Reporting',
  'Field Operations',
  'Administration',
  'Sentri Core'
];
