import { PrivacyMetrics, TrajectoryPoint } from '@/lib/trajectoryUtils';
import { motion } from 'framer-motion';
import { Shield, TrendingUp, Ruler, Hash, ArrowDown, ArrowRight } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ResultsViewProps {
  metrics: PrivacyMetrics | null;
  originalData: TrajectoryPoint[];
  anonymizedData: TrajectoryPoint[];
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

  const gaugeData = [
    { name: 'Privacy', value: metrics.privacyLevel, fill: 'hsl(185,72%,48%)' },
  ];

  const pieData = [
    { name: 'Retained', value: metrics.pointsAnonymized },
    { name: 'Suppressed', value: metrics.pointsOriginal - metrics.pointsAnonymized },
  ];

  const suppressionRate = Math.round((1 - metrics.pointsAnonymized / metrics.pointsOriginal) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Anonymization Results</h1>
        <p className="text-sm text-muted-foreground mt-1">Detailed analysis of privacy operations</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-lg p-5 text-center">
          <ResponsiveContainer width="100%" height={120}>
            <RadialBarChart innerRadius="70%" outerRadius="100%" data={gaugeData} startAngle={180} endAngle={0}>
              <RadialBar background={{ fill: 'hsl(220,16%,18%)' }} dataKey="value" cornerRadius={10} />
            </RadialBarChart>
          </ResponsiveContainer>
          <p className="text-2xl font-bold font-mono text-primary -mt-4">{metrics.privacyLevel}%</p>
          <p className="text-xs text-muted-foreground mt-1">Privacy Level</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-lg p-5 text-center">
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={45} innerRadius={30} dataKey="value" strokeWidth={0}>
                <Cell fill="hsl(165,60%,45%)" />
                <Cell fill="hsl(220,16%,18%)" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <p className="text-2xl font-bold font-mono text-accent">{metrics.dataUtility}%</p>
          <p className="text-xs text-muted-foreground mt-1">Data Utility</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-lg p-5 flex flex-col items-center justify-center">
          <Ruler className="w-8 h-8 text-warning mb-2" />
          <p className="text-2xl font-bold font-mono text-warning">{metrics.averageDisplacement}m</p>
          <p className="text-xs text-muted-foreground mt-1">Avg. Displacement</p>
        </motion.div>
      </div>

      {/* Detailed metrics */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card rounded-lg p-5">
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
            <p className="text-[10px] text-muted-foreground">l-Diversity</p>
            <p className="text-xs text-muted-foreground mt-1">Suppressed {suppressionRate}%</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
          <ArrowDown className="w-4 h-4 text-muted-foreground sm:hidden" />
          <div className="bg-secondary rounded-lg px-4 py-3 text-center min-w-[100px]">
            <TrendingUp className="w-4 h-4 text-accent mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground">Diff. Privacy</p>
            <p className="text-xs text-muted-foreground mt-1">Noise added</p>
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
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2 text-muted-foreground font-medium">#</th>
                <th className="text-left py-2 px-2 text-primary font-medium">Original Lat</th>
                <th className="text-left py-2 px-2 text-primary font-medium">Original Lng</th>
                <th className="text-left py-2 px-2 text-accent font-medium">Anon. Lat</th>
                <th className="text-left py-2 px-2 text-accent font-medium">Anon. Lng</th>
              </tr>
            </thead>
            <tbody>
              {originalData.slice(0, 8).map((p, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-1.5 px-2 text-muted-foreground">{i + 1}</td>
                  <td className="py-1.5 px-2">{p.lat.toFixed(6)}</td>
                  <td className="py-1.5 px-2">{p.lng.toFixed(6)}</td>
                  <td className="py-1.5 px-2 text-accent">
                    {anonymizedData[i] ? anonymizedData[i].lat.toFixed(6) : '—'}
                  </td>
                  <td className="py-1.5 px-2 text-accent">
                    {anonymizedData[i] ? anonymizedData[i].lng.toFixed(6) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
