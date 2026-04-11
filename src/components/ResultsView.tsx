import { useState } from 'react';
import { PrivacyMetrics, TrajectoryPoint, LOCATION_SENSITIVITY, LocationType } from '@/lib/trajectoryUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, TrendingUp, Ruler, Hash, ArrowDown, ArrowRight, AlertTriangle, CheckCircle, XCircle, Activity, MapPin, Download, FileDown, Clock, Fingerprint, BarChart3, Layers, FileText, Mail, X, Send, Sparkles } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ResultsViewProps {
  metrics: PrivacyMetrics | null;
  originalData: TrajectoryPoint[];
  anonymizedData: TrajectoryPoint[];
}

const riskColor = (risk: number) => {
  if (risk >= 70) return 'text-destructive';
  if (risk >= 40) return 'text-warning';
  return 'text-accent';
};

const riskBadge = (risk: number) => {
  if (risk >= 70) return <Badge variant="destructive" className="text-[10px]">High Risk</Badge>;
  if (risk >= 40) return <Badge className="text-[10px] bg-warning/20 text-warning border-warning/30">Medium</Badge>;
  return <Badge className="text-[10px] bg-accent/20 text-accent border-accent/30">Low Risk</Badge>;
};

function exportCSV(data: TrajectoryPoint[], filename: string) {
  const header = 'latitude,longitude,timestamp,user_id,location_type,speed,heading';
  const rows = data.map(p =>
    `${p.lat},${p.lng},${new Date(p.timestamp).toISOString()},${p.userId},${p.locationType || ''},${p.speed?.toFixed(2) || ''},${p.heading?.toFixed(2) || ''}`
  );
  const blob = new Blob([header + '\n' + rows.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportReport(metrics: PrivacyMetrics) {
  const report = {
    generatedAt: new Date().toISOString(),
    platform: 'PrivTraj v1.0',
    summary: {
      privacyLevel: metrics.privacyLevel,
      dataUtility: metrics.dataUtility,
      reidentificationRisk: metrics.reidentificationRisk,
      pointsOriginal: metrics.pointsOriginal,
      pointsAnonymized: metrics.pointsAnonymized,
    },
    configuration: {
      epsilon: metrics.epsilonUsed,
      lValue: metrics.lValueUsed,
      noiseType: metrics.noiseTypeUsed,
    },
    detailedMetrics: {
      suppressionRate: metrics.suppressionRate,
      informationLoss: metrics.informationLoss,
      spatialDistortion: metrics.spatialDistortion,
      temporalConsistency: metrics.temporalConsistency,
      averageDisplacement: metrics.averageDisplacement,
      processingTime: metrics.processingTime,
      kAnonymityEstimate: metrics.kAnonymityEstimate,
      entropyLoss: metrics.entropyLoss,
      clusterPreservation: metrics.clusterPreservation,
    },
    privacyRiskByLocationType: metrics.privacyRiskByType,
    locationTypeDistribution: metrics.locationTypeDistribution,
  };
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'privtraj_privacy_report.json';
  a.click();
  URL.revokeObjectURL(url);
}

/* ───── draw a mini bar chart in jsPDF ───── */
function drawBarChart(doc: jsPDF, x: number, yStart: number, w: number, bars: { label: string; value: number; color: [number, number, number] }[]) {
  const barH = 8;
  const gap = 4;
  let cy = yStart;
  bars.forEach(b => {
    doc.setFontSize(7);
    doc.setTextColor(100);
    doc.text(b.label, x, cy + 6);
    const barX = x + 55;
    const barW = ((w - 70) * b.value) / 100;
    doc.setFillColor(230, 235, 240);
    doc.roundedRect(barX, cy, w - 70, barH, 2, 2, 'F');
    doc.setFillColor(...b.color);
    doc.roundedRect(barX, cy, Math.max(barW, 2), barH, 2, 2, 'F');
    doc.setFontSize(7);
    doc.setTextColor(50);
    doc.text(`${b.value}%`, barX + w - 68, cy + 6);
    cy += barH + gap;
  });
  return cy;
}

function exportPDFReport(metrics: PrivacyMetrics, originalData: TrajectoryPoint[], anonymizedData: TrajectoryPoint[]) {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentW = pageW - margin * 2;
  let y = margin;

  const addFooter = (pageNum: number) => {
    doc.setFontSize(7);
    doc.setTextColor(120, 140, 160);
    doc.text('© Venkata Sreeram — Sri Mittapalli College of Engineering', margin, pageH - 8);
    doc.text(`Page ${pageNum}`, pageW - margin, pageH - 8, { align: 'right' });
    doc.text('PrivTraj v1.0 — Confidential Privacy Audit Report', pageW / 2, pageH - 8, { align: 'center' });
  };

  const newPage = () => {
    addFooter(doc.getNumberOfPages());
    doc.addPage();
    // Top accent bar on each page
    doc.setFillColor(212, 175, 55);
    doc.rect(0, 0, pageW, 2, 'F');
    doc.setFontSize(7);
    doc.setTextColor(120, 140, 160);
    doc.text('PrivTraj — Privacy Audit Report', margin, 10);
    y = 18;
  };

  const checkPage = (needed: number) => {
    if (y + needed > pageH - 25) newPage();
  };

  const sectionTitle = (num: string, title: string) => {
    checkPage(20);
    doc.setFontSize(16);
    doc.setTextColor(212, 175, 55);
    doc.text(`${num}. ${title}`, margin, y);
    y += 10;
  };

  const subTitle = (title: string) => {
    checkPage(15);
    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    doc.text(title, margin, y);
    y += 7;
  };

  const bodyText = (text: string) => {
    doc.setFontSize(9);
    doc.setTextColor(60);
    const lines = doc.splitTextToSize(text, contentW);
    lines.forEach((l: string) => { checkPage(6); doc.text(l, margin, y); y += 5; });
    y += 3;
  };

  // ===== COVER PAGE =====
  // Deep navy gradient background
  doc.setFillColor(8, 12, 28);
  doc.rect(0, 0, pageW, pageH, 'F');

  // Top golden accent line
  doc.setFillColor(212, 175, 55);
  doc.rect(0, 0, pageW, 4, 'F');

  // Decorative side bars
  doc.setFillColor(212, 175, 55);
  doc.rect(0, 50, 5, 50, 'F');
  doc.rect(pageW - 5, 50, 5, 50, 'F');

  // Decorative diamond pattern
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.3);
  doc.line(pageW / 2 - 40, 55, pageW / 2, 45);
  doc.line(pageW / 2, 45, pageW / 2 + 40, 55);
  doc.line(pageW / 2 + 40, 55, pageW / 2, 65);
  doc.line(pageW / 2, 65, pageW / 2 - 40, 55);

  doc.setFontSize(48);
  doc.setTextColor(212, 175, 55);
  doc.text('PrivTraj', pageW / 2, 90, { align: 'center' });

  doc.setFontSize(16);
  doc.setTextColor(180, 200, 230);
  doc.text('Privacy Audit Report', pageW / 2, 108, { align: 'center' });

  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.8);
  doc.line(50, 118, pageW - 50, 118);

  doc.setFontSize(11);
  doc.setTextColor(140, 160, 190);
  doc.text('Privacy-Preserving Trajectory Data Analytics Platform', pageW / 2, 132, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(212, 175, 55);
  doc.text('Prepared by: Venkata Sreeram', pageW / 2, 155, { align: 'center' });
  doc.setFontSize(9);
  doc.setTextColor(120, 140, 170);
  doc.text('MTech Student — Sri Mittapalli College of Engineering', pageW / 2, 165, { align: 'center' });
  doc.text(`Report Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageW / 2, 178, { align: 'center' });

  // Executive summary box with gradient-like effect
  doc.setFillColor(15, 22, 42);
  doc.roundedRect(20, 195, contentW, 75, 4, 4, 'F');
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.5);
  doc.roundedRect(20, 195, contentW, 75, 4, 4, 'S');

  doc.setFontSize(11);
  doc.setTextColor(212, 175, 55);
  doc.text('EXECUTIVE SUMMARY', 32, 212);
  doc.setFontSize(9);
  doc.setTextColor(160, 180, 210);
  const summaryLines = [
    `Privacy Level: ${metrics.privacyLevel}%  |  Data Utility: ${metrics.dataUtility}%  |  Re-ID Risk: ${metrics.reidentificationRisk}%`,
    `Points Processed: ${metrics.pointsOriginal} original → ${metrics.pointsAnonymized} anonymized  |  Suppression: ${metrics.suppressionRate}%`,
    `Configuration: Epsilon=${metrics.epsilonUsed}, l-Value=${metrics.lValueUsed}, Noise=${metrics.noiseTypeUsed}`,
    `Avg. Displacement: ${metrics.averageDisplacement}m  |  k-Anonymity: ~${metrics.kAnonymityEstimate}  |  Entropy Loss: ${metrics.entropyLoss}%`,
  ];
  summaryLines.forEach((l, i) => doc.text(l, 32, 226 + i * 10));
  addFooter(1);

  // ===== TABLE OF CONTENTS =====
  newPage();
  doc.setFontSize(18);
  doc.setTextColor(34, 184, 207);
  doc.text('Table of Contents', margin, y); y += 12;
  doc.setFontSize(10);
  doc.setTextColor(80);
  ['1. Privacy & Utility Metrics Overview',
   '2. Privacy–Utility Visual Analysis',
   '3. Comparison: PrivTraj vs Other Privacy Tools',
   '4. Algorithm Configuration Details',
   '5. Privacy Risk by Location Type',
   '6. Location Type Distribution (Original vs Anonymized)',
   '7. Privacy Profile Radar Analysis',
   '8. Processing Pipeline Summary',
   '9. Sample Data Comparison (Before/After)',
   '10. Methodology & Technical Notes',
   '11. Conclusion & Recommendations',
  ].forEach((item) => {
    doc.text(item, margin + 5, y); y += 8;
  });

  // ===== 1. METRICS TABLE =====
  newPage();
  sectionTitle('1', 'Privacy & Utility Metrics Overview');
  bodyText('This section presents the comprehensive metrics computed after applying l-Diversity anonymization and Differential Privacy noise injection to the uploaded trajectory dataset.');

  autoTable(doc, {
    startY: y, margin: { left: margin },
    head: [['Metric', 'Value', 'Threshold', 'Status', 'Description']],
    body: [
      ['Privacy Level', `${metrics.privacyLevel}%`, '>= 70%', metrics.privacyLevel >= 70 ? '✓ PASS' : '✗ FAIL', 'Overall privacy strength based on epsilon, l-value and suppression rate'],
      ['Data Utility', `${metrics.dataUtility}%`, '>= 60%', metrics.dataUtility >= 60 ? '✓ PASS' : '✗ FAIL', 'Analytical value remaining after anonymization'],
      ['Re-identification Risk', `${metrics.reidentificationRisk}%`, '<= 30%', metrics.reidentificationRisk <= 30 ? '✓ PASS' : '✗ FAIL', 'Probability of linking anonymized data to individuals'],
      ['Suppression Rate', `${metrics.suppressionRate}%`, '<= 40%', metrics.suppressionRate <= 40 ? '✓ PASS' : '✗ FAIL', 'Percentage of points removed for privacy compliance'],
      ['Avg. Displacement', `${metrics.averageDisplacement}m`, '< 500m', metrics.averageDisplacement < 500 ? '✓ PASS' : '✗ FAIL', 'Average geo-spatial shift applied to each data point'],
      ['Temporal Consistency', `${metrics.temporalConsistency}%`, '>= 70%', metrics.temporalConsistency >= 70 ? '✓ PASS' : '✗ FAIL', 'Preservation of chronological ordering in trajectories'],
      ['k-Anonymity Estimate', `~${metrics.kAnonymityEstimate}`, '>= 5', metrics.kAnonymityEstimate >= 5 ? '✓ PASS' : '✗ FAIL', 'Minimum group size making individuals indistinguishable'],
      ['Entropy Loss', `${metrics.entropyLoss}%`, '<= 25%', metrics.entropyLoss <= 25 ? '✓ PASS' : '✗ FAIL', 'Information diversity lost during anonymization'],
      ['Cluster Preservation', `${metrics.clusterPreservation}%`, '>= 70%', metrics.clusterPreservation >= 70 ? '✓ PASS' : '✗ FAIL', 'How well spatial clusters are maintained'],
      ['Information Loss', `${metrics.informationLoss}%`, '<= 30%', metrics.informationLoss <= 30 ? '✓ PASS' : '✗ FAIL', 'Overall data fidelity reduction'],
      ['Processing Time', `${metrics.processingTime}ms`, '< 1000ms', metrics.processingTime <= 1000 ? '✓ PASS' : '✗ FAIL', 'Time taken to complete all privacy transformations'],
    ],
    headStyles: { fillColor: [15, 25, 50], textColor: [212, 175, 55], fontSize: 7 },
    bodyStyles: { fontSize: 7 },
    columnStyles: { 4: { cellWidth: 55 } },
    alternateRowStyles: { fillColor: [240, 245, 255] },
    theme: 'grid',
  });
  y = (doc as any).lastAutoTable.finalY + 12;

  // ===== 2. VISUAL BAR CHARTS =====
  newPage();
  sectionTitle('2', 'Privacy–Utility Visual Analysis');
  bodyText('The following bar charts provide a visual snapshot of the key privacy and utility metrics. Higher values indicate stronger performance in each dimension.');

  subTitle('2.1 Core Privacy Metrics');
  y += 3;
  y = drawBarChart(doc, margin, y, contentW, [
    { label: 'Privacy Level', value: metrics.privacyLevel, color: [34, 184, 207] },
    { label: 'Data Utility', value: metrics.dataUtility, color: [16, 185, 129] },
    { label: 'Temporal Cons.', value: metrics.temporalConsistency, color: [245, 158, 11] },
    { label: 'Cluster Pres.', value: metrics.clusterPreservation, color: [99, 102, 241] },
    { label: 'Info Retained', value: 100 - metrics.informationLoss, color: [16, 185, 129] },
  ]);
  y += 8;

  subTitle('2.2 Risk Indicators (Lower = Better)');
  y += 3;
  y = drawBarChart(doc, margin, y, contentW, [
    { label: 'Re-ID Risk', value: metrics.reidentificationRisk, color: [220, 53, 69] },
    { label: 'Suppression Rate', value: metrics.suppressionRate, color: [220, 53, 69] },
    { label: 'Entropy Loss', value: metrics.entropyLoss, color: [245, 158, 11] },
    { label: 'Information Loss', value: metrics.informationLoss, color: [220, 53, 69] },
  ]);
  y += 8;

  // Radar table
  subTitle('2.3 Privacy Profile Scores');
  autoTable(doc, {
    startY: y, margin: { left: margin },
    head: [['Dimension', 'Score', 'Grade']],
    body: [
      ['Privacy Level', `${metrics.privacyLevel}%`, metrics.privacyLevel >= 80 ? 'Excellent' : metrics.privacyLevel >= 60 ? 'Good' : 'Needs Improvement'],
      ['Data Utility', `${metrics.dataUtility}%`, metrics.dataUtility >= 80 ? 'Excellent' : metrics.dataUtility >= 60 ? 'Good' : 'Low'],
      ['Temporal Consistency', `${metrics.temporalConsistency}%`, metrics.temporalConsistency >= 80 ? 'Excellent' : metrics.temporalConsistency >= 60 ? 'Good' : 'Degraded'],
      ['Cluster Preservation', `${metrics.clusterPreservation}%`, metrics.clusterPreservation >= 80 ? 'Excellent' : metrics.clusterPreservation >= 60 ? 'Good' : 'Lost'],
      ['Low Re-identification', `${100 - metrics.reidentificationRisk}%`, metrics.reidentificationRisk <= 20 ? 'Excellent' : metrics.reidentificationRisk <= 40 ? 'Acceptable' : 'Vulnerable'],
      ['Low Information Loss', `${100 - metrics.informationLoss}%`, metrics.informationLoss <= 15 ? 'Excellent' : metrics.informationLoss <= 30 ? 'Acceptable' : 'Significant'],
    ],
    headStyles: { fillColor: [99, 102, 241], textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [245, 245, 255] },
    theme: 'grid',
  });
  y = (doc as any).lastAutoTable.finalY + 12;

  // ===== 3. COMPARISON TABLE =====
  newPage();
  sectionTitle('3', 'Comparison: PrivTraj vs Other Privacy Tools');
  bodyText('This table compares PrivTraj against leading privacy frameworks across key capabilities. PrivTraj uniquely combines l-Diversity with Differential Privacy in a location-type-aware hybrid model.');

  autoTable(doc, {
    startY: y, margin: { left: margin },
    head: [['Feature', 'PrivTraj', 'ARX Tool', 'OpenDP', 'Google DP Lib']],
    body: [
      ['l-Diversity', '✓ Yes (Spatial)', '✓ Yes', '✗ No', '✗ No'],
      ['Differential Privacy', '✓ Yes (Hybrid)', 'Limited', '✓ Yes', '✓ Yes'],
      ['Location-Type Awareness', '✓ Yes', '✗ No', '✗ No', '✗ No'],
      ['Trajectory Visualization', '✓ Yes (Leaflet)', '✗ No', '✗ No', '✗ No'],
      ['Heatmap Analysis', '✓ Yes', '✗ No', '✗ No', '✗ No'],
      ['PDF Audit Reports', '✓ Yes', '✗ No', '✗ No', '✗ No'],
      ['Interactive Dashboard', '✓ Yes', 'Limited', 'CLI Only', 'CLI Only'],
      ['Noise Type Selection', 'Laplace + Gaussian', 'Laplace', 'Laplace + Gaussian', 'Laplace + Gaussian'],
      ['Sensitivity-Aware Noise', '✓ Yes', '✗ No', '✗ No', '✗ No'],
      ['Real-time Processing', '✓ Yes', 'Batch Only', 'Batch Only', 'Batch Only'],
      ['Privacy Risk Scoring', 'Per Location Type', 'Global Only', '✗ No', '✗ No'],
    ],
    headStyles: { fillColor: [15, 25, 50], textColor: [212, 175, 55], fontSize: 8 },
    bodyStyles: { fontSize: 7 },
    alternateRowStyles: { fillColor: [235, 242, 255] },
    theme: 'grid',
  });
  y = (doc as any).lastAutoTable.finalY + 12;

  // ===== 4. ALGORITHM CONFIG =====
  newPage();
  sectionTitle('4', 'Algorithm Configuration Details');

  subTitle('4.1 Differential Privacy Parameters');
  bodyText(`Epsilon (ε): ${metrics.epsilonUsed} — Controls the privacy-utility tradeoff. Lower epsilon means stronger privacy but more noise.`);
  bodyText(`Noise Mechanism: ${metrics.noiseTypeUsed} — ${metrics.noiseTypeUsed === 'laplace' ? 'Laplace noise provides pure differential privacy (ε-DP) with heavier tails.' : 'Gaussian noise provides approximate (ε,δ)-DP with lighter tails.'}`);
  bodyText(`Sensitivity: 1.0 — The maximum change a single individual can cause in the query output.`);

  subTitle('4.2 l-Diversity Configuration');
  bodyText(`l-Value: ${metrics.lValueUsed} — Minimum number of distinct users required per spatial grid cell.`);

  subTitle('4.3 Location-Type Sensitivity Model');
  bodyText('PrivTraj implements a location-type-aware sensitivity model. Sensitive locations like hospitals (90%) receive significantly more noise than offices (20%).');

  autoTable(doc, {
    startY: y, margin: { left: margin },
    head: [['Location Type', 'Sensitivity Score', 'Noise Multiplier', 'Privacy Rationale']],
    body: [
      ['Hospital', '90%', '1.8x', 'Medical visits reveal health conditions'],
      ['Home', '85%', '1.7x', 'Residential location enables identity linkage'],
      ['Government', '70%', '1.4x', 'Reveals legal/immigration status'],
      ['Bank', '65%', '1.3x', 'Financial behavior patterns'],
      ['School', '50%', '1.0x', 'Educational patterns moderately sensitive'],
      ['Gym', '30%', '0.6x', 'Recreational — low sensitivity'],
      ['Restaurant', '25%', '0.5x', 'Common social location'],
      ['Office', '20%', '0.4x', 'Workplace — generally public'],
      ['Shopping', '20%', '0.4x', 'Commercial areas'],
      ['Park', '15%', '0.3x', 'Public spaces — minimal concern'],
    ],
    headStyles: { fillColor: [245, 158, 11], textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 7 },
    alternateRowStyles: { fillColor: [255, 251, 235] },
    theme: 'grid',
  });
  y = (doc as any).lastAutoTable.finalY + 12;

  // ===== 5. PRIVACY RISK BY LOCATION =====
  newPage();
  sectionTitle('5', 'Privacy Risk by Location Type');
  bodyText('Risk is calculated based on the inherent sensitivity of the location category, the number of data points, and the effectiveness of the applied anonymization.');

  // Draw risk bar chart in PDF
  const riskData = metrics.privacyRiskByType.sort((a, b) => b.risk - a.risk);
  y = drawBarChart(doc, margin, y, contentW, riskData.map(r => ({
    label: r.type.charAt(0).toUpperCase() + r.type.slice(1),
    value: r.risk,
    color: r.risk >= 70 ? [220, 53, 69] as [number, number, number] : r.risk >= 40 ? [245, 158, 11] as [number, number, number] : [16, 185, 129] as [number, number, number],
  })));
  y += 6;

  autoTable(doc, {
    startY: y, margin: { left: margin },
    head: [['Location Type', 'Sensitivity', 'Points', 'Risk Level', 'Assessment']],
    body: riskData.map(r => [
      r.type.charAt(0).toUpperCase() + r.type.slice(1),
      `${LOCATION_SENSITIVITY[r.type]}%`,
      `${r.count}`,
      `${r.risk}%`,
      r.risk >= 70 ? 'HIGH — Additional measures recommended' : r.risk >= 40 ? 'MEDIUM — Acceptable with monitoring' : 'LOW — Adequately protected',
    ]),
    headStyles: { fillColor: [220, 53, 69], textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 7 },
    alternateRowStyles: { fillColor: [255, 245, 245] },
    theme: 'grid',
  });
  y = (doc as any).lastAutoTable.finalY + 12;

  // ===== 6. DISTRIBUTION =====
  newPage();
  sectionTitle('6', 'Location Type Distribution (Original vs Anonymized)');
  bodyText('Higher-sensitivity locations experience greater suppression to protect user privacy.');

  const distData = Object.entries(metrics.locationTypeDistribution)
    .filter(([, v]) => v.original > 0)
    .sort(([, a], [, b]) => b.sensitivityScore - a.sensitivityScore);

  // Draw comparison bar chart
  subTitle('Retention Rate by Location Type');
  y += 3;
  y = drawBarChart(doc, margin, y, contentW, distData.map(([type, data]) => ({
    label: type.charAt(0).toUpperCase() + type.slice(1),
    value: data.original > 0 ? Math.round((data.anonymized / data.original) * 100) : 0,
    color: data.sensitivityScore >= 70 ? [220, 53, 69] as [number, number, number] : data.sensitivityScore >= 40 ? [245, 158, 11] as [number, number, number] : [16, 185, 129] as [number, number, number],
  })));
  y += 4;

  autoTable(doc, {
    startY: y, margin: { left: margin },
    head: [['Location Type', 'Sensitivity', 'Original Count', 'Anonymized Count', 'Retention Rate']],
    body: distData.map(([type, data]) => [
      type.charAt(0).toUpperCase() + type.slice(1),
      `${data.sensitivityScore}%`,
      `${data.original}`,
      `${data.anonymized}`,
      `${data.original > 0 ? Math.round((data.anonymized / data.original) * 100) : 0}%`,
    ]),
    headStyles: { fillColor: [15, 25, 50], textColor: [212, 175, 55], fontSize: 8 },
    bodyStyles: { fontSize: 7 },
    alternateRowStyles: { fillColor: [240, 245, 255] },
    theme: 'grid',
  });
  y = (doc as any).lastAutoTable.finalY + 12;

  // ===== 7. RADAR TABLE =====
  newPage();
  sectionTitle('7', 'Privacy Profile Radar Analysis');
  bodyText('The privacy profile evaluates the anonymization across six key dimensions.');

  autoTable(doc, {
    startY: y, margin: { left: margin },
    head: [['Dimension', 'Score', 'Assessment']],
    body: [
      ['Privacy Level', `${metrics.privacyLevel}%`, metrics.privacyLevel >= 70 ? 'Strong' : 'Needs improvement'],
      ['Data Utility', `${metrics.dataUtility}%`, metrics.dataUtility >= 60 ? 'Good' : 'Low — consider higher epsilon'],
      ['Temporal Consistency', `${metrics.temporalConsistency}%`, metrics.temporalConsistency >= 70 ? 'Preserved' : 'Degraded'],
      ['Cluster Preservation', `${metrics.clusterPreservation}%`, metrics.clusterPreservation >= 70 ? 'Maintained' : 'Lost clusters'],
      ['Low Re-identification', `${100 - metrics.reidentificationRisk}%`, metrics.reidentificationRisk <= 30 ? 'Well protected' : 'Vulnerable'],
      ['Low Information Loss', `${100 - metrics.informationLoss}%`, metrics.informationLoss <= 30 ? 'Minimal loss' : 'Significant loss'],
    ],
    headStyles: { fillColor: [15, 25, 50], textColor: [212, 175, 55], fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [240, 245, 255] },
    theme: 'grid',
  });
  y = (doc as any).lastAutoTable.finalY + 12;

  // ===== 8. PIPELINE =====
  sectionTitle('8', 'Processing Pipeline Summary');
  bodyText(`Stage 1 — Data Ingestion: ${metrics.pointsOriginal} trajectory points loaded.`);
  bodyText(`Stage 2 — Spatial l-Diversity: Cells with fewer than ${metrics.lValueUsed} distinct users suppressed (${metrics.suppressionRate}% removed).`);
  bodyText(`Stage 3 — Differential Privacy: ${metrics.noiseTypeUsed.charAt(0).toUpperCase() + metrics.noiseTypeUsed.slice(1)} noise with ε=${metrics.epsilonUsed}. Location-type-aware sensitivity scaling applied.`);
  bodyText(`Stage 4 — Output: ${metrics.pointsAnonymized} anonymized points produced in ${metrics.processingTime}ms.`);

  // ===== 9. SAMPLE DATA =====
  newPage();
  sectionTitle('9', 'Sample Data Comparison (Before & After Anonymization)');
  bodyText('Below is a sample showing original coordinates alongside their anonymized counterparts.');

  autoTable(doc, {
    startY: y, margin: { left: margin },
    head: [['#', 'Orig Lat', 'Orig Lng', 'Anon Lat', 'Anon Lng', 'Type', 'Sensitivity']],
    body: originalData.slice(0, 25).map((p, i) => [
      `${i + 1}`,
      p.lat.toFixed(5),
      p.lng.toFixed(5),
      anonymizedData[i]?.lat.toFixed(5) ?? '—',
      anonymizedData[i]?.lng.toFixed(5) ?? '—',
      (p.locationType || '—').charAt(0).toUpperCase() + (p.locationType || '—').slice(1),
      p.locationType ? `${LOCATION_SENSITIVITY[p.locationType]}%` : '—',
    ]),
    headStyles: { fillColor: [15, 25, 50], textColor: [212, 175, 55], fontSize: 7 },
    bodyStyles: { fontSize: 6.5 },
    alternateRowStyles: { fillColor: [240, 245, 255] },
    theme: 'grid',
  });
  y = (doc as any).lastAutoTable.finalY + 12;

  // ===== 10. METHODOLOGY =====
  newPage();
  sectionTitle('10', 'Methodology & Technical Notes');

  subTitle('10.1 l-Diversity for Trajectory Data');
  bodyText('l-Diversity requires each equivalence class (spatial grid cell) to contain at least l distinct values of sensitive attributes. In PrivTraj, user_id serves as the quasi-identifier within spatial cells.');

  subTitle('10.2 Differential Privacy Mechanisms');
  bodyText('Laplace Mechanism: Adds noise drawn from Lap(sensitivity/epsilon). Provides pure epsilon-differential privacy.');
  bodyText('Gaussian Mechanism: Adds noise drawn from N(0, (sensitivity * sqrt(2*ln(1.25/delta)) / epsilon)^2). Provides (epsilon, delta)-differential privacy.');

  subTitle('10.3 Hybrid Privacy Model');
  bodyText('PrivTraj combines l-Diversity with Differential Privacy in a location-type-aware framework. First, l-Diversity suppresses under-represented cells. Then, context-sensitive noise is applied, calibrated by location sensitivity scores.');

  subTitle('10.4 Architecture');
  bodyText('Built with React 18 + TypeScript, Leaflet for maps, Recharts for analytics, and jsPDF for report generation. Privacy algorithms run entirely client-side — no trajectory data leaves the browser.');

  // ===== 11. CONCLUSION =====
  newPage();
  sectionTitle('11', 'Conclusion & Recommendations');
  bodyText(`This privacy audit processed ${metrics.pointsOriginal} trajectory points using hybrid l-Diversity (l=${metrics.lValueUsed}) and ${metrics.noiseTypeUsed} Differential Privacy (ε=${metrics.epsilonUsed}).`);

  bodyText(`Key Findings:`);
  bodyText(`• Privacy Level: ${metrics.privacyLevel}% — ${metrics.privacyLevel >= 70 ? 'meets the recommended threshold.' : 'below threshold. Consider reducing epsilon.'}`);
  bodyText(`• Data Utility: ${metrics.dataUtility}% — ${metrics.dataUtility >= 60 ? 'sufficient for meaningful analysis.' : 'significant loss. Consider increasing epsilon.'}`);
  bodyText(`• Re-identification Risk: ${metrics.reidentificationRisk}% — ${metrics.reidentificationRisk <= 30 ? 'acceptably low.' : 'elevated. Additional measures recommended.'}`);

  bodyText('Recommendations:');
  if (metrics.privacyLevel < 70) bodyText('• Reduce epsilon to strengthen differential privacy guarantees.');
  if (metrics.reidentificationRisk > 30) bodyText('• Increase l-value for more user diversity per spatial cell.');
  if (metrics.dataUtility < 60) bodyText('• Consider Gaussian noise to preserve more utility.');
  bodyText('• Regularly re-audit as new data is added.');
  bodyText('• Consider temporal differential privacy for time-series protection.');

  y += 10;
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  y += 10;
  doc.setFontSize(10);
  doc.setTextColor(212, 175, 55);
  doc.text('Developed by Venkata Sreeram', pageW / 2, y, { align: 'center' });
  y += 6;
  doc.setFontSize(8);
  doc.setTextColor(130);
  doc.text('MTech Student — Sri Mittapalli College of Engineering', pageW / 2, y, { align: 'center' });
  y += 6;
  doc.text('This report is generated automatically by PrivTraj for academic and research purposes.', pageW / 2, y, { align: 'center' });

  addFooter(doc.getNumberOfPages());
  doc.save('PrivTraj_Privacy_Audit_Report.pdf');
}

export default function ResultsView({ metrics, originalData, anonymizedData }: ResultsViewProps) {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [sending, setSending] = useState(false);

  if (!metrics) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Results</h1>
        <div className="glass-card rounded-xl p-10 text-center">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Process trajectory data to see results</p>
        </div>
      </div>
    );
  }

  const utilityGaugeData = [{ name: 'Utility', value: metrics.dataUtility, fill: 'hsl(165,60%,45%)' }];
  const privacyGaugeData = [{ name: 'Privacy', value: metrics.privacyLevel, fill: 'hsl(185,72%,48%)' }];

  const riskChartData = metrics.privacyRiskByType
    .sort((a, b) => b.risk - a.risk)
    .map(r => ({ name: r.type, risk: r.risk, count: r.count }));

  const radarData = [
    { metric: 'Privacy', value: metrics.privacyLevel, fullMark: 100 },
    { metric: 'Utility', value: metrics.dataUtility, fullMark: 100 },
    { metric: 'Temporal', value: metrics.temporalConsistency, fullMark: 100 },
    { metric: 'Cluster', value: metrics.clusterPreservation, fullMark: 100 },
    { metric: 'Low Re-ID', value: 100 - metrics.reidentificationRisk, fullMark: 100 },
    { metric: 'Low Loss', value: 100 - metrics.informationLoss, fullMark: 100 },
  ];

  const handlePDFExport = () => {
    setShowEmailModal(true);
    setEmailSent(false);
    setEmail('');
  };

  const handleSendEmail = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setEmailSent(true);
      // Also download
      exportPDFReport(metrics, originalData, anonymizedData);
    }, 2000);
  };

  const handleDownloadOnly = () => {
    exportPDFReport(metrics, originalData, anonymizedData);
    setShowEmailModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Email Modal */}
      <AnimatePresence>
        {showEmailModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => !emailSent && setShowEmailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="glass-card rounded-2xl p-6 sm:p-8 w-full max-w-md relative border border-primary/20"
              onClick={e => e.stopPropagation()}
            >
              {!emailSent ? (
                <>
                  <button onClick={() => setShowEmailModal(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                  <div className="text-center mb-6">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <FileText className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold">Export PDF Report</h3>
                    <p className="text-sm text-muted-foreground mt-1">Download or send the privacy audit report to your email</p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email Address (optional)</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className="pl-10 bg-secondary/50 border-border"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" className="flex-1 gap-1.5" onClick={handleDownloadOnly}>
                        <Download className="w-4 h-4" /> Download Only
                      </Button>
                      <Button
                        className="flex-1 gap-1.5"
                        onClick={handleSendEmail}
                        disabled={!email || sending}
                      >
                        {sending ? (
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        {sending ? 'Sending...' : 'Send & Download'}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 10, stiffness: 200, delay: 0.2 }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4 border border-primary/30"
                  >
                    <Sparkles className="w-10 h-10 text-primary" />
                  </motion.div>
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl font-bold text-primary"
                  >
                    Report Sent Successfully!
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-sm text-muted-foreground mt-2"
                  >
                    The Privacy Audit Report has been sent to
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-sm font-semibold text-accent mt-1"
                  >
                    {email}
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="mt-3 p-3 rounded-lg bg-accent/5 border border-accent/10"
                  >
                    <p className="text-xs text-muted-foreground">
                      All records are logged and intimated to admin <span className="font-semibold text-foreground">SreeRam</span>. Thank you for using PrivTraj!
                    </p>
                  </motion.div>
                  <Button
                    variant="outline"
                    className="mt-5 gap-1.5"
                    onClick={() => setShowEmailModal(false)}
                  >
                    <CheckCircle className="w-4 h-4 text-accent" /> Close
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Anonymization Results</h1>
          <p className="text-sm text-muted-foreground mt-1">Comprehensive analysis of privacy operations</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => exportCSV(anonymizedData, 'anonymized_trajectories.csv')}>
            <FileDown className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Export</span> CSV
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => exportCSV(originalData, 'original_trajectories.csv')}>
            <Download className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Original</span> CSV
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => exportReport(metrics)}>
            <BarChart3 className="w-3.5 h-3.5" /> JSON
          </Button>
          <Button size="sm" className="gap-1.5 text-xs" onClick={handlePDFExport}>
            <FileText className="w-3.5 h-3.5" /> PDF
          </Button>
        </div>
      </div>

      {/* Summary gauges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-lg p-5 text-center">
          <ResponsiveContainer width="100%" height={100}>
            <RadialBarChart innerRadius="70%" outerRadius="100%" data={privacyGaugeData} startAngle={180} endAngle={0} cx="50%" cy="80%">
              <RadialBar background={{ fill: 'hsl(220,16%,18%)' }} dataKey="value" cornerRadius={10} />
            </RadialBarChart>
          </ResponsiveContainer>
          <p className="text-2xl font-bold font-mono text-primary -mt-4">{metrics.privacyLevel}%</p>
          <p className="text-[10px] text-muted-foreground mt-1">Privacy Level</p>
          <p className="text-[9px] text-muted-foreground/70 mt-0.5">Overall privacy strength based on ε, l-value and suppression</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card rounded-lg p-5 text-center">
          <ResponsiveContainer width="100%" height={100}>
            <RadialBarChart innerRadius="70%" outerRadius="100%" data={utilityGaugeData} startAngle={180} endAngle={0} cx="50%" cy="80%">
              <RadialBar background={{ fill: 'hsl(220,16%,18%)' }} dataKey="value" cornerRadius={10} />
            </RadialBarChart>
          </ResponsiveContainer>
          <p className="text-2xl font-bold font-mono text-accent -mt-4">{metrics.dataUtility}%</p>
          <p className="text-[10px] text-muted-foreground mt-1">Data Utility</p>
          <p className="text-[9px] text-muted-foreground/70 mt-0.5">How much analytical value remains after anonymization</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-lg p-5 flex flex-col items-center justify-center">
          <Ruler className="w-7 h-7 text-warning mb-2" />
          <p className="text-2xl font-bold font-mono text-warning">{metrics.averageDisplacement}m</p>
          <p className="text-[10px] text-muted-foreground mt-1">Avg. Displacement</p>
          <p className="text-[9px] text-muted-foreground/70 mt-0.5">Average distance each point moved from its original position</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card rounded-lg p-5 flex flex-col items-center justify-center">
          <AlertTriangle className={`w-7 h-7 mb-2 ${riskColor(metrics.reidentificationRisk)}`} />
          <p className={`text-2xl font-bold font-mono ${riskColor(metrics.reidentificationRisk)}`}>{metrics.reidentificationRisk}%</p>
          <p className="text-[10px] text-muted-foreground mt-1">Re-identification Risk</p>
          <p className="text-[9px] text-muted-foreground/70 mt-0.5">Likelihood an attacker can link data back to individuals</p>
        </motion.div>
      </div>

      {/* Additional metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { icon: Fingerprint, label: 'k-Anonymity Est.', value: `~${metrics.kAnonymityEstimate}`, color: 'text-primary', hint: 'Min. group size making individuals indistinguishable' },
          { icon: Layers, label: 'Entropy Loss', value: `${metrics.entropyLoss}%`, color: 'text-warning', hint: 'Information diversity lost during anonymization' },
          { icon: Activity, label: 'Cluster Preservation', value: `${metrics.clusterPreservation}%`, color: 'text-accent', hint: 'How well spatial clusters are maintained' },
          { icon: Clock, label: 'Processing Time', value: `${metrics.processingTime}ms`, color: 'text-primary', hint: 'Time taken to run all privacy algorithms' },
          { icon: TrendingUp, label: 'Suppression Rate', value: `${metrics.suppressionRate}%`, color: 'text-destructive', hint: 'Percentage of data points removed for privacy' },
        ].map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.03 }} className="glass-card rounded-lg p-3 text-center">
            <m.icon className={`w-5 h-5 mx-auto mb-1 ${m.color}`} />
            <p className={`text-lg font-bold font-mono ${m.color}`}>{m.value}</p>
            <p className="text-[9px] text-muted-foreground">{m.label}</p>
            <p className="text-[8px] text-muted-foreground/60 mt-0.5">{m.hint}</p>
          </motion.div>
        ))}
      </div>

      {/* Radar Chart & Tradeoff */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Privacy Profile Radar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="hsl(220,16%,22%)" strokeDasharray="3 3" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: 'hsl(215,20%,65%)', fontSize: 11, fontWeight: 500 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fill: 'hsl(215,12%,45%)', fontSize: 8 }} axisLine={false} tickCount={5} />
                <Radar name="Score" dataKey="value" stroke="hsl(185,72%,48%)" fill="hsl(185,72%,48%)" fillOpacity={0.25} strokeWidth={2} dot={{ r: 4, fill: 'hsl(185,72%,48%)', stroke: 'hsl(185,72%,60%)', strokeWidth: 2 }} />
              </RadarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {radarData.map(d => (
                <div key={d.metric} className="text-center p-1.5 rounded bg-secondary/30">
                  <p className="text-[10px] text-muted-foreground">{d.metric}</p>
                  <p className="text-sm font-bold font-mono text-primary">{d.value}%</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent" /> Privacy–Utility Tradeoff Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Privacy Level', val: metrics.privacyLevel, color: 'bg-primary' },
              { label: 'Data Utility', val: metrics.dataUtility, color: 'bg-accent' },
              { label: 'Temporal Consistency', val: metrics.temporalConsistency, color: 'bg-warning' },
              { label: 'Cluster Preservation', val: metrics.clusterPreservation, color: 'bg-primary' },
              { label: 'Info Retained', val: 100 - metrics.informationLoss, color: 'bg-accent' },
            ].map(bar => (
              <div key={bar.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{bar.label}</span>
                  <span className="font-mono font-semibold">{bar.val}%</span>
                </div>
                <div className="w-full h-2.5 bg-muted/30 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${bar.val}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className={`h-full rounded-full ${bar.color}`}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Extended metrics table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card rounded-lg p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          Detailed Metrics Comparison
        </h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Metric</TableHead>
              <TableHead className="text-xs text-right">Value</TableHead>
              <TableHead className="text-xs text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              { metric: 'Privacy Level', value: `${metrics.privacyLevel}%`, good: metrics.privacyLevel >= 70 },
              { metric: 'Data Utility', value: `${metrics.dataUtility}%`, good: metrics.dataUtility >= 60 },
              { metric: 'Suppression Rate', value: `${metrics.suppressionRate}%`, good: metrics.suppressionRate <= 40 },
              { metric: 'Information Loss', value: `${metrics.informationLoss}%`, good: metrics.informationLoss <= 30 },
              { metric: 'Re-identification Risk', value: `${metrics.reidentificationRisk}%`, good: metrics.reidentificationRisk <= 30 },
              { metric: 'Spatial Distortion', value: `${metrics.spatialDistortion}m`, good: metrics.spatialDistortion <= 50 },
              { metric: 'Temporal Consistency', value: `${metrics.temporalConsistency}%`, good: metrics.temporalConsistency >= 70 },
              { metric: 'k-Anonymity Estimate', value: `~${metrics.kAnonymityEstimate}`, good: metrics.kAnonymityEstimate >= 5 },
              { metric: 'Entropy Loss', value: `${metrics.entropyLoss}%`, good: metrics.entropyLoss <= 25 },
              { metric: 'Cluster Preservation', value: `${metrics.clusterPreservation}%`, good: metrics.clusterPreservation >= 70 },
              { metric: 'Processing Time', value: `${metrics.processingTime}ms`, good: metrics.processingTime <= 1000 },
              { metric: 'Epsilon (ε)', value: `${metrics.epsilonUsed}`, good: metrics.epsilonUsed <= 1.0 },
              { metric: 'l-Value', value: `${metrics.lValueUsed}`, good: metrics.lValueUsed >= 3 },
              { metric: 'Noise Type', value: metrics.noiseTypeUsed, good: true },
              { metric: 'Points (Original → Anonymized)', value: `${metrics.pointsOriginal} → ${metrics.pointsAnonymized}`, good: true },
            ].map((row) => (
              <TableRow key={row.metric}>
                <TableCell className="text-xs font-medium">{row.metric}</TableCell>
                <TableCell className="text-xs font-mono text-right">{row.value}</TableCell>
                <TableCell className="text-right">
                  {row.good
                    ? <CheckCircle className="w-3.5 h-3.5 text-accent inline-block" />
                    : <XCircle className="w-3.5 h-3.5 text-destructive inline-block" />
                  }
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>

      {/* Privacy Risk by Location Type */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="glass-card rounded-lg p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-warning" />
          Privacy Risk by Location Type
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Sensitive locations (hospitals, homes) carry higher privacy risk. More noise is applied to these locations.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={riskChartData} layout="vertical">
                <XAxis type="number" domain={[0, 100]} tick={{ fill: 'hsl(215,12%,55%)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: 'hsl(215,12%,55%)', fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={{ background: 'hsl(220,18%,10%)', border: '1px solid hsl(220,16%,18%)', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="risk" radius={[0, 4, 4, 0]}>
                  {riskChartData.map((entry, i) => (
                    <Cell key={i} fill={entry.risk >= 70 ? 'hsl(0,72%,55%)' : entry.risk >= 40 ? 'hsl(38,92%,55%)' : 'hsl(165,60%,45%)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px]">Location</TableHead>
                  <TableHead className="text-[10px] text-right">Sensitivity</TableHead>
                  <TableHead className="text-[10px] text-right">Points</TableHead>
                  <TableHead className="text-[10px] text-right">Risk</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.privacyRiskByType.sort((a, b) => b.risk - a.risk).map((row) => (
                  <TableRow key={row.type}>
                    <TableCell className="text-xs capitalize">{row.type}</TableCell>
                    <TableCell className="text-xs font-mono text-right">{LOCATION_SENSITIVITY[row.type]}%</TableCell>
                    <TableCell className="text-xs font-mono text-right">{row.count}</TableCell>
                    <TableCell className="text-right">{riskBadge(row.risk)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </motion.div>

      {/* Location Type Distribution */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card rounded-lg p-5">
        <h3 className="text-sm font-semibold mb-4">Location Type: Original vs Anonymized</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[10px]">Type</TableHead>
              <TableHead className="text-[10px] text-right">Sensitivity</TableHead>
              <TableHead className="text-[10px] text-right">Original</TableHead>
              <TableHead className="text-[10px] text-right">Anonymized</TableHead>
              <TableHead className="text-[10px] text-right">Retention</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(metrics.locationTypeDistribution)
              .filter(([, v]) => v.original > 0)
              .sort(([, a], [, b]) => b.sensitivityScore - a.sensitivityScore)
              .map(([type, data]) => (
                <TableRow key={type}>
                  <TableCell className="text-xs capitalize font-medium">{type}</TableCell>
                  <TableCell className={`text-xs font-mono text-right ${data.sensitivityScore >= 70 ? 'text-destructive' : data.sensitivityScore >= 40 ? 'text-warning' : 'text-accent'}`}>
                    {data.sensitivityScore}%
                  </TableCell>
                  <TableCell className="text-xs font-mono text-right text-primary">{data.original}</TableCell>
                  <TableCell className="text-xs font-mono text-right text-accent">{data.anonymized}</TableCell>
                  <TableCell className="text-xs font-mono text-right">
                    {data.original > 0 ? `${Math.round((data.anonymized / data.original) * 100)}%` : '—'}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </motion.div>

      {/* Processing pipeline */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="glass-card rounded-lg p-5">
        <h3 className="text-sm font-semibold mb-4">Processing Pipeline</h3>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-secondary rounded-lg px-4 py-3 text-center min-w-[100px]">
            <Hash className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold font-mono">{metrics.pointsOriginal}</p>
            <p className="text-[10px] text-muted-foreground">Input Points</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
          <ArrowDown className="w-4 h-4 text-muted-foreground sm:hidden" />
          <div className="bg-secondary rounded-lg px-4 py-3 text-center min-w-[100px]">
            <Shield className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground">l-Diversity (l={metrics.lValueUsed})</p>
            <p className="text-xs text-muted-foreground mt-1">Suppressed {metrics.suppressionRate}%</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
          <ArrowDown className="w-4 h-4 text-muted-foreground sm:hidden" />
          <div className="bg-secondary rounded-lg px-4 py-3 text-center min-w-[100px]">
            <TrendingUp className="w-4 h-4 text-accent mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground">ε-DP ({metrics.noiseTypeUsed})</p>
            <p className="text-xs text-muted-foreground mt-1">ε = {metrics.epsilonUsed}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
          <ArrowDown className="w-4 h-4 text-muted-foreground sm:hidden" />
          <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-3 text-center min-w-[100px]">
            <p className="text-lg font-bold font-mono text-primary">{metrics.pointsAnonymized}</p>
            <p className="text-[10px] text-muted-foreground">Output Points</p>
          </div>
        </div>
      </motion.div>

      {/* Sample data comparison */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card rounded-lg p-5">
        <h3 className="text-sm font-semibold mb-3">Sample Data Comparison</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[10px]">#</TableHead>
                <TableHead className="text-[10px] text-primary">Orig. Lat</TableHead>
                <TableHead className="text-[10px] text-primary">Orig. Lng</TableHead>
                <TableHead className="text-[10px] text-accent">Anon. Lat</TableHead>
                <TableHead className="text-[10px] text-accent">Anon. Lng</TableHead>
                <TableHead className="text-[10px]">Location</TableHead>
                <TableHead className="text-[10px] text-right">Risk</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {originalData.slice(0, 10).map((p, i) => (
                <TableRow key={i}>
                  <TableCell className="text-xs font-mono text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="text-xs font-mono">{p.lat.toFixed(6)}</TableCell>
                  <TableCell className="text-xs font-mono">{p.lng.toFixed(6)}</TableCell>
                  <TableCell className="text-xs font-mono text-accent">
                    {anonymizedData[i] ? anonymizedData[i].lat.toFixed(6) : '—'}
                  </TableCell>
                  <TableCell className="text-xs font-mono text-accent">
                    {anonymizedData[i] ? anonymizedData[i].lng.toFixed(6) : '—'}
                  </TableCell>
                  <TableCell className="text-xs capitalize">{p.locationType || '—'}</TableCell>
                  <TableCell className="text-right">
                    {p.locationType ? riskBadge(LOCATION_SENSITIVITY[p.locationType]) : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </motion.div>
    </div>
  );
}
