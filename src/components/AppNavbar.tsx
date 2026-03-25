import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AppNavbar() {
  const navigate = useNavigate();

  return (
    <header className="h-12 border-b border-border bg-card/80 backdrop-blur-xl flex items-center justify-between px-4 shrink-0 z-50">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs hidden sm:inline">Back to Website</span>
        </button>
        <div className="w-px h-5 bg-border" />
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
            <Shield className="w-3 h-3 text-primary" />
          </div>
          <span className="text-sm font-bold gradient-text">PrivTraj</span>
          <span className="text-[10px] text-muted-foreground font-mono hidden md:inline">Dashboard</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="text-xs gap-1.5 h-7" onClick={() => navigate('/')}>
          <ExternalLink className="w-3 h-3" />
          <span className="hidden sm:inline">Main Website</span>
        </Button>
      </div>
    </header>
  );
}
