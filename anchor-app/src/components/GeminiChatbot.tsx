import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, AlertCircle } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
  role: 'user' | 'model' | 'system';
  content: string;
}

export function GeminiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Hello, I'm Anchor. I'm here to support you. How are you feeling right now?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const apiKey = localStorage.getItem('anchor_gemini_key') || import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setMessages(prev => [...prev, 
        { role: 'user', content: input },
        { role: 'system', content: 'Please configure your Gemini API Key in Settings to use the chat companion.' }
      ]);
      setInput('');
      return;
    }

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `You are Anchor, a supportive, empathetic, and trauma-informed AI companion for a recovery app helping people overcome addiction and manage crisis situations (like panic attacks or cravings). 
      Keep your responses concise, grounding, and non-judgmental. Do NOT provide medical diagnoses.
      
      User message: ${userMessage}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      if (response.text) {
        setMessages(prev => [...prev, { role: 'model', content: response.text }]);
      }
    } catch (error) {
      console.error('Gemini API Error:', error);
      setMessages(prev => [...prev, { 
        role: 'system', 
        content: 'There was an error communicating with the AI. Please check your API key and connection.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-4 sm:bottom-24 sm:right-8 z-50 w-[350px] max-w-[calc(100vw-2rem)] flex flex-col shadow-2xl"
          >
            <Card className="flex flex-col h-[500px] border-primary/20 bg-background/95 backdrop-blur-md">
              <CardHeader className="p-4 border-b bg-primary/5 flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/20 p-2 rounded-full">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold">Anchor Chat</CardTitle>
                    <p className="text-xs text-muted-foreground">AI Companion</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground hover:text-foreground" onClick={() => setIsOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </CardHeader>
              
              <CardContent className="flex-1 p-4 overflow-y-auto space-y-4 flex flex-col">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`
                      max-w-[85%] rounded-2xl px-4 py-2 text-sm
                      ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 
                        msg.role === 'system' ? 'bg-destructive/10 text-destructive border border-destructive/20 text-xs italic' : 
                        'bg-muted/60 text-foreground rounded-tl-sm'}
                    `}>
                      {msg.role === 'model' && (
                        <div className="flex items-center gap-1.5 mb-1 text-xs font-semibold text-primary/80">
                          <Bot className="w-3 h-3" /> Anchor
                        </div>
                      )}
                      {msg.role === 'system' && (
                        <div className="flex items-center gap-1.5 mb-1 font-semibold">
                          <AlertCircle className="w-3 h-3" /> System
                        </div>
                      )}
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted/60 text-foreground rounded-2xl rounded-tl-sm px-4 py-3 text-sm flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </CardContent>
              
              <div className="p-3 border-t bg-background">
                <div className="flex items-center gap-2 relative">
                  <Input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="pr-10 rounded-full border-primary/20 focus-visible:ring-primary/30"
                    disabled={isLoading}
                  />
                  <Button 
                    size="icon" 
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="absolute right-1 w-8 h-8 rounded-full"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-4 sm:bottom-8 sm:right-8 z-40 bg-primary text-primary-foreground p-4 rounded-full shadow-xl flex items-center justify-center border-2 border-background"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </motion.button>
    </>
  );
}
