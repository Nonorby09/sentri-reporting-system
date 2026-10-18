// Initial Seed Data for Sentri Remote Reporting System (October 6, 2026 Edition)

export const INITIAL_SYSTEM_SETTINGS = {
  systemName: "Sentri Remote Reporting System",
  tagline: "Audit & Reporting Management System",
  version: "1.0",
  lastUpdated: "October 6, 2026",
  logoUrl: "", // blank uses default SVG brand icon
};

export const INITIAL_ROLES = [
  {
    id: "role-admin",
    name: "Administrator",
    description: "Full system administrative access to all auditing, reporting, management, and Sentri Core features.",
    permissions: [
      "view_schedule",
      "start_audit",
      "create_audit",
      "send_audit",
      "send_email_report",
      "download_report",
      "manage_incidents",
      "manage_sos",
      "manage_notes",
      "admin_fields",
      "admin_dropdowns",
      "edit_dropdowns",
      "manage_locations",
      "admin_profiles",
      "admin_roles",
      "manage_system_settings",
      // Sentri Core Permissions
      "view_sentri_core",
      "view_sentri_dashboard",
      "create_incident_report",
      "send_incident_report",
      "manage_incident_reports",
      "edit_closed_incident_report",
      "create_sentri_audit",
      "manage_sentri_audits",
      "download_sentri_report"
    ]
  },
  {
    id: "role-supervisor",
    name: "Supervisor",
    description: "Supervises field audits, reviews completed audits, and reviews & closes security incident reports.",
    permissions: [
      "view_schedule",
      "start_audit",
      "send_audit",
      "send_email_report",
      "download_report",
      "manage_incidents",
      "manage_sos",
      "manage_notes",
      "view_sentri_core",
      "view_sentri_dashboard",
      "manage_incident_reports",
      "download_sentri_report"
    ]
  },
  {
    id: "role-operator",
    name: "Operator",
    description: "Field auditor and surveillance operator responsible for audits, shift checks, and logging incident reports.",
    permissions: [
      "view_schedule",
      "start_audit",
      "create_audit",
      "download_report",
      "manage_incidents",
      "manage_sos",
      "manage_notes",
      "edit_dropdowns",
      "view_sentri_core",
      "view_sentri_dashboard",
      "create_incident_report",
      "send_incident_report",
      "create_sentri_audit",
      "manage_sentri_audits",
      "download_sentri_report",
      "send_email_report"
    ]
  },
  {
    id: "role-client",
    name: "Client",
    description: "Property owner or stakeholder with read access to reports and location notes.",
    permissions: [
      "view_schedule",
      "download_report",
      "send_email_report",
      "manage_notes",
      "manage_sos",
      "manage_incidents"
    ]
  }
];

export const INITIAL_PROFILES = [
  {
    id: "prof-1",
    name: "Alex Mercer",
    email: "alex.mercer@sentri.io",
    roleId: "role-admin",
    roleName: "Administrator",
    status: "Active",
    avatar: "AM",
    // SHA-256 of "Admin@2026"
    passwordHash: "a36aef5a11c4073fbe60314fc9df530a9d5f986533594d1f5190742ff9e0e408"
  },
  {
    id: "prof-2",
    name: "Sarah Jenkins",
    email: "sarah.j@sentri.io",
    roleId: "role-supervisor",
    roleName: "Supervisor",
    status: "Active",
    avatar: "SJ",
    // SHA-256 of "Supervisor@2026"
    passwordHash: "73a0df17d5eae70d1e53d5e73f83657081034552a4ec80cb9d672bfc4e18c148"
  },
  {
    id: "prof-3",
    name: "Carlos Reyes",
    email: "carlos.r@sentri.io",
    roleId: "role-operator",
    roleName: "Operator",
    status: "Active",
    avatar: "CR",
    // SHA-256 of "Operator@2026"
    passwordHash: "e5acb4dbf79bf17638db57ab11b92fee8f8047b07c67b3896a8f1af80aafde3f"
  },
  {
    id: "prof-4",
    name: "David Chen",
    email: "david.chen@jollibeegroup.com",
    roleId: "role-client",
    roleName: "Client",
    status: "Active",
    avatar: "DC",
    // SHA-256 of "Client@2026"
    passwordHash: "9e1b6928325caf4d330da9d7398b48c6bfe74a521a8cd0d5b8b010f4a23fa497"
  }
];

