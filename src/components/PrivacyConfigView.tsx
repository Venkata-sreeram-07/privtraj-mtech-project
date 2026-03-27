import { useState } from 'react';
import { Shield, Zap, Lock, Play, Clock, Info, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { PrivacyConfig, TrajectoryPoint, applyDifferentialPrivacy, applyLDiversity, applyTemporalRounding, computeExtendedMetrics, PrivacyMetrics } from '@/lib/trajectoryUtils';

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
    gridResolution: 0.005,
    temporalRounding: 5,
  });
  const [processing, setProcessing] = useState(false);

  const handleProcess = () => {
    if (originalData.length === 0) return;
    setProcessing(true);

    setTimeout(() => {
      const startTime = performance.now();
      let result = applyLDiversity(originalData, config.lDiversityValue, config.gridResolution);
      result = applyDifferentialPrivacy(result, config.epsilonValue, config.sensitivityValue, config.noiseType);
      result = applyTemporalRounding(result, config.temporalRounding);
      const processingTime = Math.round(performance.now() - startTime);

      const metrics = computeExtendedMetrics(originalData, result, config, processingTime);
      onProcessed(result, metrics);
      setProcessing(false);
    }, 500);
  };

  const hasData = originalData.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Privacy Configuration</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure anonymization algorithms and parameters</p>
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
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Lock className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">l-Diversity</h3>
              <p className="text-xs text-muted-foreground">Spatial anonymization — groups nearby points by grid cells</p>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-muted-foreground">l-Value</span>
              <span className="font-mono font-semibold text-primary">{config.lDiversityValue}</span>
            </div>
            <Slider value={[config.lDiversityValue]} onValueChange={([v]) => setConfig(c => ({ ...c, lDiversityValue: v }))} min={2} max={10} step={1} disabled={!hasData} />
            <p className="text-[10px] text-muted-foreground mt-2">Minimum distinct users per spatial cell. Higher = more private, less utility.</p>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-muted-foreground">Grid Resolution</span>
              <span className="font-mono font-semibold text-primary">{config.gridResolution.toFixed(3)}°</span>
            </div>
            <Slider value={[config.gridResolution]} onValueChange={([v]) => setConfig(c => ({ ...c, gridResolution: v }))} min={0.001} max={0.02} step={0.001} disabled={!hasData} />
            <p className="text-[10px] text-muted-foreground mt-2">Size of spatial grid cells in degrees. Smaller = finer resolution but more cells may be suppressed.</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-accent" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Differential Privacy</h3>
              <p className="text-xs text-muted-foreground">Adds calibrated noise to coordinates to prevent re-identification</p>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-muted-foreground">Epsilon (ε)</span>
              <span className="font-mono font-semibold text-accent">{config.epsilonValue.toFixed(1)}</span>
            </div>
            <Slider value={[config.epsilonValue]} onValueChange={([v]) => setConfig(c => ({ ...c, epsilonValue: v }))} min={0.1} max={10} step={0.1} disabled={!hasData} />
            <p className="text-[10px] text-muted-foreground mt-2">Privacy budget — lower ε means more noise and stronger privacy, but reduces data accuracy.</p>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-muted-foreground">Sensitivity (Δf)</span>
              <span className="font-mono font-semibold text-accent">{config.sensitivityValue.toFixed(1)}</span>
            </div>
            <Slider value={[config.sensitivityValue]} onValueChange={([v]) => setConfig(c => ({ ...c, sensitivityValue: v }))} min={0.1} max={5} step={0.1} disabled={!hasData} />
            <p className="text-[10px] text-muted-foreground mt-2">Maximum change one record can cause in the output. Higher sensitivity = more noise needed.</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground mb-2">Noise mechanism — determines how random noise is generated</p>
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
          </div>
        </motion.div>
      </div>

      {/* Noise mechanism comparison card */}
      {hasData && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <Card className="glass-card border-border">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <HelpCircle className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold">Laplace vs Gaussian: Which to Choose?</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-accent/5 rounded-lg p-4 border border-accent/20">
                  <h4 className="text-xs font-bold text-accent mb-2">Laplace Mechanism</h4>
                  <ul className="space-y-1.5 text-[11px] text-muted-foreground">
                    <li className="flex items-start gap-1.5"><span className="text-accent mt-0.5">•</span> Provides pure ε-differential privacy (strongest guarantee)</li>
                    <li className="flex items-start gap-1.5"><span className="text-accent mt-0.5">•</span> Adds noise from Laplace distribution: scale = Δf / ε</li>
                    <li className="flex items-start gap-1.5"><span className="text-accent mt-0.5">•</span> Best for numeric queries with known, bounded sensitivity</li>
                    <li className="flex items-start gap-1.5"><span className="text-accent mt-0.5">•</span> <strong className="text-foreground">Recommended for most use cases</strong></li>
                  </ul>
                </div>
                <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                  <h4 className="text-xs font-bold text-primary mb-2">Gaussian Mechanism</h4>
                  <ul className="space-y-1.5 text-[11px] text-muted-foreground">
                    <li className="flex items-start gap-1.5"><span className="text-primary mt-0.5">•</span> Provides (ε, δ)-differential privacy (relaxed guarantee)</li>
                    <li className="flex items-start gap-1.5"><span className="text-primary mt-0.5">•</span> Adds noise from Gaussian distribution: σ = Δf·√(2·ln(1.25/δ)) / ε</li>
                    <li className="flex items-start gap-1.5"><span className="text-primary mt-0.5">•</span> Produces smoother, more predictable noise than Laplace</li>
                    <li className="flex items-start gap-1.5"><span className="text-primary mt-0.5">•</span> <strong className="text-foreground">Better when composing multiple queries</strong></li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Temporal rounding */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card rounded-lg p-5 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-warning/10 border border-warning/20 flex items-center justify-center">
            <Clock className="w-4 h-4 text-warning" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Temporal Rounding</h3>
            <p className="text-xs text-muted-foreground">Round timestamps to reduce temporal precision and prevent time-based tracking</p>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-muted-foreground">Round to nearest</span>
            <span className="font-mono font-semibold text-warning">{config.temporalRounding} min</span>
          </div>
          <Slider value={[config.temporalRounding]} onValueChange={([v]) => setConfig(c => ({ ...c, temporalRounding: v }))} min={1} max={60} step={1} disabled={!hasData} />
          <p className="text-[10px] text-muted-foreground mt-2">Rounds all timestamps to the nearest interval. Higher values = less temporal precision but harder to correlate events.</p>
        </div>
      </motion.div>

      <Button onClick={handleProcess} disabled={!hasData || processing} className="w-full py-6 text-sm font-semibold glow-border">
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
