import { jsPDF } from 'jspdf';

// Helper to generate Standard Audit Report PDF
export function generateAuditReportPDF(audit, questionSet, calculatedScore, systemSettings) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let y = 16;

  const primaryR = 79;
  const primaryG = 70;
  const primaryB = 229;

  // Header Banner
  doc.setFillColor(primaryR, primaryG, primaryB);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(systemSettings?.systemName || 'Sentri Remote Reporting System', margin, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('AUDIT & COMPLIANCE INSPECTION REPORT', margin, 18);
  doc.text(`Report ID: ${audit.reportId}  |  Generated: ${new Date().toLocaleDateString()}`, margin, 23);

  // Score Badge
  const scoreBadgeWidth = 42;
  const scoreBadgeHeight = 18;
  const scoreBadgeX = pageWidth - margin - scoreBadgeWidth;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(scoreBadgeX, 5, scoreBadgeWidth, scoreBadgeHeight, 2, 2, 'F');

  doc.setTextColor(primaryR, primaryG, primaryB);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  const scoreText = `${calculatedScore.percentage}%`;
  doc.text(scoreText, scoreBadgeX + (scoreBadgeWidth / 2), 14, { align: 'center' });

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`${calculatedScore.earnedPoints} / ${calculatedScore.maxPossiblePoints} Points`, scoreBadgeX + (scoreBadgeWidth / 2), 19, { align: 'center' });

  y = 36;

  // Location & Audit Metadata Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, pageWidth - (margin * 2), 24, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(audit.locationName || 'Audit Location', margin + 4, y + 6);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Organization: ${audit.organization || 'N/A'}    |    Brand: ${audit.brand || 'N/A'}    |    Segment: ${audit.segment || 'N/A'}`, margin + 4, y + 12);
  doc.text(`Auditor: ${audit.auditor || 'Unassigned'}    |    Audit Date: ${audit.actualDate || audit.scheduledDate} ${audit.actualTime || audit.scheduledTime || ''}`, margin + 4, y + 17);
  doc.text(`Question Set: ${audit.questionSetName || 'Standard Audit'}    |    Status: ${audit.status.toUpperCase()}`, margin + 4, y + 21);

  y += 30;

  // Metrics Bar
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, pageWidth - (margin * 2), 12, 1, 1, 'F');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  
  const colW = (pageWidth - (margin * 2)) / 5;
  doc.text(`Passed: ${calculatedScore.passedCount}`, margin + (colW * 0.5), y + 7, { align: 'center' });
  doc.text(`Failed: ${calculatedScore.failedCount}`, margin + (colW * 1.5), y + 7, { align: 'center' });
  doc.text(`N/A: ${calculatedScore.naCount}`, margin + (colW * 2.5), y + 7, { align: 'center' });
  doc.text(`Incidents: ${audit.incidents?.length || 0}`, margin + (colW * 3.5), y + 7, { align: 'center' });
  doc.text(`SoS Records: ${audit.speedOfService?.isNA ? 'N/A' : (audit.speedOfService?.records?.length || 0)}`, margin + (colW * 4.5), y + 7, { align: 'center' });

  y += 18;

  // Incidents Section
  if (audit.incidents && audit.incidents.length > 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(185, 28, 28);
    doc.text(`INCIDENTS REPORTED (${audit.incidents.length})`, margin, y);
    y += 5;

    audit.incidents.forEach((inc) => {
      doc.setFillColor(254, 242, 242);
      doc.setDrawColor(252, 165, 165);
      doc.roundedRect(margin, y, pageWidth - (margin * 2), 12, 1, 1, 'FD');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(153, 27, 27);
      doc.text(`[${inc.type}]`, margin + 3, y + 5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      doc.text(inc.description || 'No description provided', margin + 30, y + 5);
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(`Reported: ${inc.reportedAt || 'During audit'}`, margin + 3, y + 9);
      y += 14;
    });
    y += 4;
  }

  // Questions Findings Table
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('AUDIT FINDINGS & DETAILED QUESTION SCORING', margin, y);
  y += 5;

  doc.setFillColor(primaryR, primaryG, primaryB);
  doc.rect(margin, y, pageWidth - (margin * 2), 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('CATEGORY & QUESTION', margin + 3, y + 4.5);
  doc.text('ANSWER', margin + 125, y + 4.5);
  doc.text('POINTS', margin + 148, y + 4.5);
  doc.text('ATTACHMENTS', margin + 165, y + 4.5);
  y += 8;

  const questions = questionSet?.questions || [];

  questions.forEach((q, idx) => {
    if (y > pageHeight - 25) {
      doc.addPage();
      y = 15;
    }

    const answerData = audit.answers?.[q.id] || { answer: 'Unanswered', notes: '', attachments: [] };
    const ans = answerData.answer || 'Unanswered';
    const isOverridden = audit.pointOverrides && audit.pointOverrides[q.id] !== undefined;
    
    let earnedPoints = isOverridden ? audit.pointOverrides[q.id] : (ans === 'Yes' ? q.points : 0);
    const pointsText = ans === 'N/A' ? 'N/A' : `${earnedPoints}/${q.points}${isOverridden ? ' *' : ''}`;

    doc.setFillColor(idx % 2 === 0 ? 255 : 249, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
    doc.setDrawColor(226, 232, 240);
    
    const rowHeight = answerData.notes ? 14 : 10;
    doc.roundedRect(margin, y, pageWidth - (margin * 2), rowHeight, 1, 1, 'FD');

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(`[${q.category.toUpperCase()}]`, margin + 3, y + 4);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    const splitText = doc.splitTextToSize(q.text, 115);
    doc.text(splitText[0] || q.text, margin + 3, y + 8);

    doc.setFont('helvetica', 'bold');
    if (ans === 'Yes') doc.setTextColor(22, 101, 52);
    else if (ans === 'No') doc.setTextColor(185, 28, 28);
    else doc.setTextColor(100, 116, 139);
    doc.text(ans, margin + 125, y + 6);

    doc.setTextColor(15, 23, 42);
    doc.text(pointsText, margin + 148, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`${answerData.attachments?.length || 0} file(s)`, margin + 165, y + 6);

    if (answerData.notes) {
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'italic');
      doc.text(`Notes: "${answerData.notes.substring(0, 95)}${answerData.notes.length > 95 ? '...' : ''}"`, margin + 3, y + 12);
    }

    y += rowHeight + 2;
  });

  doc.save(`${audit.reportId || 'Audit_Report'}.pdf`);
}

// NEW: Helper to generate Sentri Core Incident Report PDF (Section 19, 20)
export function generateIncidentReportPDF(report, systemSettings) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y = 16;

  // Header Banner
  doc.setFillColor(225, 29, 72); // Rose/Crimson Security Brand
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('SENTRI CORE — SECURITY INCIDENT REPORT', margin, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Synopsis Number: ${report.synopsisNumber}   |   Status: ${report.status.toUpperCase()}`, margin, 18);
  doc.text(`Creation Date: ${report.creationDate}   |   System: ${systemSettings?.systemName || 'Sentri'}`, margin, 23);

  // Status Badge
  const badgeW = 38;
  const badgeH = 16;
  const badgeX = pageWidth - margin - badgeW;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(badgeX, 6, badgeW, badgeH, 2, 2, 'F');
  doc.setTextColor(225, 29, 72);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(report.status.toUpperCase(), badgeX + (badgeW / 2), 14, { align: 'center' });
  doc.setFontSize(7);
  doc.text(`Risk: ${report.riskLevel || 'N/A'}`, badgeX + (badgeW / 2), 19, { align: 'center' });

  y = 36;

  // Metadata Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, pageWidth - (margin * 2), 34, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Incident: ${report.incidentTitle}`, margin + 4, y + 7);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Location: ${report.locationName}    |    Area: ${report.area || 'Perimeter'}`, margin + 4, y + 14);
  doc.text(`Report Type: ${report.reportType}    |    Event Time: ${report.eventDate} ${report.eventTime}`, margin + 4, y + 20);
  doc.text(`Reported By: ${report.reportedBy}    |    Reviewer: ${report.reviewerName || 'Pending'}`, margin + 4, y + 26);
  if (report.closedDate) {
    doc.text(`Closed On: ${report.closedDate}`, margin + 4, y + 31);
  }

  y += 42;

  // Narrative Box
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('INCIDENT NARRATIVE & SEQUENCE OF EVENTS', margin, y);
  y += 5;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, pageWidth - (margin * 2), 35, 2, 2, 'FD');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  const narrativeLines = doc.splitTextToSize(report.narrative || 'No narrative provided.', pageWidth - (margin * 2) - 8);
  doc.text(narrativeLines, margin + 4, y + 6);

  y += 42;

  // Action Taken Box
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('ACTION TAKEN BY OPERATORS / SUPERVISORS', margin, y);
  y += 5;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, pageWidth - (margin * 2), 28, 2, 2, 'FD');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  const actionLines = doc.splitTextToSize(report.actionTaken || 'No action recorded.', pageWidth - (margin * 2) - 8);
  doc.text(actionLines, margin + 4, y + 6);

  y += 35;

  // Evidence Summary
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`EVIDENCE ATTACHMENTS (${report.evidenceImages?.length || 0})`, margin, y);
  y += 5;

  if (report.evidenceImages && report.evidenceImages.length > 0) {
    report.evidenceImages.forEach((img, idx) => {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(`[Image ${idx + 1}] ${img} — Verified by Operator on shift`, margin + 4, y);
      y += 5;
    });
  } else {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(148, 163, 184);
    doc.text('No photos or external files attached to this report.', margin + 4, y);
    y += 5;
  }

  y += 10;
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 116, 139);
  doc.text('IMMUTABLE AUDIT RECORD — Generated by Sentri Core Surveillance Platform.', margin, y);

  doc.save(`${report.synopsisNumber || 'Incident_Report'}.pdf`);
}

// NEW: Helper to generate Sentri Shift Audit PDF (Section 21, 22)
export function generateShiftAuditPDF(shiftAudit, systemSettings) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y = 16;

  // Header Banner
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('SENTRI SURVEILLANCE SHIFT AUDIT REPORT', margin, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Audit Number: ${shiftAudit.auditNumber}   |   Status: ${shiftAudit.status.toUpperCase()}`, margin, 18);
  doc.text(`Facility Zone: ${shiftAudit.facilityZone}   |   Shift Date: ${shiftAudit.shiftDate}`, margin, 23);

  y = 36;

  // Metadata Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, pageWidth - (margin * 2), 24, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.text(shiftAudit.locationName, margin + 4, y + 6);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Shift Hours: ${shiftAudit.shiftHours}    |    Operator: ${shiftAudit.operatorName} (ID: ${shiftAudit.operatorId})`, margin + 4, y + 13);
  doc.text(`Submitted At: ${shiftAudit.submittedAt || 'Draft'}    |    Signature: ${shiftAudit.operatorSignature || 'Signed'}`, margin + 4, y + 19);

  y += 32;

  // Checklist Sections
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('SURVEILLANCE CHECKLIST SECTION RESULTS', margin, y);
  y += 6;

  const sectionsList = [
    { title: '1. Camera & Hardware Checks', items: shiftAudit.sections?.hardware },
    { title: '2. Perimeter & Access Control', items: shiftAudit.sections?.perimeter },
    { title: '3. High-Risk Zones & Vault/Cash', items: shiftAudit.sections?.highRisk }
  ];

  sectionsList.forEach(sec => {
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, pageWidth - (margin * 2), 6, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(sec.title, margin + 3, y + 4.5);
    y += 8;

    if (sec.items) {
      Object.entries(sec.items).forEach(([key, val]) => {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42);
        const passText = val.checked ? '✓ PASS' : '✗ ISSUE';
        doc.text(`• ${key}: ${val.note || 'Verified'}`, margin + 4, y);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(val.checked ? 22 : 185, val.checked ? 101 : 28, val.checked ? 52 : 28);
        doc.text(passText, pageWidth - margin - 20, y);
        y += 6;
      });
    }
    y += 2;
  });

  y += 4;

  // Handover Summary
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('SHIFT HANDOVER SUMMARY', margin, y);
  y += 5;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, pageWidth - (margin * 2), 22, 2, 2, 'FD');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(doc.splitTextToSize(shiftAudit.handoverSummary || 'None', pageWidth - (margin * 2) - 8), margin + 4, y + 6);
  y += 28;

  // Pending Items
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('PENDING ITEMS & INCOMING SHIFT FOLLOW-UPS', margin, y);
  y += 5;

  doc.roundedRect(margin, y, pageWidth - (margin * 2), 18, 2, 2, 'FD');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(doc.splitTextToSize(shiftAudit.pendingItems || 'None', pageWidth - (margin * 2) - 8), margin + 4, y + 6);
  y += 24;

  // Signature Block
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(`Operator Signature: ${shiftAudit.operatorSignature || 'Verified electronically'}`, margin, y);
  y += 5;
  doc.text(`Signed Date/Time: ${shiftAudit.submittedAt || new Date().toLocaleString()}`, margin, y);

  doc.save(`${shiftAudit.auditNumber || 'Shift_Audit'}.pdf`);
}

