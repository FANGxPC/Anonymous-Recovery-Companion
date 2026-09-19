import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Phone, ArrowRight, X, Mic, MicOff, Wind, Focus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

function MiniBreathe() {
  const [phase, setPhase] = useState<'inhale' | 'exhale' | 'idle'>('idle');
  
  useEffect(() => {
    if (phase === 'idle') return;
    let timeout: ReturnType<typeof setTimeout>;
    if (phase === 'inhale') {
      if (navigator.vibrate) navigator.vibrate(50);
      timeout = setTimeout(() => setPhase('exhale'), 4000);
    } else {
      if (navigator.vibrate) navigator.vibrate(100);
      timeout = setTimeout(() => setPhase('inhale'), 6000);
    }
    return () => clearTimeout(timeout);
  }, [phase]);

  if (phase === 'idle') {
    return (
      <button onClick={() => setPhase('inhale')} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs rounded-lg border cursor-pointer" style={{ color: 'var(--green)', borderColor: 'var(--line)', background: 'var(--paper)' }}>
        <Wind size={16} /> Start Breathing Exercise
      </button>
    );
  }

  return (
    <div className="rounded-lg p-6 flex flex-col items-center justify-center relative overflow-hidden border" style={{ background: '#e5f0e2', borderColor: '#d3e4d2' }}>
      <motion.div
        animate={{ scale: phase === 'inhale' ? 1.5 : 1 }}
        transition={{ duration: phase === 'inhale' ? 4 : 6, ease: "easeInOut" }}
        className="absolute w-32 h-32 rounded-full blur-xl"
        style={{ background: 'rgba(72,116,93,0.15)' }}
      />
      <div className="z-10 text-center space-y-4">
        <div className="serif-heading text-2xl" style={{ color: 'var(--green)' }}>
          {phase === 'inhale' ? 'Inhale...' : 'Exhale...'}
        </div>
        <button onClick={() => setPhase('idle')} className="text-xs" style={{ color: '#8b978d' }}>Stop</button>
      </div>
    </div>
  );
}

function Grounding54321() {
  const steps = [
    { num: 5, text: "Things you can see", desc: "Look around you and name 5 things." },
    { num: 4, text: "Things you can feel", desc: "Pay attention to your body and name 4 things you can touch." },
    { num: 3, text: "Things you can hear", desc: "Listen carefully. Name 3 things you can hear." },
    { num: 2, text: "Things you can smell", desc: "Name 2 things you can smell, or 2 of your favorite smells." },
    { num: 1, text: "Thing you can taste", desc: "Name 1 thing you can taste right now, or a good thing about yourself." }
  ];
  const [step, setStep] = useState(-1);

  if (step === -1) {
    return (
      <button onClick={() => setStep(0)} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs rounded-lg border cursor-pointer" style={{ color: 'var(--green)', borderColor: 'var(--line)', background: 'var(--paper)' }}>
        <Focus size={16} /> Start 5-4-3-2-1 Grounding
      </button>
    );
  }
  if (step >= steps.length) {
    return (
      <div className="text-center p-4 rounded-lg" style={{ background: '#e5f0e2' }}>
        <p className="text-sm font-medium" style={{ color: 'var(--green)' }}>Grounding Complete</p>
        <button onClick={() => setStep(-1)} className="mt-2 text-xs underline" style={{ color: '#8b978d' }}>Restart</button>
      </div>
    );
  }

  return (
    <div className="rounded-lg p-4 border" style={{ background: '#e5f0e2', borderColor: '#d3e4d2' }}>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-full grid place-items-center text-white font-bold text-lg" style={{ background: 'var(--green)' }}>{steps[step].num}</div>
        <h4 className="font-semibold text-sm" style={{ color: 'var(--green)' }}>{steps[step].text}</h4>
      </div>
      <p className="text-xs pl-11 mb-4" style={{ color: '#6e8274' }}>{steps[step].desc}</p>
      <div className="flex justify-between pl-11">
        <button onClick={() => setStep(s => Math.max(-1, s - 1))} className="text-xs px-3 py-1" style={{ color: '#8b978d' }}>Back</button>
        <button onClick={() => setStep(s => s + 1)} className="text-xs px-4 py-1.5 rounded text-white" style={{ background: 'var(--green)' }}>{step === steps.length - 1 ? 'Finish' : 'Next'}</button>
      </div>
    </div>
  );
}

