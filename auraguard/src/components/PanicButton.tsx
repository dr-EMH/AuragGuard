import { motion } from 'motion/react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PanicButtonProps {
  onPanic: () => void;
  className?: string;
}

export function PanicButton({ onPanic, className }: PanicButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onPanic}
      className={cn(
        "w-24 h-24 rounded-full bg-brand-danger text-white flex items-center justify-center font-bold text-sm panic-button-glow",
        className
      )}
    >
      PANIC
    </motion.button>
  );
}
