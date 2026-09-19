import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, AlertCircle } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import type { CheckInEntry } from '../vault/db';

interface Props {
  entry: CheckInEntry | null;
  onClose: () => void;
}

export function ReflectionModal({ entry, onClose }: Props) {
  const [reflection, setReflection] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!entry) return;
    
    // Reset state for new entry
    setReflection(null);
    setError(null);
    setIsLoading(true);

    const apiKey = localStorage.getItem('anchor_gemini_key') || import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setError("Please configure your Gemini API Key in Settings to generate a reflection.");
      setIsLoading(false);
      return;
    }

    async function generateReflection() {
      try {
        const ai = new GoogleGenAI({ apiKey: apiKey as string });
        const prompt = `You are Anchor, a supportive, empathetic, and trauma-informed AI companion. 
The user has provided a journal entry. Read their reflection and provide a warm, validating, and concise response (max 3 short paragraphs). Do NOT provide medical diagnoses.
Mood: ${entry!.mood}
Trigger: ${entry!.triggerCategory || 'None'}
Note: ${entry!.note || 'No additional notes provided.'}

Provide a supportive reflection directly to the user.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        if (response.text) {
          setReflection(response.text);
        } else {
          setError("Received an empty response from AI.");
        }
      } catch (err) {
        console.error("Gemini API Error:", err);
        setError("There was an error communicating with the AI. Please check your API key and connection.");
      } finally {
        setIsLoading(false);
      }
    }

    generateReflection();
  }, [entry]);

  if (!entry) return null;

  const dateStr = new Date(entry.timestamp).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="relative w-full max-w-lg p-6 rounded-md shadow-2xl flex flex-col max-h-[85vh]"
          style={{ background: 'var(--cream)', borderColor: 'var(--line)', border: '1px solid var(--line)' }}
        >
          <div className="flex items-center justify-between mb-4 pb-4 border-b" style={{ borderColor: 'var(--line)' }}>
            <div>
              <p className="eyebrow mb-1">JOURNAL ENTRY</p>
              <h3 className="serif-heading text-[20px]">{dateStr}</h3>
            </div>
            <button onClick={onClose} className="text-[#8b958d] hover:text-[var(--ink)] transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="overflow-y-auto pr-2 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="eyebrow flex items-center gap-1.5 capitalize" style={{ color: '#6e9273' }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#94c194' }} /> Mood: {entry.mood}
                </span>
                {entry.triggerCategory && (
                  <span className="eyebrow" style={{ color: '#b2614f' }}>• Trigger: {entry.triggerCategory}</span>
                )}
              </div>
              
              {entry.note && (
                <div className="p-4 rounded-sm border" style={{ background: '#fff', borderColor: 'var(--line)' }}>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--ink)' }}>"{entry.note}"</p>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="grid place-items-center w-6 h-6 rounded-full" style={{ color: '#fff', background: 'var(--green)' }}>
                  <Sparkles size={12} />
                </span>
                <span className="serif-heading text-[18px]" style={{ color: 'var(--green)' }}>Anchor Insight</span>
              </div>
              
              <div className="p-5 rounded-sm border min-h-[100px]" style={{ background: '#e5f0e2', borderColor: '#d3e4d2' }}>
                {isLoading ? (
                  <div className="flex items-center gap-2 text-sm" style={{ color: '#6e8274' }}>
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--green)' }} />
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--green)', animationDelay: '0.2s' }} />
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--green)', animationDelay: '0.4s' }} />
                    <span className="ml-2">Reflecting on your entry...</span>
                  </div>
                ) : error ? (
                  <div className="flex items-start gap-2 text-sm" style={{ color: '#b2614f' }}>
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </div>
                ) : (
                  <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#506b58' }}>
                    {reflection}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
