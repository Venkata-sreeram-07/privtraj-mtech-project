import { Shield, Database, Clock, Activity, TrendingUp, Eye } from 'lucide-react';
import MetricCard from './MetricCard';
import { PrivacyMetrics } from '@/lib/trajectoryUtils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion } from 'framer-motion';

interface DashboardViewProps {
  metrics: PrivacyMetrics | null;
  hasData: boolean;
}

const demoChartData = [
  { name: 'ε=0.1', utility: 45, privacy: 98 },
  { name: 'ε=0.5', utility: 62, privacy: 90 },
  { name: 'ε=1.0', utility: 78, privacy: 82 },
  { name: 'ε=2.0', utility: 88, privacy: 70 },
  { name: 'ε=5.0', utility: 95, privacy: 52 },
];

const timelineData = [
  { time: '00:00', original: 120, anonymized: 95 },
  { time: '04:00', original: 45, anonymized: 38 },
  { time: '08:00', original: 280, anonymized: 245 },
  { time: '12:00', original: 340, anonymized: 290 },
  { time: '16:00', original: 310, anonymized: 265 },
  { time: '20:00', original: 190, anonymized: 160 },
];

export default function DashboardView({ metrics, hasData }: DashboardViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Privacy-preserving trajectory analytics overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          title="Privacy Level"
          value={metrics ? `${metrics.privacyLevel}%` : '—'}
          subtitle={hasData ? 'Strong protection' : 'Upload data to begin'}
          icon={Shield}
          color="primary"
        />
        <MetricCard
          title="Data Utility"
          value={metrics ? `${metrics.dataUtility}%` : '—'}
          subtitle="Information preserved"
          icon={TrendingUp}
          color="accent"
        />
        <MetricCard
          title="Processing Time"
          value={metrics ? `${metrics.processingTime}ms` : '—'}
          subtitle="Last operation"
          icon={Clock}
          color="warning"
        />
        <MetricCard
          title="Data Points"
          value={metrics ? metrics.pointsOriginal.toLocaleString() : '0'}
          subtitle={metrics ? `${metrics.pointsAnonymized} after anonymization` : 'No data loaded'}
          icon={Database}
          color="info"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card rounded-lg p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            Privacy vs Utility Trade-off
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={demoChartData}>
              <XAxis dataKey="name" tick={{ fill: 'hsl(215,12%,55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(215,12%,55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(220,18%,10%)',
                  border: '1px solid hsl(220,16%,18%)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="utility" fill="hsl(165,60%,45%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="privacy" fill="hsl(185,72%,48%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card rounded-lg p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent" />
            Trajectory Density Over Time
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={timelineData}>
              <XAxis dataKey="time" tick={{ fill: 'hsl(215,12%,55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(215,12%,55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(220,18%,10%)',
                  border: '1px solid hsl(220,16%,18%)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Area type="monotone" dataKey="original" stroke="hsl(185,72%,48%)" fill="hsl(185,72%,48%,0.15)" strokeWidth={2} />
              <Area type="monotone" dataKey="anonymized" stroke="hsl(165,60%,45%)" fill="hsl(165,60%,45%,0.15)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
