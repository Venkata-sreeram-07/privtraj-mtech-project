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
  };

  const checkPage = (needed: number) => {
    if (y + needed > pageH - 25) {
      addFooter(doc.getNumberOfPages());
      doc.addPage();
      doc.setDrawColor(34, 184, 207);
      doc.setLineWidth(0.5);
      doc.line(margin, 12, pageW - margin, 12);
      doc.setFontSize(7);
      doc.setTextColor(150);
      doc.text('PrivTraj — Privacy Audit Report', margin, 10);
      y = 20;
    }
  };

  // Cover
  doc.setFillColor(15, 20, 25);
  doc.rect(0, 0, pageW, pageH, 'F');
  doc.setFontSize(36);
  doc.setTextColor(34, 184, 207);
  doc.text('PrivTraj', pageW / 2, 80, { align: 'center' });
  doc.setFontSize(14);
  doc.setTextColor(200);
  doc.text('Privacy Audit Report', pageW / 2, 95, { align: 'center' });
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text('Privacy-Preserving Trajectory Data Analytics', pageW / 2, 110, { align: 'center' });
  doc.setFontSize(11);
  doc.setTextColor(180);
  doc.text('Venkata Sreeram', pageW / 2, 140, { align: 'center' });
  doc.setFontSize(9);
  doc.setTextColor(130);
  doc.text('MTech Student — Sri Mittapalli College of Engineering', pageW / 2, 150, { align: 'center' });
  doc.text(`Report Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageW / 2, 165, { align: 'center' });

  doc.setFillColor(20, 28, 35);
  doc.roundedRect(30, 185, contentW - 20, 55, 3, 3, 'F');
  doc.setFontSize(10);
  doc.setTextColor(34, 184, 207);
  doc.text('REPORT SUMMARY', 40, 198);
  doc.setFontSize(9);
  doc.setTextColor(180);
  [`Privacy Level: ${metrics.privacyLevel}%  |  Data Utility: ${metrics.dataUtility}%  |  Re-ID Risk: ${metrics.reidentificationRisk}%`,
   `Points: ${metrics.pointsOriginal} → ${metrics.pointsAnonymized}  |  Suppression: ${metrics.suppressionRate}%  |  Displacement: ${metrics.averageDisplacement}m`,
   `Config: ε=${metrics.epsilonUsed}, l=${metrics.lValueUsed}, Noise=${metrics.noiseTypeUsed}`
  ].forEach((l, i) => doc.text(l, 40, 212 + i * 12));

  addFooter(1);

  // Page 2: Metrics
  doc.addPage();
  y = 25;
  doc.setFontSize(16);
  doc.setTextColor(34, 184, 207);
  doc.text('1. Privacy & Utility Metrics', margin, y);
  y += 12;

  autoTable(doc, {
    startY: y, margin: { left: margin },
    head: [['Metric', 'Value', 'Status']],
    body: [
      ['Privacy Level', `${metrics.privacyLevel}%`, metrics.privacyLevel >= 70 ? '✓ Good' : '✗ Low'],
      ['Data Utility', `${metrics.dataUtility}%`, metrics.dataUtility >= 60 ? '✓ Good' : '✗ Low'],
      ['Re-identification Risk', `${metrics.reidentificationRisk}%`, metrics.reidentificationRisk <= 30 ? '✓ Low' : '✗ High'],
      ['Suppression Rate', `${metrics.suppressionRate}%`, metrics.suppressionRate <= 40 ? '✓ OK' : '✗ High'],
      ['Avg. Displacement', `${metrics.averageDisplacement}m`, '—'],
      ['Temporal Consistency', `${metrics.temporalConsistency}%`, metrics.temporalConsistency >= 70 ? '✓ Good' : '✗ Low'],
      ['k-Anonymity Estimate', `~${metrics.kAnonymityEstimate}`, metrics.kAnonymityEstimate >= 5 ? '✓ Strong' : '✗ Weak'],
      ['Entropy Loss', `${metrics.entropyLoss}%`, metrics.entropyLoss <= 25 ? '✓ Low' : '✗ High'],
      ['Cluster Preservation', `${metrics.clusterPreservation}%`, metrics.clusterPreservation >= 70 ? '✓ Good' : '✗ Low'],
      ['Processing Time', `${metrics.processingTime}ms`, '✓'],
    ],
    headStyles: { fillColor: [34, 184, 207], textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    theme: 'grid',
  });

  y = (doc as any).lastAutoTable.finalY + 15;
  checkPage(60);
  doc.setFontSize(16);
  doc.setTextColor(34, 184, 207);
  doc.text('2. Privacy Risk by Location Type', margin, y);
  y += 12;

  autoTable(doc, {
    startY: y, margin: { left: margin },
    head: [['Location', 'Sensitivity', 'Points', 'Risk']],
    body: metrics.privacyRiskByType.sort((a, b) => b.risk - a.risk).map(r => [
      r.type.charAt(0).toUpperCase() + r.type.slice(1),
      `${LOCATION_SENSITIVITY[r.type]}%`,
      `${r.count}`,
      `${r.risk}% ${r.risk >= 70 ? '(HIGH)' : r.risk >= 40 ? '(MED)' : '(LOW)'}`,
    ]),
    headStyles: { fillColor: [245, 158, 11], textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [255, 251, 235] },
    theme: 'grid',
  });

  y = (doc as any).lastAutoTable.finalY + 15;
  checkPage(80);
  doc.setFontSize(16);
  doc.setTextColor(34, 184, 207);
  doc.text('3. Sample Data Comparison', margin, y);
  y += 12;

  autoTable(doc, {
    startY: y, margin: { left: margin },
    head: [['#', 'Orig Lat', 'Orig Lng', 'Anon Lat', 'Anon Lng', 'Type']],
    body: originalData.slice(0, 15).map((p, i) => [
      `${i + 1}`, p.lat.toFixed(5), p.lng.toFixed(5),
      anonymizedData[i]?.lat.toFixed(5) ?? '—', anonymizedData[i]?.lng.toFixed(5) ?? '—',
      p.locationType || '—',
    ]),
    headStyles: { fillColor: [34, 184, 207], textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 7 },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    theme: 'grid',
  });

  y = (doc as any).lastAutoTable.finalY + 15;
  checkPage(50);
  doc.setFontSize(14);
  doc.setTextColor(34, 184, 207);
  doc.text('Conclusion', margin, y);
  y += 10;
  doc.setFontSize(9);
  doc.setTextColor(60);
  [
    `This report was generated by PrivTraj v1.0 on ${new Date().toLocaleDateString()}.`,
    `Anonymization: l-Diversity (l=${metrics.lValueUsed}) + ${metrics.noiseTypeUsed} DP (ε=${metrics.epsilonUsed}).`,
    `Privacy Level: ${metrics.privacyLevel}% | Data Utility: ${metrics.dataUtility}% | Re-ID Risk: ${metrics.reidentificationRisk}%`,
    '',
    'Developed by Venkata Sreeram, MTech Student, Sri Mittapalli College of Engineering.',
  ].forEach(l => { doc.text(l, margin, y); y += 5; });

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Anonymization Results</h1>
          <p className="text-sm text-muted-foreground mt-1">Comprehensive analysis of privacy operations</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-2 text-xs" onClick={() => exportCSV(anonymizedData, 'anonymized_trajectories.csv')}>
            <FileDown className="w-3.5 h-3.5" /> Export CSV
          </Button>
          <Button size="sm" variant="outline" className="gap-2 text-xs" onClick={() => exportCSV(originalData, 'original_trajectories.csv')}>
            <Download className="w-3.5 h-3.5" /> Original CSV
          </Button>
          <Button size="sm" variant="outline" className="gap-2 text-xs" onClick={() => exportReport(metrics)}>
            <BarChart3 className="w-3.5 h-3.5" /> JSON Report
          </Button>
          <Button size="sm" className="gap-2 text-xs" onClick={() => exportPDFReport(metrics, originalData, anonymizedData)}>
            <FileText className="w-3.5 h-3.5" /> PDF Report
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
