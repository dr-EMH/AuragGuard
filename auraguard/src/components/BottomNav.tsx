import { Home, Navigation, Users, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'transit', icon: Navigation, label: 'Transit' },
    { id: 'contacts', icon: Users, label: 'Contacts' },
    { id: 'safety', icon: Shield, label: 'Safety' },
  ];

  return (
    <nav className="w-full border-t border-brand-border bg-[#111] pb-safe">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-full h-full transition-all relative",
                isActive ? "text-brand-primary" : "text-brand-text-dim opacity-50 hover:opacity-100"
              )}
            >
              <div className={cn(
                "w-5 h-5 border-2 rounded-[4px] flex items-center justify-center transition-all",
                isActive ? "border-brand-primary" : "border-brand-text-dim"
              )}>
                <Icon className="w-3 h-3" />
              </div>
              <span className="text-[8px] font-bold uppercase tracking-widest mt-1">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
