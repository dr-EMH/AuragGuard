import { Badge } from '@/components/ui/badge';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'secure' | 'monitoring' | 'alert';
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const configs = {
    secure: {
      label: 'Secure',
      icon: ShieldCheck,
      color: 'bg-brand-primary/10 text-brand-primary border-brand-primary/20',
    },
    monitoring: {
      label: 'Monitoring',
      icon: Shield,
      color: 'bg-brand-secondary/10 text-brand-secondary border-brand-secondary/20',
    },
    alert: {
      label: 'Alert',
      icon: ShieldAlert,
      color: 'bg-brand-danger/10 text-brand-danger border-brand-danger/20',
    },
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn("px-3 py-1.5 rounded-full gap-1.5 font-medium border", config.color, className)}>
      <Icon className={cn("w-3.5 h-3.5", status === 'monitoring' && "animate-pulse")} />
      <span className="text-[10px] uppercase tracking-wider">{config.label}</span>
    </Badge>
  );
}