export const INITIAL_DROPDOWNS = {
  incidentTypes: [
    { id: "inc-1", name: "Road Block" },
    { id: "inc-2", name: "Tresspasing" },
    { id: "inc-3", name: "Cash Theft" },
    { id: "inc-4", name: "Equipment Breakdown" },
    { id: "inc-5", name: "Safety Hazard" }
  ],
  sosTypes: [
    { id: "sos-1", name: "Counter" },
    { id: "sos-2", name: "Drive Thru" },
    { id: "sos-3", name: "Reception" }
  ],
  questionCategories: [
    { id: "cat-1", name: "Food Safety" },
    { id: "cat-2", name: "Operations" },
    { id: "cat-3", name: "Cleanliness" },
    { id: "cat-4", name: "Cash & Security" },
    { id: "cat-5", name: "Facility Maintenance" }
  ],
  // Technical incident categories for Sentri Core (Section 19)
  sentriIncidentTitles: [
    { id: "sit-1", name: "Trespassing" },
    { id: "sit-2", name: "Suspicious Activity" },
    { id: "sit-3", name: "Fire / Smoke Detection" },
    { id: "sit-4", name: "Theft / Shoplifting" },
    { id: "sit-5", name: "Vandalism / Property Damage" },
    { id: "sit-6", name: "Access Violation / Door Forced" },
    { id: "sit-7", name: "Physical Altercation" },
    { id: "sit-8", name: "Cash Discrepancy" }
  ],
  facilityZones: [
    { id: "fz-1", name: "Mall" },
    { id: "fz-2", name: "Office Tower" },
    { id: "fz-3", name: "Parking" }
  ],
  reportTypes: [
    { id: "rt-1", name: "Observation" },
    { id: "rt-2", name: "Client Reported" },
    { id: "rt-3", name: "Audit" }
  ]
};

export const INITIAL_LOCATIONS = [
  {
    id: "loc-1",
    name: "Jollibee - Metro Central Plaza",
    address: "452 Metro Avenue, Financial District, City Center",
    organization: "Jollibee Foods Corp",
    brand: "Jollibee",
    segment: "QSR",
    tags: ["Drive-thru", "High-Volume", "Flagship"],
    ownerEmail: "store452@jollibeegroup.com"
  },
  {
    id: "loc-2",
    name: "Jollibee - Westgate Promenade",
    address: "890 Westgate Blvd, Suite 102, Westside",
    organization: "Jollibee Foods Corp",
    brand: "Jollibee",
    segment: "QSR",
    tags: ["Mall-Kiosk", "High-Foot-Traffic"],
    ownerEmail: "store890@jollibeegroup.com"
  },
  {
    id: "loc-3",
    name: "Red Ribbon Bakeshop - Harbor Boulevard",
    address: "120 Harbour Front Plaza, Waterfront",
    organization: "Jollibee Foods Corp",
    brand: "Red Ribbon",
    segment: "Bakery & Cafe",
    tags: ["Standalone", "Patio-Seating"],
    ownerEmail: "harbor120@redribbonbakeshop.com"
  }
];

