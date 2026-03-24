import { Info, Github, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SettingsView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings & Info</h1>
        <p className="text-sm text-muted-foreground mt-1">About PrivTraj and configuration</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Info className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">PrivTraj</h2>
            <p className="text-xs text-muted-foreground">Privacy-Preserving Trajectory Data Analytics</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          PrivTraj enables privacy-preserving analysis of GPS trajectory data through state-of-the-art anonymization techniques including <strong className="text-foreground">l-Diversity</strong> for spatial generalization and <strong className="text-foreground">Differential Privacy</strong> (Laplace & Gaussian noise mechanisms) for statistical privacy guarantees.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-lg p-6 space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-accent" />
          Algorithms
        </h3>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="bg-secondary/50 rounded-md p-3">
            <p className="font-medium text-foreground text-xs mb-1">l-Diversity</p>
            <p className="text-xs">Ensures each spatial cell contains at least <em>l</em> distinct user identities. Cells that don't meet the threshold are suppressed.</p>
          </div>
          <div className="bg-secondary/50 rounded-md p-3">
            <p className="font-medium text-foreground text-xs mb-1">Differential Privacy (ε-DP)</p>
            <p className="text-xs">Adds calibrated noise (Laplace or Gaussian) to coordinates. Lower ε = more privacy, less utility. Scale = sensitivity / ε.</p>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-lg p-6">
        <h3 className="text-sm font-semibold mb-3">Architecture</h3>
        <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
          {['React', 'TypeScript', 'Leaflet', 'Recharts', 'Lovable Cloud'].map((tech, i) => (
            <span key={tech} className="bg-secondary px-2.5 py-1 rounded-md text-muted-foreground border border-border">
              {tech}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