// Updated User Manual PDF Generator (Sections 1-23, October 6, 2026 Edition)
export function generateUserManualPDF(systemSettings, configSummary) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  let y = 30;

  // Cover Page
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  doc.setFillColor(255, 255, 255);
  doc.circle(pageWidth / 2, 70, 20, 'F');
  doc.setTextColor(79, 70, 229);
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.text('S', pageWidth / 2, 77, { align: 'center' });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(systemSettings?.systemName || 'Sentri Remote Reporting System', pageWidth / 2, 110, { align: 'center' });

  doc.setFontSize(13);
  doc.setFont('helvetica', 'normal');
  doc.text('Audit & Reporting Management System', pageWidth / 2, 120, { align: 'center' });

  doc.setDrawColor(255, 255, 255);
  doc.line((pageWidth / 2) - 40, 130, (pageWidth / 2) + 40, 130);

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('User Manual', pageWidth / 2, 145, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Purpose, Scope & Complete Operating Guide', pageWidth / 2, 155, { align: 'center' });

  doc.setFontSize(9);
  doc.text(`Version ${systemSettings?.version || '1.0'} | October 6, 2026`, pageWidth / 2, 260, { align: 'center' });

  // Page 2: Summary Table
  doc.addPage();
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`${systemSettings?.systemName || 'Sentri Remote Reporting System'} — User Manual`, margin, 12);
  doc.text('Page 2', pageWidth - margin - 10, 12);

  y = 25;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(79, 70, 229);
  doc.text('23. System Configuration Summary', margin, y);
  y += 7;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('This section provides a snapshot of the current system configuration. As features are added or configured, this summary updates automatically.', margin, y, { maxWidth: pageWidth - (margin * 2) });
  y += 12;

  const summaryRows = [
    ['System Name', systemSettings?.systemName || 'Sentri Remote Reporting System'],
    ['Total Locations', String(configSummary.totalLocations)],
    ['Question Sets', String(configSummary.totalQuestionSets)],
    ['Question Categories', String(configSummary.totalCategories)],
    ['Incident Types', String(configSummary.totalIncidentTypes)],
    ['Speed of Service Types', String(configSummary.totalSosTypes)],
    ['Roles Defined', String(configSummary.totalRoles)],
    ['Total Permissions Available', '25 (16 Standard + 9 Sentri Core)']
  ];

  doc.setFillColor(79, 70, 229);
  doc.rect(margin, y, pageWidth - (margin * 2), 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Configuration Item', margin + 4, y + 5);
  doc.text('Current Value', margin + 110, y + 5);
  y += 7;

  summaryRows.forEach(([item, val], idx) => {
    doc.setFillColor(idx % 2 === 0 ? 248 : 255, idx % 2 === 0 ? 250 : 255, idx % 2 === 0 ? 252 : 255);
    doc.rect(margin, y, pageWidth - (margin * 2), 7, 'F');
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(item, margin + 4, y + 5);
    doc.setFont('helvetica', 'bold');
    doc.text(val, margin + 110, y + 5);
    y += 7;
  });

  doc.save('Sentri_Remote_Reporting_System_User_Manual_v2.pdf');
}
