import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wind } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Phase = 'inhale' | 'hold' | 'exhale' | 'idle';

export function Breathe() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('idle');
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    if (phase === 'idle') return;

    let timeout: ReturnType<typeof setTimeout>;

    if (phase === 'inhale') {
      if (navigator.vibrate) navigator.vibrate(50);
      timeout = setTimeout(() => setPhase('hold'), 4000);
    } else if (phase === 'hold') {
      if (navigator.vibrate) navigator.vibrate([20, 50, 20]);
      timeout = setTimeout(() => setPhase('exhale'), 7000);
    } else if (phase === 'exhale') {
      if (navigator.vibrate) navigator.vibrate(100);
      timeout = setTimeout(() => {
        setCycles(c => c + 1);
        setPhase('inhale');
      }, 8000);
    }

    return () => clearTimeout(timeout);
  }, [phase]);

  const startExercise = () => {
    setCycles(0);
    setPhase('inhale');
  };

  const stopExercise = () => {
    setPhase('idle');
    setCycles(0);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="p-4 flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <span className="ml-2 font-medium">4-7-8 Breathing</span>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 pb-32">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-semibold mb-2">Find your center</h2>
          <p className="text-muted-foreground">
            {phase === 'idle' 
              ? 'A proven technique to reduce anxiety and calm the nervous system.'
              : `Completed ${cycles} cycle${cycles !== 1 ? 's' : ''}`}
          </p>
        </div>

        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* Base circle */}
          <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
          
          {/* Animated breathing circle */}
          {phase !== 'idle' && (
            <div 
              className={`absolute inset-4 rounded-full bg-primary/20 blur-sm 
                ${phase === 'inhale' ? 'animate-breath-in' : 
                  phase === 'hold' ? 'animate-breath-hold' : 
                  'animate-breath-out'}`}
            />
          )}

          {/* Solid inner circle */}
          <div className="absolute z-10 w-32 h-32 rounded-full bg-primary flex items-center justify-center shadow-lg transition-transform duration-1000">
            <div className="text-primary-foreground text-center">
              {phase === 'idle' && <Wind className="w-8 h-8 mx-auto" />}
              {phase === 'inhale' && <span className="text-lg font-bold">Inhale (4)</span>}
              {phase === 'hold' && <span className="text-lg font-bold">Hold (7)</span>}
              {phase === 'exhale' && <span className="text-lg font-bold">Exhale (8)</span>}
            </div>
          </div>
        </div>

        <div className="mt-16">
          {phase === 'idle' ? (
            <Button size="lg" onClick={startExercise} className="w-48 rounded-full h-12 text-lg">
              Start
            </Button>
          ) : (
            <Button variant="outline" size="lg" onClick={stopExercise} className="w-48 rounded-full h-12">
              Stop
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
