import { Info, BookOpen, Shield, Zap, Lock, Clock, MapPin, Database, Globe, BarChart3, Layers, FileText, Settings, Code2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

export default function SettingsView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings & Info</h1>
        <p className="text-sm text-muted-foreground mt-1">About PrivTraj, algorithm reference, and data format guidelines</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Info className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">PrivTraj</h2>
            <p className="text-xs text-muted-foreground">Privacy-Preserving Trajectory Data Analytics • v1.0</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          PrivTraj enables privacy-preserving analysis of GPS trajectory data through state-of-the-art anonymization techniques including <strong className="text-foreground">l-Diversity</strong> for spatial generalization, <strong className="text-foreground">Differential Privacy</strong> (Laplace & Gaussian noise), <strong className="text-foreground">Temporal Rounding</strong>, and <strong className="text-foreground">Location Sensitivity Scoring</strong>.
        </p>
      </motion.div>

      {/* Supported Data Format */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card rounded-lg p-6 space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Database className="w-4 h-4 text-primary" />
          Supported CSV Data Format
        </h3>
        <p className="text-xs text-muted-foreground">Your CSV file should contain these columns for best results:</p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[10px]">Column</TableHead>
              <TableHead className="text-[10px]">Required</TableHead>
              <TableHead className="text-[10px]">Description</TableHead>
              <TableHead className="text-[10px]">Example</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              { col: 'latitude', req: 'Yes', desc: 'GPS latitude coordinate', ex: '40.7128' },
              { col: 'longitude', req: 'Yes', desc: 'GPS longitude coordinate', ex: '-74.0060' },
              { col: 'timestamp', req: 'Optional', desc: 'Date/time of the record', ex: '2025-01-15T09:30:00Z' },
              { col: 'user_id', req: 'Optional', desc: 'Identifier for the user', ex: 'user_1' },
              { col: 'location_type', req: 'Optional', desc: 'Type of location visited', ex: 'hospital' },
            ].map(r => (
              <TableRow key={r.col}>
                <TableCell className="text-xs font-mono font-medium">{r.col}</TableCell>
                <TableCell className="text-xs">{r.req === 'Yes' ? <Badge className="text-[9px] bg-primary/20 text-primary border-primary/30">Required</Badge> : <Badge variant="outline" className="text-[9px]">Optional</Badge>}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{r.desc}</TableCell>
                <TableCell className="text-xs font-mono text-muted-foreground">{r.ex}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>

      {/* Location Types & Sensitivity */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-lg p-6 space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <MapPin className="w-4 h-4 text-warning" />
          Location Types & Sensitivity Scores
        </h3>
        <p className="text-xs text-muted-foreground">Each location type has a sensitivity score. Higher scores mean more noise is applied during anonymization.</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {[
            { type: 'Hospital', score: 95 }, { type: 'Home', score: 90 }, { type: 'Government', score: 80 },
            { type: 'Bank', score: 75 }, { type: 'School', score: 65 }, { type: 'Gym', score: 50 },
            { type: 'Restaurant', score: 40 }, { type: 'Shopping', score: 35 }, { type: 'Park', score: 25 },
            { type: 'Office', score: 20 },
          ].map(l => (
            <div key={l.type} className={`rounded-lg p-2.5 text-center border ${
              l.score >= 70 ? 'bg-destructive/5 border-destructive/20' : l.score >= 40 ? 'bg-warning/5 border-warning/20' : 'bg-accent/5 border-accent/20'
            }`}>
              <p className="text-xs font-semibold">{l.type}</p>
              <p className={`text-sm font-mono font-bold ${l.score >= 70 ? 'text-destructive' : l.score >= 40 ? 'text-warning' : 'text-accent'}`}>{l.score}%</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Algorithm Reference */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card rounded-lg p-6 space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-accent" />
          Algorithm Reference
        </h3>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="bg-secondary/50 rounded-md p-3">
            <p className="font-medium text-foreground text-xs mb-1">l-Diversity</p>
            <p className="text-xs">Ensures each spatial cell contains at least <em>l</em> distinct user identities. Cells that don't meet the threshold are suppressed entirely to prevent disclosure.</p>
          </div>
          <div className="bg-secondary/50 rounded-md p-3">
            <p className="font-medium text-foreground text-xs mb-1">Differential Privacy (ε-DP)</p>
            <p className="text-xs">Adds calibrated noise (Laplace or Gaussian) to coordinates. Lower ε = more privacy, less utility. Scale = sensitivity / ε. Sensitive locations (hospitals, homes) receive amplified noise.</p>
          </div>
          <div className="bg-secondary/50 rounded-md p-3">
            <p className="font-medium text-foreground text-xs mb-1">Temporal Rounding</p>
            <p className="text-xs">Rounds timestamps to the nearest N-minute interval. This prevents attackers from correlating events by precise timing while preserving general temporal patterns.</p>
          </div>
          <div className="bg-secondary/50 rounded-md p-3">
            <p className="font-medium text-foreground text-xs mb-1">Location Sensitivity Scoring</p>
            <p className="text-xs">Each location type is assigned a sensitivity score (0–100%). Higher-sensitivity locations automatically receive more noise during differential privacy, ensuring visits to hospitals or homes are harder to trace.</p>
          </div>
        </div>
      </motion.div>

      {/* Parameter Tuning Guide */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-lg p-6 space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Settings className="w-4 h-4 text-primary" />
          Parameter Tuning Guide
        </h3>
        <p className="text-xs text-muted-foreground">Recommended parameter ranges for different privacy requirements:</p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[10px]">Scenario</TableHead>
              <TableHead className="text-[10px]">l-Value</TableHead>
              <TableHead className="text-[10px]">Epsilon</TableHead>
              <TableHead className="text-[10px]">Grid Res.</TableHead>
              <TableHead className="text-[10px]">Temporal</TableHead>
              <TableHead className="text-[10px]">Noise</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              { scenario: 'High Privacy (GDPR)', l: '5–10', eps: '0.1–0.5', grid: '0.01–0.02', temp: '30–60 min', noise: 'Laplace' },
              { scenario: 'Balanced', l: '3–5', eps: '1.0', grid: '0.005', temp: '5–15 min', noise: 'Laplace' },
              { scenario: 'High Utility (Research)', l: '2–3', eps: '5.0–10', grid: '0.001–0.003', temp: '1–5 min', noise: 'Gaussian' },
              { scenario: 'Healthcare / HIPAA', l: '7–10', eps: '0.1–0.3', grid: '0.015', temp: '60 min', noise: 'Laplace' },
            ].map(r => (
              <TableRow key={r.scenario}>
                <TableCell className="text-xs font-medium">{r.scenario}</TableCell>
                <TableCell className="text-xs font-mono">{r.l}</TableCell>
                <TableCell className="text-xs font-mono">{r.eps}</TableCell>
                <TableCell className="text-xs font-mono">{r.grid}</TableCell>
                <TableCell className="text-xs font-mono">{r.temp}</TableCell>
                <TableCell className="text-xs font-mono">{r.noise}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>

      {/* Architecture */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card rounded-lg p-6">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Code2 className="w-4 h-4 text-primary" />
          Technology Stack
        </h3>
        <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
          {['React', 'TypeScript', 'Tailwind CSS', 'Leaflet', 'Recharts', 'Framer Motion', 'Shadcn/UI', 'Vite'].map((tech) => (
            <span key={tech} className="bg-secondary px-2.5 py-1 rounded-md text-muted-foreground border border-border">
              {tech}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Credits */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-lg p-6 text-center">
        <p className="text-xs text-muted-foreground">
          Developed by <strong className="text-foreground">Venkata Sreeram</strong> • MTech Student, Sri Mittapalli College of Engineering
        </p>
      </motion.div>
    </div>
  );
}
