import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Sparkles } from 'lucide-react';

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

  const startExercise = () => { setCycles(0); setPhase('inhale'); };
  const stopExercise = () => { setPhase('idle'); setCycles(0); };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--cream)' }}>
      <header className="p-4 flex items-center">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-xs" style={{ color: '#728279' }}>
          <X size={16} /> Close
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 pb-32">
        <div className="text-center mb-12">
          <p className="eyebrow mb-3">A MOMENT FOR YOU</p>
          <h2 className="serif-heading text-[clamp(36px,5vw,56px)]">
            Reset with <em>breath.</em>
          </h2>
          <p className="mt-3 text-sm" style={{ color: '#86928a' }}>
            {phase === 'idle' 
              ? 'A proven technique to reduce anxiety and calm the nervous system.'
              : `Completed ${cycles} cycle${cycles !== 1 ? 's' : ''}`}
          </p>
        </div>

        <div className="relative w-64 h-64 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2" style={{ borderColor: '#d3e4d2' }} />
          
          {phase !== 'idle' && (
            <motion.div 
              animate={{
                scale: phase === 'inhale' ? 1.6 : phase === 'hold' ? 1.6 : 1,
              }}
              transition={{ duration: phase === 'inhale' ? 4 : phase === 'hold' ? 0.3 : 8, ease: 'easeInOut' }}
              className="absolute inset-4 rounded-full blur-sm"
              style={{ background: 'rgba(72,116,93,0.15)' }}
            />
          )}

          <div className="absolute z-10 w-32 h-32 rounded-full grid place-items-center shadow-lg transition-transform duration-1000" style={{ background: 'var(--green)' }}>
            <div className="text-center text-white">
              {phase === 'idle' && <Sparkles className="w-8 h-8 mx-auto" />}
              {phase === 'inhale' && <span className="text-lg font-bold">Inhale (4)</span>}
              {phase === 'hold' && <span className="text-lg font-bold">Hold (7)</span>}
              {phase === 'exhale' && <span className="text-lg font-bold">Exhale (8)</span>}
            </div>
          </div>
        </div>

        <div className="mt-16">
          {phase === 'idle' ? (
            <button onClick={startExercise} className="px-12 py-3.5 text-sm font-semibold text-white rounded-lg" style={{ background: 'var(--green)', boxShadow: '0 6px 12px #4d755b2b' }}>
              Start
            </button>
          ) : (
            <button onClick={stopExercise} className="px-12 py-3 text-sm border rounded-lg" style={{ color: '#728279', borderColor: 'var(--line)' }}>
              Stop
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
