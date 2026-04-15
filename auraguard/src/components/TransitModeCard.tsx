import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Navigation, StopCircle } from 'lucide-react';
import { useState } from 'react';

interface TransitModeCardProps {
  isActive: boolean;
  onStart: (destination: string) => void;
  onStop: () => void;
}

export function TransitModeCard({ isActive, onStart, onStop }: TransitModeCardProps) {
  const [destination, setDestination] = useState('');

  return (
    <Card className="glass-card border-none overflow-hidden rounded-3xl">
      <CardHeader className="bg-brand-primary/5 border-b border-brand-border">
        <CardTitle className="flex items-center gap-2 text-brand-primary text-sm uppercase tracking-widest">
          <Navigation className="w-4 h-4" />
          Transit Mode
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {!isActive ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="destination" className="text-xs text-brand-text-dim uppercase tracking-wider">Where are you going?</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-dim" />
                <Input
                  id="destination"
                  placeholder="Enter destination address"
                  className="pl-10 bg-white/5 border-brand-border h-12 rounded-xl"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>
            </div>
            <Button 
              className="w-full brand-gradient text-black font-bold h-12 rounded-xl"
              onClick={() => onStart(destination)}
              disabled={!destination}
            >
              Start Secure Journey
            </Button>
          </>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] text-brand-text-dim uppercase tracking-wider">Status</p>
                <p className="text-brand-primary font-bold text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                  Monitoring
                </p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-[10px] text-brand-text-dim uppercase tracking-wider">Destination</p>
                <p className="text-sm font-medium truncate max-w-[150px]">{destination}</p>
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-white/5 border border-brand-border space-y-2">
              <div className="flex justify-between text-[10px] uppercase tracking-wider">
                <span className="text-brand-text-dim">Route Stability</span>
                <span className="text-brand-primary">98%</span>
              </div>
              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-brand-primary w-[98%]" />
              </div>
            </div>

            <Button 
              variant="destructive" 
              className="w-full h-12 font-bold rounded-xl bg-brand-danger hover:bg-brand-danger/90"
              onClick={onStop}
            >
              <StopCircle className="w-5 h-5 mr-2" />
              End Journey
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
