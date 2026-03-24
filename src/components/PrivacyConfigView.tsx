import { useState } from 'react';
import { Shield, Zap, Lock, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { motion } from 'framer-motion';
import { PrivacyConfig, TrajectoryPoint, applyDifferentialPrivacy, applyLDiversity, calculateDisplacement, PrivacyMetrics } from '@/lib/trajectoryUtils';

interface PrivacyConfigViewProps {
  originalData: TrajectoryPoint[];
  onProcessed: (anonymized: TrajectoryPoint[], metrics: PrivacyMetrics) => void;
}

export default function PrivacyConfigView({ originalData, onProcessed }: PrivacyConfigViewProps) {
  const [config, setConfig] = useState<PrivacyConfig>({
    lDiversityValue: 3,
    epsilonValue: 1.0,
    noiseType: 'laplace',
    sensitivityValue: 1.0,
  });
  const [processing, setProcessing] = useState(false);

  const handleProcess = () => {
    if (originalData.length === 0) return;
    setProcessing(true);

    setTimeout(() => {
      const startTime = performance.now();

      // Apply l-diversity first
      let result = applyLDiversity(originalData, config.lDiversityValue);

      // Then apply differential privacy
      result = applyDifferentialPrivacy(result, config.epsilonValue, config.sensitivityValue, config.noiseType);

      const processingTime = Math.round(performance.now() - startTime);
      const displacement = calculateDisplacement(originalData, result);

      const privacyLevel = Math.min(100, Math.round(
        (1 / config.epsilonValue) * 30 + config.lDiversityValue * 12 + (1 - result.length / originalData.length) * 20
      ));
      const dataUtility = Math.max(0, Math.round(
        100 - displacement * 2 - (1 - result.length / originalData.length) * 40
      ));

      const metrics: PrivacyMetrics = {
        privacyLevel,
        dataUtility,
        processingTime,
        pointsOriginal: originalData.length,
        pointsAnonymized: result.length,
        averageDisplacement: Math.round(displacement * 100) / 100,
      };

      onProcessed(result, metrics);
      setProcessing(false);
    }, 500);
  };

  const hasData = originalData.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Privacy Configuration</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure anonymization algorithms</p>
      </div>

      {!hasData && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-lg p-5 border border-warning/20">
          <p className="text-sm text-warning flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Upload trajectory data first to configure privacy settings
          </p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* l-Diversity */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Lock className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">l-Diversity</h3>
              <p className="text-xs text-muted-foreground">Spatial anonymization</p>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-muted-foreground">l-Value</span>
              <span className="font-mono font-semibold text-primary">{config.lDiversityValue}</span>
            </div>
            <Slider
              value={[config.lDiversityValue]}
              onValueChange={([v]) => setConfig(c => ({ ...c, lDiversityValue: v }))}
              min={2}
              max={10}
              step={1}
              disabled={!hasData}
            />
            <p className="text-[10px] text-muted-foreground mt-2">
              Minimum distinct users per spatial cell. Higher = more private, less utility.
            </p>
          </div>
        </motion.div>

        {/* Differential Privacy */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-accent" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Differential Privacy</h3>
              <p className="text-xs text-muted-foreground">Noise injection</p>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-muted-foreground">Epsilon (ε)</span>
              <span className="font-mono font-semibold text-accent">{config.epsilonValue.toFixed(1)}</span>
            </div>
            <Slider
              value={[config.epsilonValue]}
              onValueChange={([v]) => setConfig(c => ({ ...c, epsilonValue: v }))}
              min={0.1}
              max={10}
              step={0.1}
              disabled={!hasData}
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-muted-foreground">Sensitivity</span>
              <span className="font-mono font-semibold text-accent">{config.sensitivityValue.toFixed(1)}</span>
            </div>
            <Slider
              value={[config.sensitivityValue]}
              onValueChange={([v]) => setConfig(c => ({ ...c, sensitivityValue: v }))}
              min={0.1}
              max={5}
              step={0.1}
              disabled={!hasData}
            />
          </div>

          <div className="flex gap-2">
            {(['laplace', 'gaussian'] as const).map(type => (
              <button
                key={type}
                onClick={() => setConfig(c => ({ ...c, noiseType: type }))}
                disabled={!hasData}
                className={`flex-1 py-2 rounded-md text-xs font-medium transition-all capitalize ${
                  config.noiseType === type
                    ? 'bg-accent/20 text-accent border border-accent/30'
                    : 'bg-secondary text-muted-foreground border border-border hover:text-foreground'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      <Button
        onClick={handleProcess}
        disabled={!hasData || processing}
        className="w-full py-6 text-sm font-semibold glow-border"
      >
        {processing ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Processing...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            Apply Privacy Algorithms
          </span>
        )}
      </Button>
    </div>
  );
}
