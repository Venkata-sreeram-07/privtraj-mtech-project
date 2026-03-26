import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Upload, Map, BarChart3, Lock, Database, Cpu, Eye, EyeOff,
  ArrowRight, ChevronRight, Globe, Zap, TrendingUp, Users, FileText,
  Layers, GitBranch, Server, Code2, BookOpen, GraduationCap, CheckCircle, XCircle, Minus, MapPin,
  Rocket, Lightbulb, Brain, Satellite, MessageSquare, Phone, Mail, User,
  Play, Settings, Download, CheckCheck, CloudUpload, SlidersHorizontal, BarChart, MapPinned,
  FileOutput, Activity, Fingerprint, Filter, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import {
  generateSampleTrajectory, applyLDiversity, applyDifferentialPrivacy,
  TrajectoryPoint, LOCATION_SENSITIVITY
} from '@/lib/trajectoryUtils';

import heroImg from '@/assets/hero-trajectory.jpg';
import dpImg from '@/assets/differential-privacy.jpg';
import ldImg from '@/assets/l-diversity.jpg';
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

// Particle system
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = [];
    const PARTICLE_COUNT = 80;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.offsetWidth;
        if (p.x > canvas.offsetWidth) p.x = 0;
        if (p.y < 0) p.y = canvas.offsetHeight;
        if (p.y > canvas.offsetHeight) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(185, 72%, 48%, ${p.opacity})`;
        ctx.fill();
      }
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `hsla(185, 72%, 48%, ${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

const comparisonFeatures = [
  { feature: 'l-Diversity Support', privtraj: true, arx: true, opendp: false, google: false },
  { feature: 'Differential Privacy', privtraj: true, arx: true, opendp: true, google: true },
  { feature: 'Trajectory / GPS Focus', privtraj: true, arx: false, opendp: false, google: false },
  { feature: 'Interactive Map Visualization', privtraj: true, arx: false, opendp: false, google: false },
  { feature: 'Location Sensitivity Scoring', privtraj: true, arx: false, opendp: false, google: false },
  { feature: 'Web-Based UI', privtraj: true, arx: true, opendp: false, google: false },
  { feature: 'Real-Time Processing', privtraj: true, arx: false, opendp: true, google: true },
  { feature: 'Before/After Comparison', privtraj: true, arx: 'partial', opendp: false, google: false },
  { feature: 'Privacy Risk Dashboard', privtraj: true, arx: false, opendp: false, google: false },
  { feature: 'CSV Upload & Parse', privtraj: true, arx: true, opendp: false, google: false },
  { feature: 'Open Source', privtraj: true, arx: true, opendp: true, google: true },
  { feature: 'No Setup Required', privtraj: true, arx: false, opendp: false, google: false },
];

const FeatureIcon = ({ val }: { val: boolean | string }) => {
  if (val === true) return <CheckCircle className="w-4 h-4 text-accent mx-auto" />;
  if (val === 'partial') return <Minus className="w-4 h-4 text-warning mx-auto" />;
  return <XCircle className="w-4 h-4 text-muted-foreground/40 mx-auto" />;
};

// Live Demo Component
function LiveDemo() {
  const [demoState, setDemoState] = useState<'idle' | 'processing' | 'done'>('idle');
  const [original, setOriginal] = useState<TrajectoryPoint[]>([]);
  const [anonymized, setAnonymized] = useState<TrajectoryPoint[]>([]);

  const runDemo = () => {
    setDemoState('processing');
    const sample = generateSampleTrajectory(50);
    setOriginal(sample);
    setTimeout(() => {
      let result = applyLDiversity(sample, 3);
      result = applyDifferentialPrivacy(result, 1.0, 1.0, 'laplace');
      setAnonymized(result);
      setDemoState('done');
    }, 1200);
  };

  return (
    <div className="glass-card rounded-2xl p-6 md:p-8">
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold mb-2">Try It Right Here</h3>
        <p className="text-sm text-muted-foreground">Click to generate 50 sample GPS points and see instant anonymization</p>
      </div>

      {demoState === 'idle' && (
        <div className="text-center">
          <Button onClick={runDemo} size="lg" className="gap-2 glow-border">
            <Play className="w-4 h-4" /> Run Live Demo
          </Button>
        </div>
      )}

      {demoState === 'processing' && (
        <div className="text-center py-8">
          <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Applying l-Diversity + Differential Privacy...</p>
        </div>
      )}

      {demoState === 'done' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center mb-4">
            <div className="bg-muted/30 rounded-lg p-3 border border-border">
              <p className="text-xl font-bold font-mono text-primary">{original.length}</p>
              <p className="text-[10px] text-muted-foreground">Original Points</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 border border-border">
              <p className="text-xl font-bold font-mono text-accent">{anonymized.length}</p>
              <p className="text-[10px] text-muted-foreground">Anonymized</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 border border-border">
              <p className="text-xl font-bold font-mono text-warning">{Math.round((1 - anonymized.length / original.length) * 100)}%</p>
              <p className="text-[10px] text-muted-foreground">Suppressed</p>
            </div>
          </div>
          <div className="overflow-x-auto max-h-[200px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px]">#</TableHead>
                  <TableHead className="text-[10px] text-primary">Orig. Lat</TableHead>
                  <TableHead className="text-[10px] text-primary">Orig. Lng</TableHead>
                  <TableHead className="text-[10px] text-accent">Anon. Lat</TableHead>
                  <TableHead className="text-[10px] text-accent">Anon. Lng</TableHead>
                  <TableHead className="text-[10px]">Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {original.slice(0, 8).map((p, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs font-mono text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="text-xs font-mono">{p.lat.toFixed(5)}</TableCell>
                    <TableCell className="text-xs font-mono">{p.lng.toFixed(5)}</TableCell>
                    <TableCell className="text-xs font-mono text-accent">{anonymized[i]?.lat.toFixed(5) ?? '—'}</TableCell>
                    <TableCell className="text-xs font-mono text-accent">{anonymized[i]?.lng.toFixed(5) ?? '—'}</TableCell>
                    <TableCell className="text-xs capitalize">{p.locationType ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="text-center">
            <Button variant="outline" size="sm" onClick={runDemo} className="gap-2 text-xs">
              <Play className="w-3 h-3" /> Run Again
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Feedback Form
function FeedbackForm() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', comment: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.comment) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-2xl p-8 md:p-12 text-center max-w-lg mx-auto glow-border"
      >
        <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
          <CheckCheck className="w-8 h-8 text-accent" />
        </div>
        <h3 className="text-2xl font-bold mb-3">Thank You for Your Inputs!</h3>
        <p className="text-muted-foreground leading-relaxed mb-4">
          All suggestions are recorded and intimated to our admin <strong className="text-foreground">SreeRam</strong>.
          We will contact you if needed for further discussion.
        </p>
        <Badge variant="outline" className="border-accent/30 text-accent font-mono text-xs">
          Response ID: #{Math.random().toString(36).substring(2, 8).toUpperCase()}
        </Badge>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 md:p-8 max-w-lg mx-auto space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Full Name *</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Your name" className="pl-9" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Phone</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Phone number" className="pl-9" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </div>
        </div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Email *</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input type="email" placeholder="your@email.com" className="pl-9" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
        </div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Your Idea / Comment *</label>
        <Textarea placeholder="Share your improvement ideas..." rows={4} value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))} required />
      </div>
      <Button type="submit" className="w-full gap-2">
        <MessageSquare className="w-4 h-4" /> Send Your Ideas
      </Button>
    </form>
  );
}

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
            {['Features', 'Algorithms', 'Architecture', 'Demo', 'How to Use', 'Comparison', 'Use Cases', 'Future', 'About'].map((item) => (
              <button
                key={item}
                onClick={() => scrollTo(item.toLowerCase().replace(/ /g, '-'))}
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

      {/* ── Hero with Particles ── */}
      <section className="relative pt-16 min-h-screen flex items-center">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Trajectory data visualization" className="w-full h-full object-cover opacity-20" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
        </div>
        <ParticleField />
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
              algorithms — with location-type sensitivity scoring for hospitals, homes, and more.
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
                <button onClick={() => setShowOriginal(!showOriginal)} className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors">
                  {showOriginal ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  {showOriginal ? 'Original' : 'Anonymized'}
                </button>
              </div>
              <div className="h-64 rounded-lg bg-muted/30 border border-border overflow-hidden relative">
                <svg viewBox="0 0 400 250" className="w-full h-full">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <line key={`g${i}`} x1={i * 40} y1={0} x2={i * 40} y2={250} stroke="hsl(220,16%,18%)" strokeWidth={0.5} />
                  ))}
                  {Array.from({ length: 7 }).map((_, i) => (
                    <line key={`h${i}`} x1={0} y1={i * 40} x2={400} y2={i * 40} stroke="hsl(220,16%,18%)" strokeWidth={0.5} />
                  ))}
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
                  {(showOriginal
                    ? [[30,200],[80,170],[120,150],[160,135],[200,120],[240,100],[280,80],[330,60],[370,50]]
                    : [[35,195],[85,175],[115,145],[165,140],[195,115],[245,105],[275,75],[325,65],[375,45]]
                  ).map(([cx, cy], i) => (
                    <motion.circle key={i} cx={cx} cy={cy} r={3} fill={showOriginal ? 'hsl(185,72%,48%)' : 'hsl(165,60%,45%)'} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 + 0.5 }} />
                  ))}
                  {showOriginal && (
                    <>
                      <text x={30} y={218} fill="hsl(0,72%,55%)" fontSize={8} fontFamily="monospace">🏥</text>
                      <text x={120} y={168} fill="hsl(38,92%,55%)" fontSize={8} fontFamily="monospace">🏠</text>
                      <text x={200} y={138} fill="hsl(165,60%,45%)" fontSize={8} fontFamily="monospace">🏢</text>
                      <text x={280} y={98} fill="hsl(165,60%,45%)" fontSize={8} fontFamily="monospace">🛒</text>
                    </>
                  )}
                </svg>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: 'Points', value: '750+' },
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
              Without proper anonymization, this data can reveal sensitive personal information.
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
              { icon: Upload, title: 'CSV Data Upload', desc: 'Upload GPS trajectory datasets with latitude, longitude, timestamp, user_id, and location_type columns.' },
              { icon: Shield, title: 'l-Diversity Anonymization', desc: 'Spatial cell generalization ensuring each grid cell contains at least l distinct user identities.' },
              { icon: Lock, title: 'Differential Privacy', desc: 'Laplace and Gaussian noise injection with configurable epsilon (ε) and sensitivity parameters.' },
              { icon: MapPin, title: 'Location Sensitivity', desc: 'Automatic risk scoring — hospitals and homes get more noise than offices and parks.' },
              { icon: Map, title: 'Interactive Map View', desc: 'Leaflet-powered map comparing original vs. anonymized trajectories with dark-themed tiles.' },
              { icon: BarChart3, title: 'Privacy Metrics Dashboard', desc: 'Real-time charts showing privacy level, data utility, re-identification risk, and displacement.' },
              { icon: FileText, title: 'CSV & Report Export', desc: 'Download anonymized datasets and JSON privacy reports for further analysis.' },
              { icon: Eye, title: 'Before/After Comparison', desc: 'Side-by-side visualization and detailed comparison tables of original vs anonymized data.' },
              { icon: Clock, title: 'Temporal Rounding', desc: 'Round timestamps to configurable intervals to reduce temporal precision and linkability.' },
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
              </p>
              <div className="space-y-4">
                {[
                  { step: '01', title: 'Spatial Gridding', desc: 'Divide geographic space into uniform grid cells based on configurable resolution.' },
                  { step: '02', title: 'Diversity Check', desc: 'Verify each cell contains at least l unique user identities.' },
                  { step: '03', title: 'Generalization', desc: 'Points in qualifying cells are generalized to the cell centroid with controlled offset.' },
                  { step: '04', title: 'Suppression', desc: 'Cells failing the l-diversity threshold are suppressed to prevent disclosure.' },
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
                <img src={ldImg} alt="l-Diversity concept" loading="lazy" width={800} height={600} className="w-full h-64 object-cover" />
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
                the inclusion or exclusion of any single trajectory point does not significantly affect the output.
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
                <img src={dpImg} alt="Differential privacy" loading="lazy" width={800} height={600} className="w-full h-72 object-cover" />
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

      {/* ── Architecture (Redesigned with expressive pipeline) ── */}
      <section id="architecture" className="py-24 border-t border-border grid-bg">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center max-w-3xl mx-auto mb-16">
            <motion.p variants={fadeUp} custom={0} className="text-primary font-mono text-sm mb-4 uppercase tracking-widest">System Design</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-black mb-6">
              <span className="gradient-text">Architecture</span> & Data Flow
            </motion.h2>
          </motion.div>

          {/* 3-Layer Architecture */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-12">
            <div className="glass-card rounded-2xl p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    badge: 'Presentation Layer', badgeColor: 'bg-primary/10 text-primary border-primary/30',
                    items: [
                      { icon: Code2, label: 'React + TypeScript', sub: 'Component Architecture' },
                      { icon: Map, label: 'Leaflet Maps', sub: 'Trajectory Visualization' },
                      { icon: BarChart3, label: 'Recharts', sub: 'Analytics & Metrics' },
                      { icon: SlidersHorizontal, label: 'Interactive Controls', sub: 'Real-time Configuration' },
                    ],
                    borderColor: 'border-primary/20',
                  },
                  {
                    badge: 'Processing Engine', badgeColor: 'bg-accent/10 text-accent border-accent/30',
                    items: [
                      { icon: Shield, label: 'l-Diversity Engine', sub: 'Spatial Generalization' },
                      { icon: Lock, label: 'ε-DP Noise Injector', sub: 'Laplace / Gaussian' },
                      { icon: Fingerprint, label: 'Sensitivity Scorer', sub: 'Location Risk Analysis' },
                      { icon: Clock, label: 'Temporal Rounder', sub: 'Timestamp Generalization' },
                    ],
                    borderColor: 'border-accent/20',
                  },
                  {
                    badge: 'Data & Output Layer', badgeColor: 'bg-warning/10 text-warning border-warning/30',
                    items: [
                      { icon: Database, label: 'PostgreSQL', sub: 'Persistent Storage' },
                      { icon: FileText, label: 'CSV Parser', sub: 'Multi-format Ingestion' },
                      { icon: Activity, label: 'Metrics Engine', sub: '15+ KPI Calculations' },
                      { icon: FileOutput, label: 'Report Generator', sub: 'CSV & JSON Export' },
                    ],
                    borderColor: 'border-warning/20',
                  },
                ].map((layer) => (
                  <div key={layer.badge} className="space-y-4">
                    <div className="text-center">
                      <Badge className={`${layer.badgeColor} font-mono text-xs`}>{layer.badge}</Badge>
                    </div>
                    {layer.items.map(item => (
                      <div key={item.label} className={`bg-muted/30 rounded-xl p-4 border ${layer.borderColor} flex items-center gap-3 hover:bg-muted/50 transition-colors`}>
                        <div className={`w-10 h-10 rounded-lg ${layer.borderColor.replace('border', 'bg').replace('/20', '/10')} flex items-center justify-center shrink-0`}>
                          <item.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold">{item.label}</p>
                          <p className="text-[10px] text-muted-foreground">{item.sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Expressive Data Flow Pipeline */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <Card className="glass-card border-border overflow-hidden">
              <CardHeader className="border-b border-border bg-muted/20">
                <CardTitle className="text-lg flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-primary" />
                  Data Processing Pipeline
                </CardTitle>
                <CardDescription>End-to-end flow from raw GPS data to privacy-preserving output</CardDescription>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  {[
                    { label: 'Upload CSV', sub: 'Raw GPS Data', icon: CloudUpload, color: 'from-primary/20 to-primary/5', iconColor: 'text-primary', borderColor: 'border-primary/30' },
                    { label: 'Parse & Validate', sub: 'Schema Check', icon: Filter, color: 'from-primary/20 to-primary/5', iconColor: 'text-primary', borderColor: 'border-primary/30' },
                    { label: 'Sensitivity Score', sub: 'Location Risk', icon: Fingerprint, color: 'from-warning/20 to-warning/5', iconColor: 'text-warning', borderColor: 'border-warning/30' },
                    { label: 'l-Diversity', sub: 'Spatial Anon.', icon: Layers, color: 'from-accent/20 to-accent/5', iconColor: 'text-accent', borderColor: 'border-accent/30' },
                    { label: 'ε-DP Noise', sub: 'Noise Injection', icon: Lock, color: 'from-accent/20 to-accent/5', iconColor: 'text-accent', borderColor: 'border-accent/30' },
                    { label: 'Risk Analysis', sub: 'Re-ID Scoring', icon: Shield, color: 'from-destructive/20 to-destructive/5', iconColor: 'text-destructive', borderColor: 'border-destructive/30' },
                    { label: 'Visualize', sub: 'Maps & Charts', icon: MapPinned, color: 'from-primary/20 to-primary/5', iconColor: 'text-primary', borderColor: 'border-primary/30' },
                  ].map((step, i, arr) => (
                    <div key={step.label} className="relative">
                      <div className={`bg-gradient-to-b ${step.color} rounded-xl p-4 border ${step.borderColor} text-center h-full flex flex-col items-center justify-center gap-2`}>
                        <div className={`w-12 h-12 rounded-xl bg-background/60 border ${step.borderColor} flex items-center justify-center`}>
                          <step.icon className={`w-6 h-6 ${step.iconColor}`} />
                        </div>
                        <p className="text-xs font-bold">{step.label}</p>
                        <p className="text-[10px] text-muted-foreground">{step.sub}</p>
                        <Badge variant="outline" className="text-[9px] font-mono">{`Step ${i + 1}`}</Badge>
                      </div>
                      {i < arr.length - 1 && (
                        <ChevronRight className="w-4 h-4 text-muted-foreground absolute -right-3 top-1/2 -translate-y-1/2 hidden lg:block" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* ── Live Demo ── */}
      <section id="demo" className="py-24 border-t border-border">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center max-w-3xl mx-auto mb-12">
            <motion.p variants={fadeUp} custom={0} className="text-primary font-mono text-sm mb-4 uppercase tracking-widest">Interactive Demo</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-black mb-6">
              Try <span className="gradient-text">PrivTraj</span> Right Now
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-lg">
              No sign-up needed. Generate sample data and see anonymization in action instantly.
            </motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <LiveDemo />
          </motion.div>
        </div>
      </section>

      {/* ── How to Use ── */}
      <section id="how-to-use" className="py-24 border-t border-border grid-bg">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center max-w-3xl mx-auto mb-16">
            <motion.p variants={fadeUp} custom={0} className="text-primary font-mono text-sm mb-4 uppercase tracking-widest">Step-by-Step Guide</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-black mb-6">
              How to Use <span className="gradient-text">PrivTraj</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-lg">
              Follow these simple steps to anonymize your trajectory data
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                step: 1, icon: CloudUpload, title: 'Upload Your Data',
                desc: 'Prepare a CSV file with columns: latitude, longitude, timestamp, user_id, and location_type. Upload it or load sample data with 750+ records.',
                detail: 'Supported location types: hospital, home, office, school, shopping, restaurant, gym, park, bank, government.'
              },
              {
                step: 2, icon: SlidersHorizontal, title: 'Configure Privacy Settings',
                desc: 'Set the l-diversity value (2–10), epsilon for differential privacy (0.1–10), choose Laplace or Gaussian noise, and adjust grid resolution.',
                detail: 'Higher l-value = more privacy. Lower epsilon = more noise added. You can also configure temporal rounding.'
              },
              {
                step: 3, icon: Play, title: 'Run Processing',
                desc: 'Click "Apply Privacy Algorithms" to run l-diversity anonymization followed by differential privacy noise injection.',
                detail: 'Processing happens client-side. Sensitive locations automatically receive amplified noise based on sensitivity scores.'
              },
              {
                step: 4, icon: MapPinned, title: 'View Map Comparison',
                desc: 'Explore the interactive Leaflet map showing original trajectories (cyan) vs anonymized trajectories (green) side by side.',
                detail: 'Toggle layers, zoom in/out, and visually assess the spatial displacement applied by the algorithms.'
              },
              {
                step: 5, icon: BarChart, title: 'Analyze Results',
                desc: 'Review 15+ privacy and utility metrics including privacy level, re-identification risk, entropy loss, cluster preservation, and more.',
                detail: 'The radar chart and progress bars give you a holistic privacy profile of your anonymized dataset.'
              },
              {
                step: 6, icon: Download, title: 'Export Results',
                desc: 'Download the anonymized CSV, original data, or a comprehensive JSON privacy report for your documentation.',
                detail: 'Reports include all metrics, configuration parameters, location-type distributions, and risk analysis.'
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="glass-card border-border h-full hover:glow-border transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <item.icon className="w-6 h-6 text-primary" />
                      </div>
                      <Badge variant="outline" className="border-primary/30 text-primary font-mono text-xs">
                        Step {item.step}
                      </Badge>
                    </div>
                    <CardTitle className="text-base">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    <p className="text-xs text-muted-foreground/70 italic">{item.detail}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison Table ── */}
      <section id="comparison" className="py-24 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center max-w-3xl mx-auto mb-16">
            <motion.p variants={fadeUp} custom={0} className="text-primary font-mono text-sm mb-4 uppercase tracking-widest">Tool Comparison</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-black mb-6">
              <span className="gradient-text">PrivTraj</span> vs Other Tools
            </motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-xs font-semibold min-w-[200px]">Feature</TableHead>
                      <TableHead className="text-xs text-center font-bold text-primary min-w-[100px]">
                        <div className="flex items-center justify-center gap-1.5">
                          <Shield className="w-3.5 h-3.5" /> PrivTraj
                        </div>
                      </TableHead>
                      <TableHead className="text-xs text-center min-w-[100px]">ARX</TableHead>
                      <TableHead className="text-xs text-center min-w-[100px]">OpenDP</TableHead>
                      <TableHead className="text-xs text-center min-w-[100px]">Google DP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comparisonFeatures.map((row) => (
                      <TableRow key={row.feature} className="border-border/50">
                        <TableCell className="text-xs font-medium">{row.feature}</TableCell>
                        <TableCell className="text-center bg-primary/5"><FeatureIcon val={row.privtraj} /></TableCell>
                        <TableCell className="text-center"><FeatureIcon val={row.arx} /></TableCell>
                        <TableCell className="text-center"><FeatureIcon val={row.opendp} /></TableCell>
                        <TableCell className="text-center"><FeatureIcon val={row.google} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="p-4 border-t border-border bg-muted/20">
                <p className="text-[10px] text-muted-foreground text-center">
                  Comparison based on publicly available documentation. PrivTraj is specifically designed for trajectory/GPS data privacy.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Use Cases Carousel ── */}
      <section id="use-cases" className="py-24 border-t border-border grid-bg">
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
                  { img: smartcityImg, title: 'Smart City Planning', desc: 'Urban planners can analyze traffic patterns and pedestrian flows without compromising individual privacy.', stats: ['Traffic Optimization', 'Urban Mobility', 'Public Transit'] },
                  { img: healthcareImg, title: 'Healthcare & Epidemiology', desc: 'Track disease spread patterns and patient movement while maintaining HIPAA compliance.', stats: ['Contact Tracing', 'HIPAA Compliance', 'Epidemic Analysis'] },
                  { img: transportImg, title: 'Transportation & Logistics', desc: 'Ride-sharing and delivery companies can share anonymized route data for research.', stats: ['Route Planning', 'Fleet Analytics', 'Demand Prediction'] },
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

      {/* ── Why Now ── */}
      <section className="py-24 border-t border-border">
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
                  location data has become one of the most sensitive types of personal information.
                  Regulations like <strong className="text-foreground">GDPR</strong>, <strong className="text-foreground">CCPA</strong>,
                  and <strong className="text-foreground">India's DPDP Act 2023</strong> now mandate strict protections.
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
                <motion.div key={item.year} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex gap-4 items-start">
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

      {/* ── Future Implementations ── */}
      <section id="future" className="py-24 border-t border-border grid-bg">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center max-w-3xl mx-auto mb-16">
            <motion.p variants={fadeUp} custom={0} className="text-primary font-mono text-sm mb-4 uppercase tracking-widest">Roadmap</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-black mb-6">
              <span className="gradient-text">Future</span> Implementations
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-lg">
              Exciting directions for PrivTraj — advancing privacy-preserving analytics for the next generation
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {[
              {
                icon: Brain, title: 'Federated Learning Integration',
                desc: 'Train ML models on distributed trajectory data without centralizing it — combining differential privacy with federated optimization.',
                badge: 'AI/ML'
              },
              {
                icon: Satellite, title: 'Real-Time Stream Processing',
                desc: 'Process live GPS streams from IoT devices with sub-second anonymization using Apache Kafka and Flink integration.',
                badge: 'Streaming'
              },
              {
                icon: Layers, title: 'Multi-Dimensional Privacy',
                desc: 'Extend privacy guarantees to speed, heading, and altitude dimensions — not just lat/lng coordinates.',
                badge: 'Research'
              },
              {
                icon: Globe, title: 'Geo-Fencing Privacy Zones',
                desc: 'Define custom privacy zones on the map where maximum anonymization is automatically applied (e.g., near schools, hospitals).',
                badge: 'UX'
              },
              {
                icon: Server, title: 'Blockchain Audit Trail',
                desc: 'Immutable logging of all anonymization operations on a blockchain for compliance verification and audit transparency.',
                badge: 'Compliance'
              },
              {
                icon: Rocket, title: 'API & SDK Release',
                desc: 'RESTful API and Python/JavaScript SDKs so developers can integrate trajectory privacy into their own applications.',
                badge: 'Developer'
              },
            ].map((item, i) => (
              <motion.div key={item.title} variants={fadeUp} custom={i}>
                <Card className="glass-card border-border h-full hover:glow-border transition-all duration-300 group">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <item.icon className="w-6 h-6 text-primary" />
                      </div>
                      <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">{item.badge}</Badge>
                    </div>
                    <CardTitle className="text-base">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed">{item.desc}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Feedback Form */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-8">
            <motion.h3 variants={fadeUp} custom={0} className="text-2xl font-bold mb-2">
              Have an Idea? <span className="gradient-text">Share It!</span>
            </motion.h3>
            <motion.p variants={fadeUp} custom={1} className="text-muted-foreground text-sm mb-8">
              Help us shape the future of PrivTraj — your suggestions go directly to our team
            </motion.p>
          </motion.div>
          <FeedbackForm />
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

      {/* ── About ── */}
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
