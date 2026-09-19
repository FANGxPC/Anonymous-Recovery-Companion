import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Phone, MessageSquare, ArrowLeft, ExternalLink, Mic, MicOff, AlertCircle } from 'lucide-react';
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

export function Crisis() {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const utterance = new SpeechSynthesisUtterance(
      "You are not alone. Help is available. Say 'call lifeline' to dial 9 8 8."
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
        // eslint-disable-next-line
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
    <div className="flex-1 flex flex-col items-center justify-center p-4 bg-background min-h-screen">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        <Card className="border-destructive shadow-lg overflow-hidden">
          <div className="h-2 w-full bg-destructive" />
          <CardHeader className="text-center pb-6">
            <div className="mx-auto bg-destructive/10 p-4 rounded-full mb-4">
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
            
            <div className="flex justify-center mb-4">
              {isListening ? (
                <Badge variant="outline" className="gap-2 bg-destructive/5 text-destructive border-destructive/30 px-3 py-1">
                  <motion.div
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
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
          
          <CardContent className="space-y-6">
            <div className="grid gap-3">
              <Button 
                asChild
                size="lg" 
                className="w-full h-16 text-lg font-bold bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-sm"
              >
                <a href="tel:988">
                  <Phone className="w-5 h-5 mr-3" />
                  Call 988 (Crisis Lifeline)
                </a>
              </Button>
              
              <Button 
                asChild
                variant="outline" 
                size="lg" 
                className="w-full h-14 text-base font-semibold border-2"
              >
                <a href="sms:988">
                  <MessageSquare className="w-5 h-5 mr-3" />
                  Text 988
                </a>
              </Button>

              <Button 
                asChild
                variant="outline" 
                size="lg" 
                className="w-full h-14 text-base font-semibold border-2"
              >
                <a href="tel:18006624357">
                  <Phone className="w-5 h-5 mr-3" />
                  Call SAMHSA (1-800-662-4357)
                </a>
              </Button>

              {localStorage.getItem('anchor_trusted_contact') && (
                <Button 
                  asChild
                  variant="outline" 
                  size="lg" 
                  className="w-full h-14 text-base font-semibold border-2 border-primary/20 hover:bg-primary/5 text-primary mt-2"
                >
                  <a href={`sms:${localStorage.getItem('anchor_trusted_contact')}?body=I am in crisis and using my Anchor app. I need your support.`}>
                    <MessageSquare className="w-5 h-5 mr-3" />
                    Text My Trusted Contact
                  </a>
                </Button>
              )}
            </div>

            <div className="flex items-center justify-center text-xs text-muted-foreground pt-4">
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
              These links will securely open your phone app.
            </div>

            <div className="pt-4 mt-4 border-t">
              <Button 
                variant="ghost" 
                className="w-full text-muted-foreground hover:text-foreground"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                I am safe now, return to dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
