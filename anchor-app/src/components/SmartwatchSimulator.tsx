import React, { useState, useEffect } from 'react';
import { Activity, Heart, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fireCrisisEvent } from '../brain';

export function SmartwatchSimulator() {
  const [bpm, setBpm] = useState(72);
  const [targetBpm, setTargetBpm] = useState(72);
  const [state, setState] = useState<'Resting' | 'Elevated' | 'Panic'>('Resting');
  
  // Smoothly animate BPM toward target
  useEffect(() => {
    if (bpm === targetBpm) return;
    
    const interval = setInterval(() => {
      setBpm(current => {
        if (current < targetBpm) return current + 1;
        if (current > targetBpm) return current - 1;
        return current;
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, [bpm, targetBpm]);

  // Monitor for Panic Attack trigger
  useEffect(() => {
    let panicTimer: ReturnType<typeof setTimeout>;
    
    if (bpm > 120) {
      panicTimer = setTimeout(() => {
        console.warn('Smartwatch Simulator: Sustained high heart rate detected! Triggering crisis...');
        fireCrisisEvent('manual');
      }, 3000); // Trigger after 3 seconds of high BPM
    }
    
    return () => clearTimeout(panicTimer);
  }, [bpm]);

  const simulateResting = () => {
    setState('Resting');
    setTargetBpm(72);
  };

  const simulateElevated = () => {
    setState('Elevated');
    setTargetBpm(95);
  };

  const simulatePanic = () => {
    setState('Panic');
    setTargetBpm(145);
  };

  return (
    <Card className="border-primary/20 shadow-sm relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-1.5 h-full transition-colors duration-1000 ${
        bpm > 120 ? 'bg-destructive' : bpm > 90 ? 'bg-amber-500' : 'bg-primary'
      }`} />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Smartwatch Simulator
          </CardTitle>
          <Badge variant="outline" className={`transition-colors duration-1000 ${
            bpm > 120 ? 'border-destructive text-destructive' : 
            bpm > 90 ? 'border-amber-500 text-amber-500' : 'border-primary text-primary'
          }`}>
            {state}
          </Badge>
        </div>
        <CardDescription>
          Hardware disconnected. Simulating vitals for demo.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center py-4 bg-muted/30 rounded-lg border">
          <div className="flex items-baseline gap-2">
            <Heart className={`w-8 h-8 transition-colors duration-1000 ${
              bpm > 120 ? 'text-destructive animate-pulse' : 
              bpm > 90 ? 'text-amber-500 animate-pulse' : 'text-primary'
            }`} />
            <span className="text-5xl font-bold font-mono tracking-tighter">
              {bpm}
            </span>
            <span className="text-muted-foreground font-semibold">BPM</span>
          </div>
        </div>
        
        {bpm > 120 && (
          <div className="flex items-center gap-2 text-sm text-destructive font-medium bg-destructive/10 p-2 rounded-md">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            Sustained high heart rate detected! Escalating...
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          <Button 
            variant={state === 'Resting' ? 'default' : 'outline'} 
            size="sm" 
            onClick={simulateResting}
          >
            Resting
          </Button>
          <Button 
            variant={state === 'Elevated' ? 'default' : 'outline'} 
            size="sm" 
            onClick={simulateElevated}
          >
            Elevated
          </Button>
          <Button 
            variant={state === 'Panic' ? 'destructive' : 'outline'} 
            size="sm" 
            onClick={simulatePanic}
          >
            Panic
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
