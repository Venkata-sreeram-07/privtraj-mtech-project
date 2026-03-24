import { Shield, Upload, Map, BarChart3, Settings, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
  { id: 'upload', icon: Upload, label: 'Upload Data' },
  { id: 'privacy', icon: Shield, label: 'Privacy Config' },
  { id: 'map', icon: Map, label: 'Map View' },
  { id: 'results', icon: Database, label: 'Results' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export default function AppSidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="w-16 lg:w-56 shrink-0 border-r border-border bg-card flex flex-col">
      <div className="p-3 lg:p-4 border-b border-border flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
          <Shield className="w-4 h-4 text-primary" />
        </div>
        <span className="hidden lg:block text-sm font-bold tracking-tight gradient-text">PrivTraj</span>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all',
              activeTab === item.id
                ? 'bg-primary/10 text-primary glow-border'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            )}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span className="hidden lg:block">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-border">
        <div className="hidden lg:block text-xs text-muted-foreground">
          <p className="font-mono">v1.0.0</p>
          <p className="mt-1 text-[10px]">Privacy-Preserving Analytics</p>
        </div>
      </div>
    </aside>
  );
}