export function Crisis() {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const utterance = new SpeechSynthesisUtterance(
      "You are not alone. Help is available. Take a slow breath. Say 'call lifeline' to dial 9 8 8."
    );
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.onresult = (event: any) => {
        const lastResult = event.results[event.results.length - 1];
        const command = lastResult[0].transcript.toLowerCase().trim();
        if (command.includes('call') && (command.includes('988') || command.includes('lifeline') || command.includes('help'))) {
          window.location.href = 'tel:988';
        }
        if (command.includes('text')) {
          window.location.href = 'sms:988';
        }
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      try {
        recognition.start();
        setIsListening(true);
        recognitionRef.current = recognition;
      } catch (err) { console.error("Failed to start speech recognition:", err); }
    }
    return () => {
      window.speechSynthesis.cancel();
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const trustedContact = localStorage.getItem('anchor_trusted_contact');

  return (
    <div className="flex-1 flex flex-col items-center p-4 min-h-screen pb-24 overflow-y-auto pt-8" style={{ background: 'var(--cream)' }}>
      <div className="w-full max-w-[650px] space-y-6">

        {/* ─── Crisis Panel ─── */}
        <div className="text-center p-8 md:p-12 rounded-sm border" style={{ background: '#fff9f5', borderColor: '#f0d9ce' }}>
          <div className="w-[51px] h-[51px] grid place-items-center mx-auto mb-5 rounded-full text-2xl" style={{ color: '#c66e56', background: '#fae4db', fontFamily: 'Georgia, serif' }}>!</div>
          
          <p className="eyebrow mb-3">YOU DESERVE SUPPORT</p>
          
          {isListening && (
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 text-xs rounded-full" style={{ color: '#b2614f', background: '#fbe3dc' }}>
              <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <Mic size={14} />
              </motion.div>
              Say "Call 988"
            </div>
          )}

          <h2 className="serif-heading text-[clamp(36px,5vw,56px)] mb-4" style={{ color: '#bb6049' }}>
            You are not alone.
          </h2>
          <p className="max-w-[410px] mx-auto text-sm mb-7 leading-relaxed" style={{ color: '#86928a' }}>
            Help is available right now. These services are free, confidential, and open 24/7.
          </p>

          <a href="tel:988" className="flex items-center justify-center gap-2.5 w-full py-4 text-sm font-semibold text-white rounded-lg mb-2" style={{ background: '#c96b54' }}>
            <Phone size={19} /> Call 988 Lifeline <ArrowRight size={16} />
          </a>
          <a href="sms:988" className="flex items-center justify-center gap-2.5 w-full py-3.5 text-sm font-semibold rounded-lg border mb-2" style={{ color: '#a45f4d', borderColor: '#e6c3b6' }}>
            Text 988
          </a>
          <a href="tel:18006624357" className="flex items-center justify-center gap-2.5 w-full py-3.5 text-sm font-semibold rounded-lg border mb-2" style={{ color: '#a45f4d', borderColor: '#e6c3b6' }}>
            SAMHSA (1-800-662-4357)
          </a>

          {trustedContact && (
            <a href={`sms:${trustedContact}?body=I am in crisis and using my Anchor app. I need your support.`} className="flex items-center justify-center gap-2.5 w-full py-3.5 text-sm font-semibold rounded-lg border" style={{ color: 'var(--green)', borderColor: '#d3e4d2' }}>
              Text My Trusted Contact
            </a>
          )}
        </div>

        {/* ─── Grounding Tools ─── */}
        <div className="space-y-3 text-center">
          <p className="eyebrow">OR TRY THESE GROUNDING TOOLS RIGHT NOW</p>
          <MiniBreathe />
          <Grounding54321 />
        </div>

        <div className="pt-6 text-center">
          <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-2 text-xs" style={{ color: '#728279' }}>
            <X size={16} /> I'm feeling safer. Return to my space
          </button>
        </div>
      </div>
    </div>
  );
}
