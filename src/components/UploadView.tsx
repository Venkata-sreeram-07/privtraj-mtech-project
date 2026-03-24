import { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { TrajectoryPoint, parseCSV, generateSampleTrajectory } from '@/lib/trajectoryUtils';

interface UploadViewProps {
  onDataLoaded: (points: TrajectoryPoint[], name: string) => void;
}

export default function UploadView({ onDataLoaded }: UploadViewProps) {
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [fileName, setFileName] = useState('');

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const points = parseCSV(text);
      if (points.length > 0) {
        setStatus('success');
        setFileName(file.name);
        onDataLoaded(points, file.name);
      } else {
        setStatus('error');
      }
    };
    reader.readAsText(file);
  }, [onDataLoaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleLoadSample = () => {
    const points = generateSampleTrajectory(500);
    setStatus('success');
    setFileName('sample_trajectory.csv');
    onDataLoaded(points, 'sample_trajectory.csv');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Upload Trajectory Data</h1>
        <p className="text-sm text-muted-foreground mt-1">Upload GPS trajectory datasets in CSV format</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`glass-card rounded-xl p-10 text-center cursor-pointer transition-all ${
          dragOver ? 'glow-border scale-[1.01]' : ''
        }`}
        onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.csv,.txt,.json';
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) handleFile(file);
          };
          input.click();
        }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Upload className="w-7 h-7 text-primary" />
          </div>
          <div>
            <p className="font-semibold">Drop your trajectory file here</p>
            <p className="text-sm text-muted-foreground mt-1">CSV with lat, lng, timestamp columns • Max 50MB</p>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card rounded-lg p-4 flex items-center gap-3 border border-accent/20"
          >
            <CheckCircle className="w-5 h-5 text-accent shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">{fileName}</p>
              <p className="text-xs text-muted-foreground">Loaded successfully</p>
            </div>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </motion.div>
        )}
        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card rounded-lg p-4 flex items-center gap-3 border border-destructive/20"
          >
            <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
            <p className="text-sm">Could not parse the file. Ensure it has lat/lng columns.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass-card rounded-lg p-5">
        <h3 className="text-sm font-semibold mb-3">Quick Start</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Don't have trajectory data? Load a sample dataset to explore PrivTraj's capabilities.
        </p>
        <Button onClick={handleLoadSample} variant="outline" className="glow-border">
          Load Sample Dataset (500 points)
        </Button>
      </div>

      <div className="glass-card rounded-lg p-5">
        <h3 className="text-sm font-semibold mb-3">Expected CSV Format</h3>
        <pre className="text-xs font-mono text-muted-foreground bg-secondary/50 rounded-md p-3 overflow-x-auto">
{`latitude,longitude,timestamp,user_id
40.7128,-74.0060,2024-01-15T08:30:00,user_1
40.7135,-74.0055,2024-01-15T08:31:00,user_1
40.7140,-74.0048,2024-01-15T08:32:00,user_2`}
        </pre>
      </div>
    </div>
  );
}
