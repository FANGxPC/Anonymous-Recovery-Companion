import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, ChevronRight, AlertCircle } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

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
        setMessages(prev => [...prev, { role: 'model', content: response.text } as Message]);
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
    if (e.key === 'Enter') handleSend();
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-4 sm:right-8 z-50 w-[360px] max-w-[calc(100vw-2rem)] flex flex-col shadow-2xl rounded-md border overflow-hidden"
            style={{ background: 'var(--cream)', borderColor: 'var(--line)', height: '520px' }}
          >
            <div className="flex items-center justify-between p-4 border-b" style={{ background: 'var(--paper)', borderColor: 'var(--line)' }}>
              <div className="flex items-center gap-3">
                <div className="grid place-items-center w-8 h-8 rounded-full" style={{ color: '#fff', background: 'var(--green)' }}>
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-[15px]" style={{ color: 'var(--ink)' }}>Anchor companion</h3>
                  <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>AI Support</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-[#8b958d] hover:text-[var(--ink)] transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="flex-1 p-5 overflow-y-auto space-y-4 flex flex-col" style={{ background: '#fcfdfa' }}>
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`
                    max-w-[85%] rounded-md px-4 py-3 text-[13px] leading-relaxed shadow-sm
                    ${msg.role === 'user' 
                      ? 'rounded-tr-none' 
                      : msg.role === 'system' 
                        ? 'bg-[#fff5f0] text-[#b2614f] border border-[#f0d5cb] text-xs italic' 
                        : 'rounded-tl-none border'}
                  `}
                  style={
                    msg.role === 'user' ? { background: 'var(--green)', color: '#fff' }
                    : msg.role === 'model' ? { background: '#fff', borderColor: 'var(--line)', color: 'var(--ink)' }
                    : {}
                  }
                  >
                    {msg.role === 'model' && (
                      <div className="flex items-center gap-1.5 mb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--green)' }}>
                        <Sparkles size={12} /> Anchor
                      </div>
                    )}
                    {msg.role === 'system' && (
                      <div className="flex items-center gap-1.5 mb-1 font-semibold">
                        <AlertCircle size={12} /> System
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-md rounded-tl-none px-4 py-4 text-sm flex items-center gap-1.5 shadow-sm border" style={{ background: '#fff', borderColor: 'var(--line)' }}>
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--green)' }} />
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--green)', animationDelay: '0.2s' }} />
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--green)', animationDelay: '0.4s' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-4 border-t" style={{ background: 'var(--paper)', borderColor: 'var(--line)' }}>
              <div className="flex items-center gap-2 relative">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Message Anchor..."
                  className="w-full pr-12 pl-4 py-3 rounded-md outline-none text-[13px] border transition-colors focus:border-[var(--green)]"
                  style={{ background: '#fff', borderColor: 'var(--line)', color: 'var(--ink)' }}
                  disabled={isLoading}
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 w-8 h-8 rounded-sm grid place-items-center disabled:opacity-50 transition-colors"
                  style={{ background: 'var(--green)', color: '#fff' }}
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-4 sm:bottom-8 sm:right-8 z-40 flex items-center gap-3 px-4 py-3 rounded-md border shadow-lg cursor-pointer"
          style={{ background: '#e7efe8', borderColor: '#c8d9ca', color: 'var(--ink)' }}
        >
          <span className="grid place-items-center w-[30px] h-[30px] rounded-full" style={{ color: '#fff', background: 'var(--green)' }}>
            <Sparkles size={14} />
          </span>
          <div className="text-left hidden sm:block pr-2">
            <b className="block text-[13px] font-bold">Anchor companion</b>
            <small className="block mt-0.5 text-[11px]" style={{ color: 'var(--muted)' }}>Here when you need help</small>
          </div>
          <ChevronRight size={15} className="hidden sm:block" style={{ color: 'var(--muted)' }} />
        </motion.button>
      )}
    </>
  );
}
