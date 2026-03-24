import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, Upload, Map, BarChart3, Lock, Database, Cpu, Eye, EyeOff,
  ArrowRight, ChevronRight, Globe, Zap, TrendingUp, Users, FileText,
  Layers, GitBranch, Server, Code2, BookOpen, GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

import heroImg from '@/assets/hero-trajectory.jpg';
import dpImg from '@/assets/differential-privacy.jpg';
import ldImg from '@/assets/l-diversity.jpg';
import archImg from '@/assets/architecture.jpg';
import smartcityImg from '@/assets/usecase-smartcity.jpg';
import healthcareImg from '@/assets/usecase-healthcare.jpg';
import transportImg from '@/assets/usecase-transport.jpg';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0, 0, 0.2, 1] as const },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [showOriginal, setShowOriginal] = useState(true);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <span className="font-bold text-lg gradient-text">PrivTraj</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Algorithms', 'Architecture', 'Use Cases', 'About'].map((item) => (
              <button
                key={item}
                onClick={() => scrollTo(item.toLowerCase().replace(' ', '-'))}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
          <Button onClick={() => navigate('/app')} size="sm" className="gap-2">
            Launch App <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-16 min-h-screen flex items-center">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Trajectory data visualization" className="w-full h-full object-cover opacity-30" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} custom={0}>
              <Badge variant="outline" className="mb-6 border-primary/30 text-primary font-mono text-xs px-4 py-1.5">
                MTech Research Project • 2025
              </Badge>
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight mb-6">
              Privacy-Preserving{' '}
              <span className="gradient-text">Trajectory</span>{' '}
              Data Analytics
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed">
              A full-stack platform for anonymizing GPS trajectory datasets using{' '}
              <span className="text-primary font-semibold">l-Diversity</span> and{' '}
              <span className="text-accent font-semibold">Differential Privacy</span>{' '}
              algorithms — balancing data utility with user privacy in the age of ubiquitous location tracking.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-4">
              <Button onClick={() => navigate('/app')} size="lg" className="gap-2 text-base">
                Try the Platform <ArrowRight className="w-4 h-4" />
              </Button>
              <Button onClick={() => scrollTo('algorithms')} variant="outline" size="lg" className="gap-2 text-base">
                Explore Algorithms <BookOpen className="w-4 h-4" />
              </Button>
            </motion.div>
            <motion.div variants={fadeUp} custom={4} className="mt-10 flex items-center gap-3 text-sm text-muted-foreground">
              <GraduationCap className="w-4 h-4 text-primary" />
              <span>
                Developed by <strong className="text-foreground">Venkata Sreeram</strong> • MTech Student, Sri Mittapalli College of Engineering
              </span>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="hidden lg:block"
          >
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-muted-foreground">TRAJECTORY PREVIEW</span>
                <button
                  onClick={() => setShowOriginal(!showOriginal)}
                  className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  {showOriginal ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  {showOriginal ? 'Original' : 'Anonymized'}
                </button>
              </div>
              <div className="h-64 rounded-lg bg-muted/30 border border-border overflow-hidden relative">
                <svg viewBox="0 0 400 250" className="w-full h-full">
                  {/* Grid */}
                  {Array.from({ length: 10 }).map((_, i) => (
                    <line key={`g${i}`} x1={i * 40} y1={0} x2={i * 40} y2={250} stroke="hsl(220,16%,18%)" strokeWidth={0.5} />
                  ))}
                  {Array.from({ length: 7 }).map((_, i) => (
                    <line key={`h${i}`} x1={0} y1={i * 40} x2={400} y2={i * 40} stroke="hsl(220,16%,18%)" strokeWidth={0.5} />
                  ))}
                  {/* Original path */}
                  <motion.path
                    d="M 30 200 Q 80 180 120 150 T 200 120 T 280 80 T 370 50"
                    fill="none"
                    stroke={showOriginal ? 'hsl(185,72%,48%)' : 'hsl(165,60%,45%)'}
                    strokeWidth={2}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, ease: 'easeInOut' }}
                    key={showOriginal ? 'orig' : 'anon'}
                  />
                  {/* Data points */}
                  {(showOriginal
                    ? [[30,200],[80,170],[120,150],[160,135],[200,120],[240,100],[280,80],[330,60],[370,50]]
                    : [[35,195],[85,175],[115,145],[165,140],[195,115],[245,105],[275,75],[325,65],[375,45]]
                  ).map(([cx, cy], i) => (
                    <motion.circle
                      key={i}
                      cx={cx}
                      cy={cy}
                      r={3}
                      fill={showOriginal ? 'hsl(185,72%,48%)' : 'hsl(165,60%,45%)'}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 + 0.5 }}
                    />
                  ))}
                </svg>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: 'Points', value: '500+' },
                  { label: 'Privacy', value: '94%' },
                  { label: 'Utility', value: '87%' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-muted/30 rounded-lg p-3 border border-border">
                    <div className="text-lg font-bold text-primary font-mono">{stat.value}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Problem Statement ── */}
      <section className="py-24 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center max-w-3xl mx-auto mb-16">
            <motion.p variants={fadeUp} custom={0} className="text-primary font-mono text-sm mb-4 uppercase tracking-widest">The Problem</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-black mb-6">
              Why Privacy Matters in the <span className="gradient-text">Data-Driven World</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-lg leading-relaxed">
              Every day, billions of location data points are generated from smartphones, vehicles, and IoT devices.
              Without proper anonymization, this data can reveal sensitive personal information — home addresses,
              daily routines, medical visits, and more.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Globe, value: '6B+', label: 'Smartphone users generating location data daily', color: 'text-primary' },
              { icon: Database, value: '2.5QB', label: 'Bytes of data created every single day globally', color: 'text-accent' },
              { icon: Users, value: '73%', label: 'Users concerned about location data privacy', color: 'text-warning' },
              { icon: Lock, value: '€20M+', label: 'GDPR fines for data privacy violations in 2024', color: 'text-destructive' },
            ].map((stat, i) => (
              <motion.div key={stat.label} variants={fadeUp} custom={i}>
                <Card className="glass-card border-border hover:glow-border transition-all duration-300 h-full">
                  <CardContent className="p-6 text-center">
                    <stat.icon className={`w-8 h-8 mx-auto mb-4 ${stat.color}`} />
                    <div className="text-3xl font-black font-mono mb-2">{stat.value}</div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 border-t border-border grid-bg">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center max-w-3xl mx-auto mb-16">
            <motion.p variants={fadeUp} custom={0} className="text-primary font-mono text-sm mb-4 uppercase tracking-widest">Platform Features</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-black mb-6">
              Everything You Need for <span className="gradient-text">Trajectory Privacy</span>
            </motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Upload, title: 'CSV Data Upload', desc: 'Upload GPS trajectory datasets in standard CSV format with automatic column detection and validation.' },
              { icon: Shield, title: 'l-Diversity Anonymization', desc: 'Spatial cell generalization ensuring each grid cell contains at least l distinct user identities.' },
              { icon: Lock, title: 'Differential Privacy', desc: 'Laplace and Gaussian noise injection with configurable epsilon (ε) and sensitivity parameters.' },
              { icon: Map, title: 'Interactive Map View', desc: 'Leaflet-powered map comparing original vs. anonymized trajectories with dark-themed tiles.' },
              { icon: BarChart3, title: 'Privacy Metrics Dashboard', desc: 'Real-time charts showing privacy level, data utility, processing time, and displacement metrics.' },
              { icon: Zap, title: 'Real-Time Processing', desc: 'Instant anonymization with configurable algorithms and immediate visual feedback on results.' },
              { icon: FileText, title: 'Export Results', desc: 'Download anonymized datasets and privacy reports for further analysis and documentation.' },
              { icon: TrendingUp, title: 'Utility Analysis', desc: 'Quantitative measurement of data utility preservation after applying privacy algorithms.' },
              { icon: Eye, title: 'Before/After Comparison', desc: 'Side-by-side visualization of original and anonymized trajectory data on interactive maps.' },
            ].map((feature, i) => (
              <motion.div key={feature.title} variants={fadeUp} custom={i}>
                <Card className="glass-card border-border hover:glow-border transition-all duration-300 h-full group">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-base">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed">{feature.desc}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Algorithms ── */}
      <section id="algorithms" className="py-24 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center max-w-3xl mx-auto mb-16">
            <motion.p variants={fadeUp} custom={0} className="text-primary font-mono text-sm mb-4 uppercase tracking-widest">Core Algorithms</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-black mb-6">
              How <span className="gradient-text">PrivTraj</span> Protects Your Data
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-lg">
              Two mathematically proven privacy techniques working together to anonymize trajectory data
              while maximizing analytical utility.
            </motion.p>
          </motion.div>

          {/* l-Diversity */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid lg:grid-cols-2 gap-12 items-center mb-24">
            <motion.div variants={fadeUp} custom={0}>
              <Badge className="mb-4 bg-accent/10 text-accent border-accent/30">Algorithm 01</Badge>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">l-Diversity Anonymization</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                l-Diversity extends k-anonymity by ensuring that each equivalence class (spatial grid cell)
                contains at least <strong className="text-foreground">l distinct values</strong> for sensitive attributes.
                This prevents attribute disclosure attacks where an adversary can infer sensitive information.
              </p>
              <div className="space-y-4">
                {[
                  { step: '01', title: 'Spatial Gridding', desc: 'Divide the geographic space into uniform grid cells based on configurable resolution.' },
                  { step: '02', title: 'Diversity Check', desc: 'Verify each cell contains at least l unique user identities to satisfy the diversity constraint.' },
                  { step: '03', title: 'Generalization', desc: 'Points in qualifying cells are generalized to the cell centroid with controlled random offset.' },
                  { step: '04', title: 'Suppression', desc: 'Cells failing the l-diversity threshold are suppressed (removed) to prevent disclosure.' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-mono font-bold text-accent">{item.step}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-1">{item.title}</h4>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div variants={fadeUp} custom={1}>
              <div className="glass-card rounded-2xl overflow-hidden">
                <img src={ldImg} alt="l-Diversity concept visualization" loading="lazy" width={800} height={600} className="w-full h-64 object-cover" />
                <div className="p-6">
                  <h4 className="font-mono text-xs text-muted-foreground mb-3 uppercase tracking-wider">Mathematical Definition</h4>
                  <div className="bg-muted/30 rounded-lg p-4 border border-border font-mono text-sm">
                    <p className="text-primary mb-1">For each equivalence class q:</p>
                    <p className="text-foreground">|distinct(q.sensitive)| ≥ l</p>
                    <p className="text-muted-foreground text-xs mt-2">where l is the diversity parameter (typically 2-10)</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Differential Privacy */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeUp} custom={0} className="lg:order-2">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/30">Algorithm 02</Badge>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Differential Privacy (ε-DP)</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Differential Privacy provides a <strong className="text-foreground">mathematical guarantee</strong> that
                the inclusion or exclusion of any single trajectory point does not significantly affect
                the output. Noise is calibrated using the privacy budget epsilon (ε).
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Card className="glass-card border-border">
                  <CardContent className="p-4">
                    <h4 className="text-sm font-semibold text-primary mb-1">Laplace Mechanism</h4>
                    <p className="text-xs text-muted-foreground">Noise ~ Lap(Δf/ε)</p>
                    <p className="text-xs text-muted-foreground mt-1">Best for numeric queries with bounded sensitivity</p>
                  </CardContent>
                </Card>
                <Card className="glass-card border-border">
                  <CardContent className="p-4">
                    <h4 className="text-sm font-semibold text-accent mb-1">Gaussian Mechanism</h4>
                    <p className="text-xs text-muted-foreground">Noise ~ N(0, σ²)</p>
                    <p className="text-xs text-muted-foreground mt-1">Better for (ε,δ)-DP with relaxed guarantees</p>
                  </CardContent>
                </Card>
              </div>
              <div className="bg-muted/30 rounded-lg p-4 border border-border">
                <h4 className="font-mono text-xs text-muted-foreground mb-2 uppercase tracking-wider">Privacy Guarantee</h4>
                <p className="font-mono text-sm text-foreground">Pr[M(D) ∈ S] ≤ e<sup>ε</sup> · Pr[M(D') ∈ S]</p>
                <p className="text-xs text-muted-foreground mt-2">For any two adjacent databases D, D' differing in one record</p>
              </div>
            </motion.div>
            <motion.div variants={fadeUp} custom={1} className="lg:order-1">
              <div className="glass-card rounded-2xl overflow-hidden">
                <img src={dpImg} alt="Differential privacy distribution" loading="lazy" width={800} height={600} className="w-full h-72 object-cover" />
                <div className="p-6 grid grid-cols-3 gap-3 text-center">
                  {[
                    { label: 'Low ε (0.1)', privacy: 'High Privacy', utility: 'Low Utility', color: 'text-accent' },
                    { label: 'Med ε (1.0)', privacy: 'Balanced', utility: 'Balanced', color: 'text-primary' },
                    { label: 'High ε (5.0)', privacy: 'Low Privacy', utility: 'High Utility', color: 'text-warning' },
                  ].map((item) => (
                    <div key={item.label} className="bg-muted/30 rounded-lg p-3 border border-border">
                      <p className={`text-xs font-mono font-bold ${item.color}`}>{item.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{item.privacy}</p>
                      <p className="text-[10px] text-muted-foreground">{item.utility}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Architecture ── */}
      <section id="architecture" className="py-24 border-t border-border grid-bg">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center max-w-3xl mx-auto mb-16">
            <motion.p variants={fadeUp} custom={0} className="text-primary font-mono text-sm mb-4 uppercase tracking-widest">System Design</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-black mb-6">
              <span className="gradient-text">Architecture</span> Overview
            </motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="glass-card rounded-2xl overflow-hidden mb-12">
              <img src={archImg} alt="System architecture diagram" loading="lazy" width={1200} height={700} className="w-full" />
            </div>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Code2, title: 'React Frontend', desc: 'TypeScript + Vite + Tailwind CSS with Leaflet maps and Recharts visualization', tech: ['React 18', 'TypeScript', 'Tailwind CSS'] },
              { icon: Server, title: 'API Layer', desc: 'RESTful API endpoints for data upload, processing, and result retrieval', tech: ['REST API', 'Edge Functions', 'JSON'] },
              { icon: Cpu, title: 'Processing Engine', desc: 'l-Diversity and Differential Privacy algorithms with configurable parameters', tech: ['l-Diversity', 'ε-DP', 'Laplace/Gaussian'] },
              { icon: Database, title: 'Data Storage', desc: 'PostgreSQL for persistent storage of datasets, results, and processing history', tech: ['PostgreSQL', 'Cloud Storage', 'CSV'] },
            ].map((layer, i) => (
              <motion.div key={layer.title} variants={fadeUp} custom={i}>
                <Card className="glass-card border-border h-full">
                  <CardHeader>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                      <layer.icon className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-sm">{layer.title}</CardTitle>
                    <CardDescription className="text-xs">{layer.desc}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                      {layer.tech.map((t) => (
                        <Badge key={t} variant="secondary" className="text-[10px] font-mono">{t}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Data Flow */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mt-12">
            <Card className="glass-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-primary" />
                  Data Processing Pipeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
                  {[
                    { label: 'CSV Upload', icon: Upload },
                    { label: 'Parsing & Validation', icon: FileText },
                    { label: 'l-Diversity', icon: Layers },
                    { label: 'Differential Privacy', icon: Lock },
                    { label: 'Metrics Calculation', icon: BarChart3 },
                    { label: 'Visualization', icon: Map },
                  ].map((step, i, arr) => (
                    <div key={step.label} className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-muted/30 rounded-lg px-4 py-2.5 border border-border">
                        <step.icon className="w-4 h-4 text-primary" />
                        <span className="text-xs font-medium">{step.label}</span>
                      </div>
                      {i < arr.length - 1 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* ── Use Cases Carousel ── */}
      <section id="use-cases" className="py-24 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center max-w-3xl mx-auto mb-16">
            <motion.p variants={fadeUp} custom={0} className="text-primary font-mono text-sm mb-4 uppercase tracking-widest">Real-World Applications</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-black mb-6">
              Where <span className="gradient-text">PrivTraj</span> Makes an Impact
            </motion.h2>
          </motion.div>

          <div className="max-w-5xl mx-auto px-12">
            <Carousel opts={{ align: 'start', loop: true }}>
              <CarouselContent>
                {[
                  {
                    img: smartcityImg,
                    title: 'Smart City Planning',
                    desc: 'Urban planners can analyze traffic patterns and pedestrian flows without compromising individual privacy. Trajectory data helps optimize public transport routes and infrastructure placement.',
                    stats: ['Traffic Optimization', 'Urban Mobility', 'Public Transit'],
                  },
                  {
                    img: healthcareImg,
                    title: 'Healthcare & Epidemiology',
                    desc: 'Track disease spread patterns and patient movement within healthcare facilities while maintaining strict HIPAA compliance through mathematical privacy guarantees.',
                    stats: ['Contact Tracing', 'HIPAA Compliance', 'Epidemic Analysis'],
                  },
                  {
                    img: transportImg,
                    title: 'Transportation & Logistics',
                    desc: 'Ride-sharing and delivery companies can share anonymized route data for research and optimization without exposing individual driver or customer trajectories.',
                    stats: ['Route Planning', 'Fleet Analytics', 'Demand Prediction'],
                  },
                ].map((useCase) => (
                  <CarouselItem key={useCase.title} className="md:basis-1/2 lg:basis-1/2">
                    <Card className="glass-card border-border h-full overflow-hidden">
                      <img src={useCase.img} alt={useCase.title} loading="lazy" width={800} height={512} className="w-full h-48 object-cover" />
                      <CardHeader>
                        <CardTitle className="text-lg">{useCase.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">{useCase.desc}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {useCase.stats.map((s) => (
                            <Badge key={s} variant="secondary" className="text-[10px] font-mono">{s}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </div>
      </section>

      {/* ── Why Now Section ── */}
      <section className="py-24 border-t border-border grid-bg">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeUp} custom={0}>
              <p className="text-primary font-mono text-sm mb-4 uppercase tracking-widest">Why Now</p>
              <h2 className="text-3xl md:text-4xl font-black mb-6">
                The Urgency of <span className="gradient-text">Location Privacy</span>
              </h2>
              <div className="space-y-6 text-muted-foreground">
                <p className="leading-relaxed">
                  With the explosion of IoT devices, connected vehicles, and smartphone applications,
                  location data has become one of the most sensitive and valuable types of personal information.
                  Regulations like <strong className="text-foreground">GDPR</strong>, <strong className="text-foreground">CCPA</strong>,
                  and <strong className="text-foreground">India's DPDP Act 2023</strong> now mandate
                  strict privacy protections for such data.
                </p>
                <p className="leading-relaxed">
                  Traditional anonymization methods like simple pseudonymization are no longer sufficient —
                  research has shown that <strong className="text-foreground">87% of Americans</strong> can
                  be uniquely identified using just three data points: ZIP code, birth date, and gender.
                  Trajectory data makes re-identification even easier.
                </p>
                <p className="leading-relaxed">
                  PrivTraj bridges the gap between <strong className="text-foreground">data utility</strong> and
                  <strong className="text-foreground"> privacy protection</strong>, enabling organizations to leverage
                  location analytics while maintaining mathematical privacy guarantees.
                </p>
              </div>
            </motion.div>
            <motion.div variants={fadeUp} custom={1} className="space-y-4">
              {[
                { year: '2018', event: 'GDPR enforcement begins — €50M+ in fines for location data violations' },
                { year: '2020', event: 'COVID contact tracing raises global awareness of trajectory privacy' },
                { year: '2023', event: "India's Digital Personal Data Protection Act enacted" },
                { year: '2024', event: 'AI-powered trajectory analysis makes re-identification trivially easy' },
                { year: '2025', event: 'PrivTraj — Privacy-preserving trajectory analytics for the modern era' },
              ].map((item, i) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4 items-start"
                >
                  <div className="w-14 shrink-0 text-right">
                    <span className="font-mono font-bold text-primary">{item.year}</span>
                  </div>
                  <div className="w-px h-full bg-border" />
                  <p className="text-sm text-muted-foreground pb-4">{item.event}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section className="py-24 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center max-w-3xl mx-auto mb-16">
            <motion.p variants={fadeUp} custom={0} className="text-primary font-mono text-sm mb-4 uppercase tracking-widest">Technology Stack</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-black mb-6">
              Built with <span className="gradient-text">Modern Technologies</span>
            </motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'React', desc: 'UI Framework' },
              { name: 'TypeScript', desc: 'Type Safety' },
              { name: 'Tailwind CSS', desc: 'Styling' },
              { name: 'Leaflet', desc: 'Maps' },
              { name: 'Recharts', desc: 'Charts' },
              { name: 'PostgreSQL', desc: 'Database' },
              { name: 'Vite', desc: 'Build Tool' },
              { name: 'Framer Motion', desc: 'Animations' },
              { name: 'Shadcn/UI', desc: 'Components' },
              { name: 'REST API', desc: 'Backend' },
              { name: 'PySpark', desc: 'Processing' },
              { name: 'Docker', desc: 'Deployment' },
            ].map((tech, i) => (
              <motion.div key={tech.name} variants={fadeUp} custom={i}>
                <div className="glass-card rounded-xl p-4 text-center border border-border hover:glow-border transition-all duration-300">
                  <p className="text-sm font-bold font-mono">{tech.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{tech.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── About / Author ── */}
      <section id="about" className="py-24 border-t border-border grid-bg">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} custom={0}>
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 glow-border">
                <GraduationCap className="w-10 h-10 text-primary" />
              </div>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-black mb-4">
              Venkata Sreeram
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-primary font-mono text-sm mb-6 uppercase tracking-widest">
              MTech Student • Sri Mittapalli College of Engineering
            </motion.p>
            <motion.p variants={fadeUp} custom={3} className="text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
              This project is developed as part of my MTech research work, focusing on the intersection of
              big data analytics and privacy-preserving technologies. PrivTraj demonstrates how modern
              privacy algorithms can be applied to real-world trajectory data while maintaining analytical
              utility for urban planning, healthcare, and transportation applications.
            </motion.p>
            <motion.div variants={fadeUp} custom={4} className="flex flex-wrap justify-center gap-3">
              {['Privacy Engineering', 'Big Data Analytics', 'Machine Learning', 'Data Security', 'Spatial Computing'].map((tag) => (
                <Badge key={tag} variant="outline" className="border-primary/30 text-primary font-mono text-xs">{tag}</Badge>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 border-t border-border">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-5xl font-black mb-6">
              Ready to Explore <span className="gradient-text">PrivTraj</span>?
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              Upload your trajectory data, configure privacy parameters, and see the anonymization in action.
            </motion.p>
            <motion.div variants={fadeUp} custom={2}>
              <Button onClick={() => navigate('/app')} size="lg" className="gap-2 text-base px-8">
                Launch PrivTraj Platform <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="font-bold gradient-text text-sm">PrivTraj</span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            © 2025 Venkata Sreeram • MTech Research Project • Sri Mittapalli College of Engineering
          </p>
          <p className="text-xs text-muted-foreground font-mono">v1.0.0</p>
        </div>
      </footer>
    </div>
  );
}