export const INITIAL_QUESTION_SETS = [
  {
    id: "qs-1",
    name: "Jolibee",
    description: "Standard operational and quality compliance audit checklist for Jollibee locations.",
    questions: [
      {
        id: "q-101",
        text: "Are all food contact surfaces clean, sanitized, and sanitizing solution at proper PPM?",
        category: "Food Safety",
        points: 10,
        guideline: "Check sanitizer buckets with test strips (minimum 200 PPM quaternary ammonia required). Wipe cloth stored in bucket when not in use."
      },
      {
        id: "q-102",
        text: "Are walk-in freezer and refrigeration units maintaining required temperatures (≤0°F / ≤38°F)?",
        category: "Food Safety",
        points: 10,
        guideline: "Verify digital console readouts and secondary analog thermometer in warmest zone. Check logbook entries for today."
      },
      {
        id: "q-103",
        text: "Are cash registers secured, drawer keys in staff possession, and currency unattended?",
        category: "Cash & Security",
        points: 15,
        guideline: "Register drawers must be closed between transactions. Maximum cash limit per register strictly enforced. Safe combination protected."
      },
      {
        id: "q-104",
        text: "Is dining room floor, condiment bar, and seating clean and free from spills?",
        category: "Cleanliness",
        points: 10,
        guideline: "Tables must be sanitized within 90 seconds after guest departure. Trash receptacles should not exceed 75% capacity."
      },
      {
        id: "q-105",
        text: "Are drive-thru headsets and order confirmation displays functioning properly?",
        category: "Operations",
        points: 5,
        guideline: "Verify audio clarity on lane headsets and ensure POS display mirrors guest order without delay."
      },
      {
        id: "q-106",
        text: "Are emergency exit routes fully unobstructed and emergency lights operable?",
        category: "Facility Maintenance",
        points: 15,
        guideline: "OSHA standard compliance: Clear 36-inch pathway to all egress doors. Panic hardware must operate smoothly without sticking."
      }
    ]
  },
  {
    id: "qs-2",
    name: "test 1",
    description: "Rapid turnaround service audit testing core greeting and speed benchmarks.",
    questions: [
      {
        id: "q-201",
        text: "Is staff wearing proper uniform, apron, name tag, and hair restraint?",
        category: "Operations",
        points: 5,
        guideline: "Standard branded uniform with name badge on left chest. Hairnets or caps required for all kitchen and counter personnel."
      },
      {
        id: "q-202",
        text: "Was prompt greeting delivered within 5 seconds of customer arrival at counter?",
        category: "Operations",
        points: 5,
        guideline: "Warm eye contact and branded greeting ('Welcome to Jollibee!') delivered upon arrival."
      },
      {
        id: "q-203",
        text: "Was the order accurately repeated and payment receipt offered to the guest?",
        category: "Operations",
        points: 5,
        guideline: "Verify register order readback and that receipt is handed directly to customer."
      }
    ]
  }
];

export const INITIAL_AUDITS = [
  {
    id: "audit-101",
    reportId: "SRR-2026-0891",
    locationId: "loc-1",
    locationName: "Jollibee - Metro Central Plaza",
    organization: "Jollibee Foods Corp",
    brand: "Jollibee",
    questionSetId: "qs-1",
    questionSetName: "Jolibee",
    scheduledDate: "2026-10-06",
    scheduledTime: "10:30",
    actualDate: "2026-10-06",
    actualTime: "10:35",
    status: "In Progress",
    auditor: "Carlos Reyes",
    ownerEmail: "store452@jollibeegroup.com",
    segment: "QSR",
    tags: ["Drive-thru", "High-Volume"],
    posCount: 6,
    contracted: true,
    ticketsCount: 420,
    answers: {
      "q-101": { answer: "Yes", notes: "Test strip indicated 250 PPM. Buckets labeled appropriately.", attachments: ["sanitizer_check.jpg"] },
      "q-102": { answer: "Yes", notes: "Freezer at -2°F, refrigerator at 36°F.", attachments: [] },
      "q-103": { answer: "No", notes: "Register 2 drawer was left cracked open while cashier stepped to drink station.", attachments: ["reg2_open.jpg"] },
      "q-104": { answer: "Yes", notes: "Clean and dry dining room, bus carts cleared.", attachments: [] }
    },
    pointOverrides: {},
    incidents: [
      {
        id: "inc-rec-1",
        type: "Cash Theft",
        description: "Cash drawer discrepancy detected during spot count on register 2.",
        reportedAt: "2026-10-06 11:15"
      }
    ],
    speedOfService: {
      isNA: false,
      records: [
        {
          id: "sos-rec-1",
          type: "Drive Thru",
          mode: "Single",
          startTime: "10:45:12 AM",
          endTime: "10:47:38 AM",
          durationSeconds: 146,
          durationFormatted: "2m 26s",
          description: "Lunch peak hour order to delivery.",
          screenshots: ["dt_timer.png"]
        }
      ]
    },
    notes: [
      {
        id: "note-1",
        author: "Carlos Reyes",
        date: "2026-10-06 10:40",
        text: "Store manager Jane Cooper on duty. Shift started on schedule."
      }
    ]
  },
  {
    id: "audit-102",
    reportId: "SRR-2026-0887",
    locationId: "loc-2",
    locationName: "Jollibee - Westgate Promenade",
    organization: "Jollibee Foods Corp",
    brand: "Jollibee",
    questionSetId: "qs-1",
    questionSetName: "Jolibee",
    scheduledDate: "2026-10-05",
    scheduledTime: "14:00",
    actualDate: "2026-10-05",
    actualTime: "14:05",
    status: "Sent",
    auditor: "Sarah Jenkins",
    ownerEmail: "store890@jollibeegroup.com",
    segment: "QSR",
    tags: ["Mall-Kiosk"],
    posCount: 4,
    contracted: true,
    ticketsCount: 280,
    answers: {
      "q-101": { answer: "Yes", notes: "Chlorine test strips at 100ppm.", attachments: ["sanitizer.png"] },
      "q-102": { answer: "Yes", notes: "Walk in at 35F.", attachments: ["walkin.jpg"] },
      "q-103": { answer: "Yes", notes: "Keys secured on supervisor lanyards.", attachments: [] },
      "q-104": { answer: "Yes", notes: "Spotless dining hall.", attachments: ["dining.jpg"] },
      "q-105": { answer: "N/A", notes: "Location does not feature a drive thru lane.", attachments: [] },
      "q-106": { answer: "Yes", notes: "All emergency egress exits verified clear.", attachments: ["exit_sign.jpg"] }
    },
    pointOverrides: {
      "q-101": 8
    },
    incidents: [],
    speedOfService: {
      isNA: false,
      records: [
        {
          id: "sos-rec-2",
          type: "Counter",
          mode: "Average",
          startTime: "14:10:00 PM",
          endTime: "14:11:45 PM",
          durationSeconds: 105,
          durationFormatted: "1m 45s",
          description: "Counter transaction speed test.",
          screenshots: []
        }
      ]
    },
    notes: [
      {
        id: "note-2",
        author: "Sarah Jenkins",
        date: "2026-10-05 15:30",
        text: "Audit finalized and sent to franchise group management."
      }
    ]
  },
  {
    id: "audit-103",
    reportId: "SRR-2026-0895",
    locationId: "loc-3",
    locationName: "Red Ribbon Bakeshop - Harbor Boulevard",
    organization: "Jollibee Foods Corp",
    brand: "Red Ribbon",
    questionSetId: "qs-2",
    questionSetName: "test 1",
    scheduledDate: "2026-10-08",
    scheduledTime: "09:00",
    actualDate: "",
    actualTime: "",
    status: "Scheduled",
    auditor: "Carlos Reyes",
    ownerEmail: "harbor120@redribbonbakeshop.com",
    segment: "Bakery & Cafe",
    tags: ["Standalone"],
    posCount: 2,
    contracted: false,
    ticketsCount: 150,
    answers: {},
    pointOverrides: {},
    incidents: [],
    speedOfService: {
      isNA: true,
      records: []
    },
    notes: []
  }
];

