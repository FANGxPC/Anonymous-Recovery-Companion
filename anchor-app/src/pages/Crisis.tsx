import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Phone, MessageSquare, ArrowLeft, HeartPulse, ExternalLink, Mic, MicOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// TypeScript declaration for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function Crisis() {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // 1. Voice Synthesis (Read aloud)
    const utterance = new SpeechSynthesisUtterance(
      "You are not alone. Help is available. Say 'call lifeline' to dial 9 8 8."
    );
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);

    // 2. Voice Recognition (Listen for commands)
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

  return (
    <div className="container flex-center" style={{ minHeight: '100vh', padding: '1rem' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card crisis-pulse w-full text-center"
        style={{ 
          maxWidth: '500px', 
          backgroundColor: 'rgba(239, 68, 68, 0.1)', 
          borderColor: 'rgba(239, 68, 68, 0.3)' 
        }}
      >
        <div 
          className="flex-center mx-auto mb-6"
          style={{ 
            backgroundColor: 'var(--accent-danger)', 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%',
            color: 'white',
            margin: '0 auto 1.5rem auto'
          }}
        >
          <HeartPulse size={40} />
        </div>
        
        {/* Voice Mode Indicator */}
        <div className="flex-center mb-4" style={{ gap: '0.5rem', color: isListening ? 'var(--accent-danger)' : 'var(--text-tertiary)', fontSize: '0.9rem', fontWeight: 500 }}>
          {isListening ? (
            <>
              <motion.div
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Mic size={18} />
              </motion.div>
              <span>Voice Mode: Say "Call 988"</span>
            </>
          ) : (
            <>
              <MicOff size={18} />
              <span>Voice Mode Unavailable</span>
            </>
          )}
        </div>
        
        <h1 className="text-danger mb-2" style={{ fontSize: '2.5rem' }}>You are not alone.</h1>
        <p className="text-primary mb-8" style={{ fontSize: '1.1rem' }}>
          Help is available right now. It is free, confidential, and available 24/7.
        </p>

        <div className="flex-col gap-4 mb-8">
          <a href="tel:988" className="btn crisis-bg w-full" style={{ padding: '1.25rem', fontSize: '1.25rem' }}>
            <Phone size={24} />
            Call 988 (Suicide & Crisis Lifeline)
          </a>
          
          <a href="sms:988" className="btn btn-secondary w-full" style={{ padding: '1rem', fontSize: '1.1rem', backgroundColor: 'rgba(255,255,255,0.05)' }}>
            <MessageSquare size={20} />
            Text 988
          </a>

          <a href="tel:18006624357" className="btn btn-secondary w-full" style={{ padding: '1rem', fontSize: '1.1rem', backgroundColor: 'rgba(255,255,255,0.05)' }}>
            <Phone size={20} />
            Call SAMHSA (1-800-662-4357)
          </a>
        </div>

        <div className="flex-center mb-6 text-sm text-muted">
          <ExternalLink size={16} className="mr-2" style={{ marginRight: '0.5rem' }} />
          These links will open your phone app securely.
        </div>

        <button 
          className="btn btn-secondary" 
          onClick={() => navigate('/dashboard')}
          style={{ border: 'none' }}
        >
          <ArrowLeft size={18} />
          I am safe now, return to dashboard
        </button>
      </motion.div>
    </div>
  );
}
