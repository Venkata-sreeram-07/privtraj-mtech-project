import { PrivacyMetrics, TrajectoryPoint, LOCATION_SENSITIVITY, LocationType } from '@/lib/trajectoryUtils';
import { motion } from 'framer-motion';
import { Shield, TrendingUp, Ruler, Hash, ArrowDown, ArrowRight, AlertTriangle, CheckCircle, XCircle, Activity, MapPin, Download, FileDown, Clock, Fingerprint, BarChart3, Layers, FileText } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

function exportPDFReport(metrics: PrivacyMetrics, originalData: TrajectoryPoint[], anonymizedData: TrajectoryPoint[]) {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentW = pageW - margin * 2;
  let y = margin;

  const addFooter = (pageNum: number) => {
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text('© Venkata Sreeram — Sri Mittapalli College of Engineering', margin, pageH - 8);
    doc.text(`Page ${pageNum}`, pageW - margin, pageH - 8, { align: 'right' });
    doc.text('PrivTraj v1.0 — Confidential Privacy Audit Report', pageW / 2, pageH - 8, { align: 'center' });
  };

  const newPage = () => {
    addFooter(doc.getNumberOfPages());
    doc.addPage();
    doc.setDrawColor(34, 184, 207);
    doc.setLineWidth(0.5);
    doc.line(margin, 12, pageW - margin, 12);
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text('PrivTraj — Privacy Audit Report', margin, 10);
    y = 20;
  };

  const checkPage = (needed: number) => {
    if (y + needed > pageH - 25) newPage();
  };

  const sectionTitle = (num: string, title: string) => {
    checkPage(20);
    doc.setFontSize(16);
    doc.setTextColor(34, 184, 207);
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
  doc.setFillColor(15, 20, 25);
  doc.rect(0, 0, pageW, pageH, 'F');
  doc.setDrawColor(34, 184, 207);
  doc.setLineWidth(1);
  doc.line(30, 60, pageW - 30, 60);
  doc.setFontSize(36);
  doc.setTextColor(34, 184, 207);
  doc.text('PrivTraj', pageW / 2, 85, { align: 'center' });
  doc.setFontSize(14);
  doc.setTextColor(200);
  doc.text('Privacy Audit Report', pageW / 2, 100, { align: 'center' });
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text('Privacy-Preserving Trajectory Data Analytics', pageW / 2, 115, { align: 'center' });
  doc.line(30, 125, pageW - 30, 125);

  doc.setFontSize(11);
  doc.setTextColor(180);
  doc.text('Prepared by: Venkata Sreeram', pageW / 2, 145, { align: 'center' });
  doc.setFontSize(9);
  doc.setTextColor(130);
  doc.text('MTech Student — Sri Mittapalli College of Engineering', pageW / 2, 155, { align: 'center' });
  doc.text(`Report Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageW / 2, 168, { align: 'center' });

  // Summary box on cover
  doc.setFillColor(20, 28, 35);
  doc.roundedRect(25, 185, contentW - 10, 70, 3, 3, 'F');
  doc.setFontSize(10);
  doc.setTextColor(34, 184, 207);
  doc.text('EXECUTIVE SUMMARY', 35, 200);
  doc.setFontSize(9);
  doc.setTextColor(180);
  const summaryLines = [
    `Privacy Level: ${metrics.privacyLevel}%  |  Data Utility: ${metrics.dataUtility}%  |  Re-ID Risk: ${metrics.reidentificationRisk}%`,
    `Points Processed: ${metrics.pointsOriginal} original -> ${metrics.pointsAnonymized} anonymized  |  Suppression: ${metrics.suppressionRate}%`,
    `Configuration: Epsilon=${metrics.epsilonUsed}, l-Value=${metrics.lValueUsed}, Noise=${metrics.noiseTypeUsed}`,
    `Avg. Displacement: ${metrics.averageDisplacement}m  |  k-Anonymity: ~${metrics.kAnonymityEstimate}  |  Entropy Loss: ${metrics.entropyLoss}%`,
  ];
  summaryLines.forEach((l, i) => doc.text(l, 35, 214 + i * 10));
  addFooter(1);

  // ===== PAGE 2: Table of Contents =====
  newPage();
  doc.setFontSize(18);
  doc.setTextColor(34, 184, 207);
  doc.text('Table of Contents', margin, y); y += 12;
  doc.setFontSize(10);
  doc.setTextColor(80);
  ['1. Privacy & Utility Metrics Overview',
   '2. Comparison: PrivTraj vs Other Privacy Tools',
   '3. Algorithm Configuration Details',
   '4. Privacy Risk by Location Type',
   '5. Location Type Distribution (Original vs Anonymized)',
   '6. Privacy Profile Radar Analysis',
   '7. Processing Pipeline Summary',
   '8. Sample Data Comparison (Before/After)',
   '9. Methodology & Technical Notes',
   '10. Conclusion & Recommendations',
  ].forEach((item, i) => {
    doc.text(item, margin + 5, y); y += 8;
  });

  // ===== PAGE 3: Metrics =====
  newPage();
  sectionTitle('1', 'Privacy & Utility Metrics Overview');
  bodyText('This section presents the comprehensive metrics computed after applying l-Diversity anonymization and Differential Privacy noise injection to the uploaded trajectory dataset. Each metric is evaluated against industry-standard thresholds.');

  autoTable(doc, {
    startY: y, margin: { left: margin },
    head: [['Metric', 'Value', 'Threshold', 'Status', 'Description']],
    body: [
      ['Privacy Level', `${metrics.privacyLevel}%`, '>= 70%', metrics.privacyLevel >= 70 ? 'PASS' : 'FAIL', 'Overall privacy strength based on epsilon, l-value and suppression rate'],
      ['Data Utility', `${metrics.dataUtility}%`, '>= 60%', metrics.dataUtility >= 60 ? 'PASS' : 'FAIL', 'Analytical value remaining after anonymization'],
      ['Re-identification Risk', `${metrics.reidentificationRisk}%`, '<= 30%', metrics.reidentificationRisk <= 30 ? 'PASS' : 'FAIL', 'Probability of linking anonymized data to individuals'],
      ['Suppression Rate', `${metrics.suppressionRate}%`, '<= 40%', metrics.suppressionRate <= 40 ? 'PASS' : 'FAIL', 'Percentage of points removed for privacy compliance'],
      ['Avg. Displacement', `${metrics.averageDisplacement}m`, '< 500m', metrics.averageDisplacement < 500 ? 'PASS' : 'FAIL', 'Average geo-spatial shift applied to each data point'],
      ['Temporal Consistency', `${metrics.temporalConsistency}%`, '>= 70%', metrics.temporalConsistency >= 70 ? 'PASS' : 'FAIL', 'Preservation of chronological ordering in trajectories'],
      ['k-Anonymity Estimate', `~${metrics.kAnonymityEstimate}`, '>= 5', metrics.kAnonymityEstimate >= 5 ? 'PASS' : 'FAIL', 'Minimum group size making individuals indistinguishable'],
      ['Entropy Loss', `${metrics.entropyLoss}%`, '<= 25%', metrics.entropyLoss <= 25 ? 'PASS' : 'FAIL', 'Information diversity lost during anonymization'],
      ['Cluster Preservation', `${metrics.clusterPreservation}%`, '>= 70%', metrics.clusterPreservation >= 70 ? 'PASS' : 'FAIL', 'How well spatial clusters are maintained'],
      ['Information Loss', `${metrics.informationLoss}%`, '<= 30%', metrics.informationLoss <= 30 ? 'PASS' : 'FAIL', 'Overall data fidelity reduction'],
      ['Processing Time', `${metrics.processingTime}ms`, '< 1000ms', metrics.processingTime <= 1000 ? 'PASS' : 'FAIL', 'Time taken to complete all privacy transformations'],
    ],
    headStyles: { fillColor: [34, 184, 207], textColor: 255, fontSize: 7 },
    bodyStyles: { fontSize: 7 },
    columnStyles: { 4: { cellWidth: 55 } },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    theme: 'grid',
  });
  y = (doc as any).lastAutoTable.finalY + 12;

  // ===== Comparison Table =====
  newPage();
  sectionTitle('2', 'Comparison: PrivTraj vs Other Privacy Tools');
  bodyText('This table compares PrivTraj against leading privacy frameworks across key capabilities. PrivTraj uniquely combines l-Diversity with Differential Privacy in a location-type-aware hybrid model, providing context-sensitive noise calibration that existing tools lack.');

  autoTable(doc, {
    startY: y, margin: { left: margin },
    head: [['Feature', 'PrivTraj', 'ARX Tool', 'OpenDP', 'Google DP Lib']],
    body: [
      ['l-Diversity', 'Yes (Spatial)', 'Yes', 'No', 'No'],
      ['Differential Privacy', 'Yes (Hybrid)', 'Limited', 'Yes', 'Yes'],
      ['Location-Type Awareness', 'Yes', 'No', 'No', 'No'],
      ['Trajectory Visualization', 'Yes (Leaflet)', 'No', 'No', 'No'],
      ['Heatmap Analysis', 'Yes', 'No', 'No', 'No'],
      ['PDF Audit Reports', 'Yes', 'No', 'No', 'No'],
      ['Interactive Dashboard', 'Yes', 'Limited', 'CLI Only', 'CLI Only'],
      ['Noise Type Selection', 'Laplace + Gaussian', 'Laplace', 'Laplace + Gaussian', 'Laplace + Gaussian'],
      ['Sensitivity-Aware Noise', 'Yes', 'No', 'No', 'No'],
      ['Open Source', 'Yes', 'Yes', 'Yes', 'Yes'],
      ['Real-time Processing', 'Yes', 'Batch Only', 'Batch Only', 'Batch Only'],
      ['Privacy Risk Scoring', 'Per Location Type', 'Global Only', 'No', 'No'],
    ],
    headStyles: { fillColor: [34, 184, 207], textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 7 },
    alternateRowStyles: { fillColor: [240, 248, 250] },
    theme: 'grid',
  });
  y = (doc as any).lastAutoTable.finalY + 12;

  // ===== Algorithm Config =====
  newPage();
  sectionTitle('3', 'Algorithm Configuration Details');

  subTitle('3.1 Differential Privacy Parameters');
  bodyText(`Epsilon (e): ${metrics.epsilonUsed} — Controls the privacy-utility tradeoff. Lower epsilon means stronger privacy but more noise. A value of 1.0 is considered a moderate privacy guarantee suitable for most applications.`);
  bodyText(`Noise Mechanism: ${metrics.noiseTypeUsed} — ${metrics.noiseTypeUsed === 'laplace' ? 'Laplace noise provides pure differential privacy (e-DP) with heavier tails, offering strong worst-case guarantees.' : 'Gaussian noise provides approximate (e,d)-DP with lighter tails, better suited for high-dimensional data.'}`);
  bodyText(`Sensitivity: 1.0 — The maximum change a single individual can cause in the query output. For GPS coordinates, this is calibrated to the coordinate precision used.`);

  subTitle('3.2 l-Diversity Configuration');
  bodyText(`l-Value: ${metrics.lValueUsed} — Minimum number of distinct users required per spatial grid cell. Higher l-values provide stronger privacy by ensuring each region has sufficient diversity, making it harder to infer individual trajectories.`);

  subTitle('3.3 Location-Type Sensitivity Model');
  bodyText('PrivTraj implements a novel location-type-aware sensitivity model. Sensitive locations like hospitals (90% sensitivity) and homes (85%) receive significantly more privacy noise than less sensitive locations like offices (20%) or parks (15%). This context-aware approach provides stronger protection where it matters most without over-anonymizing non-sensitive data.');

  autoTable(doc, {
    startY: y, margin: { left: margin },
    head: [['Location Type', 'Sensitivity Score', 'Noise Multiplier', 'Privacy Rationale']],
    body: [
      ['Hospital', '90%', '1.8x', 'Medical visits reveal health conditions — highest protection'],
      ['Home', '85%', '1.7x', 'Residential location enables identity linkage attacks'],
      ['Government', '70%', '1.4x', 'Government visits may reveal legal/immigration status'],
      ['Bank', '65%', '1.3x', 'Financial locations reveal economic behavior patterns'],
      ['School', '50%', '1.0x', 'Educational patterns moderately sensitive'],
      ['Gym', '30%', '0.6x', 'Recreational — low sensitivity'],
      ['Restaurant', '25%', '0.5x', 'Common social location — low privacy risk'],
      ['Office', '20%', '0.4x', 'Workplace — generally public information'],
      ['Shopping', '20%', '0.4x', 'Commercial areas — low sensitivity'],
      ['Park', '15%', '0.3x', 'Public spaces — minimal privacy concern'],
    ],
    headStyles: { fillColor: [245, 158, 11], textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 7 },
    alternateRowStyles: { fillColor: [255, 251, 235] },
    theme: 'grid',
  });
  y = (doc as any).lastAutoTable.finalY + 12;

  // ===== Privacy Risk by Location =====
  newPage();
  sectionTitle('4', 'Privacy Risk by Location Type');
  bodyText('The following table shows the computed privacy risk for each location type found in the dataset. Risk is calculated based on the inherent sensitivity of the location category, the number of data points, and the effectiveness of the applied anonymization.');

  autoTable(doc, {
    startY: y, margin: { left: margin },
    head: [['Location Type', 'Sensitivity', 'Points', 'Risk Level', 'Assessment']],
    body: metrics.privacyRiskByType.sort((a, b) => b.risk - a.risk).map(r => [
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

  // ===== Location Type Distribution =====
  checkPage(80);
  sectionTitle('5', 'Location Type Distribution (Original vs Anonymized)');
  bodyText('This comparison shows how data distribution changed after anonymization. Higher-sensitivity locations experience greater suppression to protect user privacy.');

  autoTable(doc, {
    startY: y, margin: { left: margin },
    head: [['Location Type', 'Sensitivity', 'Original Count', 'Anonymized Count', 'Retention Rate']],
    body: Object.entries(metrics.locationTypeDistribution)
      .filter(([, v]) => v.original > 0)
      .sort(([, a], [, b]) => b.sensitivityScore - a.sensitivityScore)
      .map(([type, data]) => [
        type.charAt(0).toUpperCase() + type.slice(1),
        `${data.sensitivityScore}%`,
        `${data.original}`,
        `${data.anonymized}`,
        `${data.original > 0 ? Math.round((data.anonymized / data.original) * 100) : 0}%`,
      ]),
    headStyles: { fillColor: [34, 184, 207], textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 7 },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    theme: 'grid',
  });
  y = (doc as any).lastAutoTable.finalY + 12;

  // ===== Privacy Profile =====
  newPage();
  sectionTitle('6', 'Privacy Profile Radar Analysis');
  bodyText('The privacy profile evaluates the anonymization across six key dimensions. An ideal result would show high scores across all axes, indicating strong privacy without sacrificing data utility.');

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
    headStyles: { fillColor: [34, 184, 207], textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    theme: 'grid',
  });
  y = (doc as any).lastAutoTable.finalY + 12;

  // ===== Processing Pipeline =====
  sectionTitle('7', 'Processing Pipeline Summary');
  bodyText(`The PrivTraj processing pipeline consists of four stages:`);
  bodyText(`Stage 1 — Data Ingestion: ${metrics.pointsOriginal} trajectory points were loaded from the uploaded CSV file, each containing latitude, longitude, timestamp, user ID, and location type.`);
  bodyText(`Stage 2 — Spatial l-Diversity: The trajectory space was divided into grid cells. Cells with fewer than ${metrics.lValueUsed} distinct users were suppressed, removing ${metrics.suppressionRate}% of points.`);
  bodyText(`Stage 3 — Differential Privacy: ${metrics.noiseTypeUsed.charAt(0).toUpperCase() + metrics.noiseTypeUsed.slice(1)} noise was added with epsilon=${metrics.epsilonUsed}. Location-type-aware sensitivity scaling was applied — sensitive locations received up to 1.8x more noise.`);
  bodyText(`Stage 4 — Output: ${metrics.pointsAnonymized} anonymized points were produced in ${metrics.processingTime}ms, ready for analysis while preserving individual privacy.`);

  // ===== Sample Data =====
  newPage();
  sectionTitle('8', 'Sample Data Comparison (Before & After Anonymization)');
  bodyText('Below is a sample of trajectory points showing original coordinates alongside their anonymized counterparts. The displacement demonstrates the spatial perturbation applied by the differential privacy mechanism.');

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
    headStyles: { fillColor: [34, 184, 207], textColor: 255, fontSize: 7 },
    bodyStyles: { fontSize: 6.5 },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    theme: 'grid',
  });
  y = (doc as any).lastAutoTable.finalY + 12;

  // ===== Methodology =====
  newPage();
  sectionTitle('9', 'Methodology & Technical Notes');

  subTitle('9.1 l-Diversity for Trajectory Data');
  bodyText('l-Diversity is an extension of k-anonymity that requires each equivalence class (spatial grid cell) to contain at least l distinct values of sensitive attributes. In PrivTraj, we use user_id as the quasi-identifier within spatial cells. This prevents attribute disclosure attacks where an attacker could infer a specific user\'s presence at a sensitive location.');

  subTitle('9.2 Differential Privacy Mechanisms');
  bodyText('Differential Privacy provides a mathematical guarantee that the output of an analysis does not significantly change when any single individual\'s data is added or removed. PrivTraj supports two noise mechanisms:');
  bodyText('Laplace Mechanism: Adds noise drawn from Lap(sensitivity/epsilon). Provides pure epsilon-differential privacy. Best for low-dimensional queries with strong worst-case guarantees.');
  bodyText('Gaussian Mechanism: Adds noise drawn from N(0, (sensitivity * sqrt(2*ln(1.25/delta)) / epsilon)^2). Provides (epsilon, delta)-differential privacy. Better suited for high-dimensional data and iterative analyses.');

  subTitle('9.3 Hybrid Privacy Model');
  bodyText('PrivTraj\'s key innovation is combining l-Diversity with Differential Privacy in a location-type-aware framework. First, l-Diversity suppresses under-represented spatial cells. Then, context-sensitive Differential Privacy noise is applied, calibrated by location sensitivity scores. This two-layer approach prevents both identity disclosure (via l-Diversity) and attribute disclosure (via DP), while minimizing utility loss for non-sensitive data.');

  subTitle('9.4 Architecture');
  bodyText('PrivTraj is built with React 18 + TypeScript for the frontend, using Leaflet for map visualization, Recharts for analytics charts, and jsPDF for report generation. The privacy algorithms run entirely client-side for maximum data security — no trajectory data ever leaves the user\'s browser.');

  // ===== Conclusion =====
  newPage();
  sectionTitle('10', 'Conclusion & Recommendations');
  bodyText(`This privacy audit was conducted by PrivTraj v1.0 on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}. The analysis processed ${metrics.pointsOriginal} trajectory points using a hybrid l-Diversity (l=${metrics.lValueUsed}) and ${metrics.noiseTypeUsed} Differential Privacy (epsilon=${metrics.epsilonUsed}) model.`);

  bodyText(`Key Findings:`);
  bodyText(`• Privacy Level achieved: ${metrics.privacyLevel}% — ${metrics.privacyLevel >= 70 ? 'meets the recommended threshold for privacy-preserving data sharing.' : 'below recommended threshold. Consider reducing epsilon or increasing l-value.'}`);
  bodyText(`• Data Utility preserved: ${metrics.dataUtility}% — ${metrics.dataUtility >= 60 ? 'sufficient for meaningful trajectory analysis.' : 'significant utility loss. Consider increasing epsilon for better balance.'}`);
  bodyText(`• Re-identification Risk: ${metrics.reidentificationRisk}% — ${metrics.reidentificationRisk <= 30 ? 'acceptably low for most applications.' : 'elevated risk. Additional anonymization measures recommended.'}`);

  bodyText('Recommendations:');
  if (metrics.privacyLevel < 70) bodyText('• Reduce epsilon to strengthen differential privacy guarantees.');
  if (metrics.reidentificationRisk > 30) bodyText('• Increase l-value to require more user diversity per spatial cell.');
  if (metrics.dataUtility < 60) bodyText('• Consider using Gaussian noise which may preserve more utility for this dataset size.');
  bodyText('• Regularly re-audit as new data is added or privacy requirements change.');
  bodyText('• Consider implementing temporal differential privacy for time-series protection.');

  y += 10;
  doc.setDrawColor(34, 184, 207);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  y += 10;
  doc.setFontSize(10);
  doc.setTextColor(34, 184, 207);
  doc.text('Developed by Venkata Sreeram', pageW / 2, y, { align: 'center' });
  y += 6;
  doc.setFontSize(8);
  doc.setTextColor(130);
  doc.text('MTech Student — Sri Mittapalli College of Engineering', pageW / 2, y, { align: 'center' });
  y += 6;
  doc.text('This report is generated automatically by PrivTraj and is intended for academic and research purposes.', pageW / 2, y, { align: 'center' });

  addFooter(doc.getNumberOfPages());
  doc.save('PrivTraj_Privacy_Audit_Report.pdf');
}

export default function ResultsView({ metrics, originalData, anonymizedData }: ResultsViewProps) {
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

  const gaugeData = [{ name: 'Privacy', value: metrics.privacyLevel, fill: 'hsl(185,72%,48%)' }];
  const pieData = [
    { name: 'Retained', value: metrics.pointsAnonymized },
    { name: 'Suppressed', value: metrics.pointsOriginal - metrics.pointsAnonymized },
  ];

  const riskChartData = metrics.privacyRiskByType
    .sort((a, b) => b.risk - a.risk)
    .map(r => ({ name: r.type, risk: r.risk, count: r.count }));

  const radarData = [
    { metric: 'Privacy', value: metrics.privacyLevel },
    { metric: 'Utility', value: metrics.dataUtility },
    { metric: 'Temporal', value: metrics.temporalConsistency },
    { metric: 'Cluster', value: metrics.clusterPreservation },
    { metric: 'Low Re-ID', value: 100 - metrics.reidentificationRisk },
    { metric: 'Low Loss', value: 100 - metrics.informationLoss },
  ];

  return (
    <div className="space-y-6">
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
          <Button size="sm" className="gap-1.5 text-xs" onClick={() => exportPDFReport(metrics, originalData, anonymizedData)}>
            <FileText className="w-3.5 h-3.5" /> PDF
          </Button>
        </div>
      </div>

      {/* Summary gauges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-lg p-5 text-center">
          <ResponsiveContainer width="100%" height={100}>
            <RadialBarChart innerRadius="70%" outerRadius="100%" data={gaugeData} startAngle={180} endAngle={0}>
              <RadialBar background={{ fill: 'hsl(220,16%,18%)' }} dataKey="value" cornerRadius={10} />
            </RadialBarChart>
          </ResponsiveContainer>
          <p className="text-2xl font-bold font-mono text-primary -mt-4">{metrics.privacyLevel}%</p>
          <p className="text-[10px] text-muted-foreground mt-1">Privacy Level</p>
          <p className="text-[9px] text-muted-foreground/70 mt-0.5">Overall privacy strength based on ε, l-value and suppression</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card rounded-lg p-5 text-center">
          <ResponsiveContainer width="100%" height={100}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={40} innerRadius={25} dataKey="value" strokeWidth={0}>
                <Cell fill="hsl(165,60%,45%)" />
                <Cell fill="hsl(220,16%,18%)" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <p className="text-2xl font-bold font-mono text-accent">{metrics.dataUtility}%</p>
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

      {/* New: Additional metric cards row */}
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

      {/* Radar Chart: Privacy Profile */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Privacy Profile Radar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(220,16%,22%)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: 'hsl(215,12%,55%)', fontSize: 10 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Score" dataKey="value" stroke="hsl(185,72%,48%)" fill="hsl(185,72%,48%)" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Privacy vs Utility Tradeoff */}
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
                <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden">
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

      {/* Extended metrics comparison table */}
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
            <ResponsiveContainer width="100%" height={250}>
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

      {/* Location Type Distribution Comparison */}
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
