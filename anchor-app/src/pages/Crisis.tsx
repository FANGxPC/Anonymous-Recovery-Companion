import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MessageSquare, ArrowLeft, ExternalLink, Mic, MicOff, AlertCircle, Wind, Focus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    let timeout: ReturnType<typeof setTimeout>;
    if (phase === 'inhale') {
      if (!isIOS && navigator.vibrate) navigator.vibrate(50);
      timeout = setTimeout(() => setPhase('exhale'), 4000);
    } else {
      if (!isIOS && navigator.vibrate) navigator.vibrate(100);
      timeout = setTimeout(() => setPhase('inhale'), 6000);
    }
    return () => clearTimeout(timeout);
  }, [phase]);

  if (phase === 'idle') {
    return (
      <Button variant="outline" className="w-full" onClick={() => setPhase('inhale')}>
        <Wind className="w-4 h-4 mr-2" /> Start Breathing Exercise
      </Button>
    );
  }

  return (
    <div className="bg-primary/5 rounded-lg p-6 flex flex-col items-center justify-center relative overflow-hidden border border-primary/20">
      <motion.div
        animate={{ scale: phase === 'inhale' ? 1.5 : 1 }}
        transition={{ duration: phase === 'inhale' ? 4 : 6, ease: "easeInOut" }}
        className="absolute w-32 h-32 bg-primary/10 rounded-full blur-xl"
      />
      <div className="z-10 text-center space-y-4">
        <div className="text-2xl font-bold text-primary tracking-wide">
          {phase === 'inhale' ? 'Inhale...' : 'Exhale...'}
        </div>
        <Button variant="ghost" size="sm" onClick={() => setPhase('idle')} className="text-muted-foreground hover:text-foreground">
          Stop
        </Button>
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
      <Button variant="outline" className="w-full" onClick={() => setStep(0)}>
        <Focus className="w-4 h-4 mr-2" /> Start 5-4-3-2-1 Grounding
      </Button>
    );
  }

  if (step >= steps.length) {
    return (
      <div className="text-center p-4 bg-muted/30 rounded-lg">
        <p className="font-medium text-primary mb-2">Grounding Complete</p>
        <Button variant="outline" size="sm" onClick={() => setStep(-1)}>Restart</Button>
      </div>
    );
  }

  return (
    <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
          {steps[step].num}
        </div>
        <h4 className="font-semibold text-primary">{steps[step].text}</h4>
      </div>
      <p className="text-sm text-foreground/80 pl-11 mb-4">{steps[step].desc}</p>
      <div className="flex justify-between pl-11">
        <Button variant="ghost" size="sm" onClick={() => setStep(s => Math.max(-1, s - 1))}>
          Back
        </Button>
        <Button size="sm" onClick={() => setStep(s => s + 1)}>
          {step === steps.length - 1 ? 'Finish' : 'Next'}
        </Button>
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
        console.log("Voice Command Recognized:", command);

        if (command.includes('call') && (command.includes('988') || command.includes('lifeline') || command.includes('help'))) {
          window.location.href = 'tel:988';
        }
        if (command.includes('text')) {
          window.location.href = 'sms:988';
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      try {
        recognition.start();
        setIsListening(true);
        recognitionRef.current = recognition;
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
      }
    }

    return () => {
      window.speechSynthesis.cancel();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const trustedContact = localStorage.getItem('anchor_trusted_contact');

  return (
    <div className="flex-1 flex flex-col items-center p-4 bg-background min-h-screen pb-24 overflow-y-auto pt-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg space-y-6"
      >
        <Card className="border-destructive shadow-lg overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-destructive" />
          <CardHeader className="text-center pb-4 pt-8">
            <div className="mx-auto bg-destructive/10 p-4 rounded-full mb-4">
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
            
            <div className="flex justify-center mb-4">
              {isListening ? (
                <Badge variant="outline" className="gap-2 bg-destructive/5 text-destructive border-destructive/30 px-3 py-1">
                  <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                    <Mic className="w-3.5 h-3.5" />
                  </motion.div>
                  Voice Mode: Say "Call 988"
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-2 px-3 py-1 text-muted-foreground">
                  <MicOff className="w-3.5 h-3.5" />
                  Voice Mode Unavailable
                </Badge>
              )}
            </div>

            <CardTitle className="text-3xl font-bold tracking-tight text-destructive mb-2">You are not alone.</CardTitle>
            <CardDescription className="text-base text-foreground/80 font-medium px-4">
              Help is available right now. It is free, confidential, and available 24/7.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <Button asChild size="lg" className="w-full h-16 text-lg font-bold bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-sm">
                <a href="tel:988">
                  <Phone className="w-5 h-5 mr-3" />
                  Call 988 (Crisis Lifeline)
                </a>
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Button asChild variant="outline" className="h-14 font-semibold border-2">
                  <a href="sms:988">
                    <MessageSquare className="w-5 h-5 mr-2" /> Text 988
                  </a>
                </Button>
                <Button asChild variant="outline" className="h-14 font-semibold border-2">
                  <a href="tel:18006624357">
                    <Phone className="w-5 h-5 mr-2" /> SAMHSA
                  </a>
                </Button>
              </div>

              {trustedContact && (
                <Button asChild variant="outline" className="w-full h-14 font-semibold border-2 border-primary/30 hover:bg-primary/5 text-primary">
                  <a href={`sms:${trustedContact}?body=I am in crisis and using my Anchor app. I need your support.`}>
                    <MessageSquare className="w-5 h-5 mr-3" />
                    Text My Trusted Contact
                  </a>
                </Button>
              )}
            </div>
            <div className="flex items-center justify-center text-xs text-muted-foreground">
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
              These links will securely open your phone app.
            </div>
          </CardContent>
        </Card>

        {/* Immediate Grounding Tools */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider text-center">
            Or try these grounding tools right now
          </h3>
          <div className="grid gap-3">
            <MiniBreathe />
            <Grounding54321 />
          </div>
        </div>

        {/* De-escalation Return Path */}
        <div className="pt-6 text-center">
          <Button 
            variant="ghost" 
            className="text-muted-foreground hover:text-foreground h-12 px-6 rounded-full"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            I am feeling safer. Return to dashboard
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
