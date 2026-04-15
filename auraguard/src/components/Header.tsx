import { Shield, Bell, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-brand-bg pt-6 pb-2">
      <div className="container flex flex-col items-center justify-center px-4 text-center">
        <div className="logo-text text-2xl font-bold tracking-[0.1em] text-brand-primary">
          AURAGUARD
        </div>
        <div className="text-[10px] text-brand-text-dim mt-1 uppercase tracking-widest">
          Smart security for your movement
        </div>
      </div>
    </header>
  );
}