// Sentri Core Incident Reports Seed Data (Sections 18-20)
export const INITIAL_INCIDENT_REPORTS = [
  {
    id: "ir-101",
    synopsisNumber: "SC-20261006-0042",
    creationDate: "2026-10-06",
    reportedBy: "Carlos Reyes",
    locationId: "loc-1",
    locationName: "Jollibee - Metro Central Plaza",
    reportType: "Observation", // Observation, Client Reported, Audit
    area: "Perimeter", // Perimeter, Inner Zone
    incidentTitle: "Trespassing",
    riskLevel: "High", // Low, Medium, High, N/A
    eventDate: "2026-10-06",
    eventTime: "02:15",
    narrative: "Surveillance camera 4 detected an unauthorized individual scaling the perimeter fencing near the rear trash compactor and back service delivery dock after operating hours.",
    actionTaken: "Security patrol was dispatched immediately via radio. Subject was challenged, escorted off property, and fence locking latch was reinforced.",
    evidenceImages: ["breach_cam04.jpg", "patrol_dispatch.png"],
    status: "Closed", // Pending, In Review, Closed, Void
    reviewerName: "Alex Mercer",
    closedDate: "2026-10-06",
    reopenHistory: []
  },
  {
    id: "ir-102",
    synopsisNumber: "SC-20261006-0043",
    creationDate: "2026-10-06",
    reportedBy: "Carlos Reyes",
    locationId: "loc-2",
    locationName: "Jollibee - Westgate Promenade",
    reportType: "Client Reported",
    area: "Inner Zone",
    incidentTitle: "Suspicious Activity",
    riskLevel: "Medium",
    eventDate: "2026-10-06",
    eventTime: "14:30",
    narrative: "Shift manager reported an individual attempting to look over the counter divider near the cash drop safe while cashier was distracted with lunch rush.",
    actionTaken: "Reviewed PTZ Camera 2 footage. Notified floor supervisor who stationed a visible team member by the register station. Subject vacated the premises without incident.",
    evidenceImages: ["ptz_cam02_counter.jpg"],
    status: "In Review",
    reviewerName: "",
    closedDate: "",
    reopenHistory: []
  },
  {
    id: "ir-103",
    synopsisNumber: "SC-20261005-0039",
    creationDate: "2026-10-05",
    reportedBy: "Sarah Jenkins",
    locationId: "loc-3",
    locationName: "Red Ribbon Bakeshop - Harbor Boulevard",
    reportType: "Audit",
    area: "Perimeter",
    incidentTitle: "Safety Hazard",
    riskLevel: "Low",
    eventDate: "2026-10-05",
    eventTime: "19:45",
    narrative: "Damaged emergency exit lamp fixture discovered with hanging wire conduit adjacent to delivery alley.",
    actionTaken: "Conduit taped and isolated. Work order maintenance request #WO-9918 submitted to facility team.",
    evidenceImages: ["hazard_exit_lamp.jpg"],
    status: "Pending",
    reviewerName: "",
    closedDate: "",
    reopenHistory: []
  }
];

