import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ShieldAlert } from 'lucide-react';

interface CountdownOverlayProps {
  seconds: number;
  maxSeconds: number;
  onCancel: () => void;
}

export function CountdownOverlay({ seconds, maxSeconds, onCancel }: CountdownOverlayProps) {
  const progress = (seconds / maxSeconds) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-brand-bg/95 backdrop-blur-xl p-6"
      >
        <div className="w-full max-w-md flex flex-col items-center gap-8 text-center">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="w-24 h-24 rounded-full bg-brand-danger flex items-center justify-center"
          >
            <ShieldAlert className="w-12 h-12 text-white" />
          </motion.div>

          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-brand-danger">Emergency Alert Pending</h2>
            <p className="text-muted-foreground text-lg">
              Abnormal activity detected. Sending SOS in:
            </p>
            <div className="text-7xl font-mono font-bold text-white">
              {seconds}s
            </div>
          </div>

          <div className="w-full space-y-6">
            <Progress value={progress} className="h-3 bg-white/10" />
            
            <Button 
              size="lg" 
              variant="outline" 
              onClick={onCancel}
              className="w-full h-16 text-xl border-white/20 hover:bg-white/10"
            >
              I AM SAFE - CANCEL
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
