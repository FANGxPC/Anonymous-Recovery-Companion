import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVault } from '../context/VaultContext';
import { saveEntry } from '../vault/db';
import brain from '../brain';
import type { SupportResponse, CheckInData, TriggerCategory } from '../brain/contracts';
import { SupportResponseCard } from '../components/SupportResponseCard';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const MOODS = ['great', 'good', 'okay', 'low', 'crisis'] as const;

export function CheckIn() {
  const navigate = useNavigate();
  const { cryptoKey } = useVault();
  
  const [mood, setMood] = useState<CheckInData['mood']>('okay');
  const [trigger, setTrigger] = useState<string>('other');
  const [note, setNote] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<SupportResponse | null>(null);

  useEffect(() => {
    brain.init('sealed').catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cryptoKey) return;
    
    setIsSubmitting(true);
    setResponse(null);

    const checkInData: CheckInData = {
      mood,
      triggerCategory: (trigger as TriggerCategory) || 'other',
      note,
      timestamp: Date.now()
    };

    try {
      const support = await brain.getSupport(checkInData);
      
      if (support.crisis) {
        navigate('/crisis');
        return;
      }
      
      // Update checkInData to include the response, matching the new type definition
      const savedData = { ...checkInData, ragResponse: support };
      await saveEntry({ id: crypto.randomUUID(), ...savedData }, cryptoKey);
      
      setResponse(support);
    } catch (err) {
      console.error('Check-in failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 w-full max-w-2xl mx-auto p-4 md:p-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Daily Log</h1>
          <p className="text-sm text-muted-foreground">Securely document your feelings and get grounded feedback.</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!response ? (
          <motion.div 
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
          >
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Mood Selector */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">How are you feeling today?</Label>
                    <div className="flex flex-wrap gap-3">
                      {MOODS.map((m) => (
                        <Button
                          key={m}
                          type="button"
                          variant={mood === m ? 'default' : 'outline'}
                          className={`capitalize flex-1 min-w-[80px] ${mood === m ? 'shadow-sm' : ''}`}
                          onClick={() => setMood(m)}
                        >
                          {m}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Trigger Selector */}
                  <div className="space-y-4">
                    <Label htmlFor="trigger" className="text-base font-semibold">Are you dealing with any specific challenges? <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                    <Select value={trigger} onValueChange={setTrigger}>
                      <SelectTrigger id="trigger" className="w-full">
                        <SelectValue placeholder="Select a challenge" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="other">None / Other</SelectItem>
                        <SelectItem value="social">Social Pressure</SelectItem>
                        <SelectItem value="stress">Stress or Overwhelm</SelectItem>
                        <SelectItem value="craving">Cravings or Urges</SelectItem>
                        <SelectItem value="emotional">Emotional Distress</SelectItem>
                        <SelectItem value="environmental">Difficult Places or People</SelectItem>
                        <SelectItem value="physical">Pain or Fatigue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Journal Note */}
                  <div className="space-y-4">
                    <Label htmlFor="note" className="text-base font-semibold">Private Journal <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                    <Textarea 
                      id="note"
                      placeholder="Write anything you like. This stays completely private on this device."
                      className="min-h-[150px] resize-y text-base p-4"
                      value={note}
                      onChange={(e: any) => setNote(e.target.value)}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-semibold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating your action plan...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        Save & Get Support
                      </span>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div 
            key="response"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="mb-6 flex items-center gap-3 text-emerald-600 bg-emerald-50 border border-emerald-100 p-4 rounded-lg">
              <CheckCircle2 className="w-6 h-6 shrink-0" />
              <div>
                <p className="font-semibold">Log Saved Securely</p>
                <p className="text-sm opacity-90">Your entry is encrypted and stored locally.</p>
              </div>
            </div>

            <h2 className="text-lg font-semibold mb-4 text-primary">Your Action Plan</h2>
            <SupportResponseCard response={response} />
            
            <Button 
              className="w-full mt-8 h-12 text-base" 
              variant="outline"
              onClick={() => navigate('/dashboard')}
            >
              Return to Dashboard
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
