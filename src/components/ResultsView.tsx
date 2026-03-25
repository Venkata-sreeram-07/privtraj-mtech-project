import { PrivacyMetrics, TrajectoryPoint, LOCATION_SENSITIVITY, LocationType } from '@/lib/trajectoryUtils';
import { motion } from 'framer-motion';
import { Shield, TrendingUp, Ruler, Hash, ArrowDown, ArrowRight, AlertTriangle, CheckCircle, XCircle, Activity, MapPin } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Anonymization Results</h1>
        <p className="text-sm text-muted-foreground mt-1">Comprehensive analysis of privacy operations</p>
      </div>

      {/* Summary gauges */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-lg p-5 text-center">
          <ResponsiveContainer width="100%" height={100}>
            <RadialBarChart innerRadius="70%" outerRadius="100%" data={gaugeData} startAngle={180} endAngle={0}>
              <RadialBar background={{ fill: 'hsl(220,16%,18%)' }} dataKey="value" cornerRadius={10} />
            </RadialBarChart>
          </ResponsiveContainer>
          <p className="text-2xl font-bold font-mono text-primary -mt-4">{metrics.privacyLevel}%</p>
          <p className="text-[10px] text-muted-foreground mt-1">Privacy Level</p>
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
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-lg p-5 flex flex-col items-center justify-center">
          <Ruler className="w-7 h-7 text-warning mb-2" />
          <p className="text-2xl font-bold font-mono text-warning">{metrics.averageDisplacement}m</p>
          <p className="text-[10px] text-muted-foreground mt-1">Avg. Displacement</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card rounded-lg p-5 flex flex-col items-center justify-center">
          <AlertTriangle className={`w-7 h-7 mb-2 ${riskColor(metrics.reidentificationRisk)}`} />
          <p className={`text-2xl font-bold font-mono ${riskColor(metrics.reidentificationRisk)}`}>{metrics.reidentificationRisk}%</p>
          <p className="text-[10px] text-muted-foreground mt-1">Re-identification Risk</p>
        </motion.div>
      </div>

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