// Sentri Core Shift Audits Seed Data (Sections 21-22)
export const INITIAL_SHIFT_AUDITS = [
  {
    id: "sa-101",
    auditNumber: "SA-20261006-01",
    locationId: "loc-1",
    locationName: "Jollibee - Metro Central Plaza",
    shiftDate: "2026-10-06",
    shiftHours: "06:00 - 14:00 (Morning Shift)",
    operatorName: "Carlos Reyes",
    operatorId: "CR-894",
    facilityZone: "Mall", // Office Tower, Mall, Parking
    status: "Submitted", // In Progress, Submitted
    sections: {
      hardware: {
        ptzCameras: { checked: true, note: "All 18 camera feeds functional" },
        recordingServer: { checked: true, note: "NVR storage retention at 42 days" },
        monitorWall: { checked: true, note: "Primary display console optimal" }
      },
      perimeter: {
        fenceIntegrity: { checked: true, note: "No breach detected on visual sweep" },
        accessDoorsAlarmed: { checked: true, note: "Emergency egress contacts online" },
        barrierGates: { checked: true, note: "Delivery lane gate operational" }
      },
      highRisk: {
        cashDropArea: { checked: true, note: "Full angle coverage on safe vault" },
        loadingDock: { checked: true, note: "Monitored during morning deliveries" },
        keyControlLog: { checked: true, note: "Supervisor signed shift checkout" }
      }
    },
    handoverSummary: "Morning peak hours monitored without major alert. One perimeter check conducted at 09:30. Handover completed to Sarah Jenkins.",
    pendingItems: "Scheduled Camera 4 PTZ firmware update pending for tomorrow night.",
    operatorSignature: "Carlos Reyes (Verified Operator)",
    submittedAt: "2026-10-06 13:55"
  },
  {
    id: "sa-102",
    auditNumber: "SA-20261006-02",
    locationId: "loc-2",
    locationName: "Jollibee - Westgate Promenade",
    shiftDate: "2026-10-06",
    shiftHours: "14:00 - 22:00 (Swing Shift)",
    operatorName: "Sarah Jenkins",
    operatorId: "SJ-402",
    facilityZone: "Office Tower",
    status: "In Progress",
    sections: {
      hardware: {
        ptzCameras: { checked: true, note: "Cameras online" },
        recordingServer: { checked: true, note: "Retention OK" },
        monitorWall: { checked: true, note: "Normal operation" }
      },
      perimeter: {
        fenceIntegrity: { checked: true, note: "Checks passed" },
        accessDoorsAlarmed: { checked: false, note: "Door 3 contact loose sensor reported" },
        barrierGates: { checked: true, note: "Functioning" }
      },
      highRisk: {
        cashDropArea: { checked: true, note: "Under constant view" },
        loadingDock: { checked: true, note: "Dock clear" },
        keyControlLog: { checked: true, note: "Log matched" }
      }
    },
    handoverSummary: "Ongoing monitoring. Door 3 sensor alert will be monitored through end of shift.",
    pendingItems: "Facility electrician technician arriving at 20:00 to test Door 3 sensor contact.",
    operatorSignature: "",
    submittedAt: ""
  }
];
