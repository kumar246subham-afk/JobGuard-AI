import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePdfReport = (result, jobInfo) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Header Banner
  doc.setFillColor(17, 24, 39); // Dark Navy #111827
  doc.rect(0, 0, 210, 32, 'F');

  // Accent Line
  doc.setFillColor(244, 197, 66); // Warm Yellow #F4C542
  doc.rect(0, 32, 210, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('JobGuard AI – Job Safety Verification Report', 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`Generated: ${result.analysis_date || new Date().toUTCString()}`, 14, 26);

  // Job Title & Company
  let currentY = 44;
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Position: ${jobInfo?.title || 'Job Ad Listing'}`, 14, currentY);

  currentY += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Company: ${jobInfo?.company_name || 'Not Specified'} | Location: ${jobInfo?.location || 'Unspecified'}`, 14, currentY);

  // Assessment Summary Box
  currentY += 8;
  const isHighRisk = result.risk_level === 'HIGH';
  const isMedRisk = result.risk_level === 'MEDIUM';
  
  if (isHighRisk) {
    doc.setFillColor(254, 242, 242); // Red tint
    doc.setDrawColor(239, 68, 68);
  } else if (isMedRisk) {
    doc.setFillColor(255, 251, 235); // Yellow/Orange tint
    doc.setDrawColor(245, 158, 11);
  } else {
    doc.setFillColor(236, 253, 245); // Green tint
    doc.setDrawColor(16, 185, 129);
  }
  
  doc.roundedRect(14, currentY, 182, 24, 2, 2, 'FD');

  doc.setTextColor(17, 24, 39);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Classification: ${result.prediction}`, 18, currentY + 8);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Risk Score: ${result.risk_score} / 100 (${result.risk_level} RISK) | ML Fraud Probability: ${(result.fraud_probability * 100).toFixed(1)}% | Confidence: ${result.confidence_score}%`, 18, currentY + 16);

  currentY += 30;

  // Warning signs table if any
  const warningRows = (result.detected_warning_signs || []).map((w, idx) => [
    `#${idx + 1}`,
    w
  ]);

  if (warningRows.length > 0) {
    autoTable(doc, {
      startY: currentY,
      head: [['#', 'Detected Security Red Flags & Warning Signs']],
      body: warningRows,
      theme: 'grid',
      headStyles: { fillColor: [239, 68, 68], textColor: 255 },
      styles: { fontSize: 8, cellPadding: 3 }
    });
    currentY = doc.lastAutoTable.finalY + 8;
  }

  // Company Transparency Checklist Table
  const checklistRows = Object.entries(result.company_checklist || {}).map(([key, val]) => [
    val.field,
    val.status.toUpperCase(),
    val.details
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Information Field', 'Status', 'Observation / Verification Details']],
    body: checklistRows,
    theme: 'grid',
    headStyles: { fillColor: [17, 24, 39], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 30, fontStyle: 'bold' },
      2: { cellWidth: 112 }
    },
    styles: { fontSize: 8, cellPadding: 3 }
  });
  currentY = doc.lastAutoTable.finalY + 8;

  // Safety Recommendations
  const recRows = (result.safety_recommendations || []).map((rec, idx) => [
    `Step ${idx + 1}`,
    rec
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Item', 'Actionable Safety Guidance for Applicants & Students']],
    body: recRows,
    theme: 'striped',
    headStyles: { fillColor: [244, 197, 66], textColor: [17, 24, 39] },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 157 }
    },
    styles: { fontSize: 8, cellPadding: 3 }
  });

  // Footer Disclaimer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(148, 163, 184);
  const disclaimerText = doc.splitTextToSize(
    "Disclaimer: JobGuard AI is an automated decision-support educational system. Predictions represent statistical correlation with historical scam datasets and do not guarantee safety or legal proof of fraud.",
    182
  );
  doc.text(disclaimerText, 14, pageHeight - 10);

  // Save PDF
  const safeFilename = (jobInfo?.title || 'JobGuard_Analysis_Report')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .slice(0, 30);
  doc.save(`${safeFilename}_JobGuard_Report.pdf`);
};
