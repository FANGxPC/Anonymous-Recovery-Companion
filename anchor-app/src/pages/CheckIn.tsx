import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVault } from '../context/VaultContext';
import { saveEntry } from '../vault/db';
import brain from '../brain';
import type { SupportResponse, CheckInData, TriggerCategory } from '../brain/contracts';
import { SupportResponseCard } from '../components/SupportResponseCard';

export function CheckIn() {
  const navigate = useNavigate();
  const { cryptoKey } = useVault();
  
  const [mood, setMood] = useState<CheckInData['mood']>('okay');
  const [trigger, setTrigger] = useState('');
  const [note, setNote] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<SupportResponse | null>(null);

  // Initialize brain on mount (loads the embedder in the background)
  useEffect(() => {
    brain.init('sealed').catch(console.error); // Default to privacy-first sealed mode
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
      // 1. Get grounded support from the Brain module
      const support = await brain.getSupport(checkInData);
      
      // 2. If it's a crisis, the global brain.onCrisis hook will catch it and navigate.
      // But we also check here just in case.
      if (support.crisis) {
        navigate('/crisis');
        return;
      }
      
      // 3. Save to encrypted Vault
      await saveEntry({ id: crypto.randomUUID(), ...checkInData }, cryptoKey);
      
      // 4. Show response
      setResponse(support);
      
    } catch (err) {
      console.error('Check-in failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (response) {
    return (
      <div className="container">
        <button 
          className="btn btn-secondary mb-6" 
          onClick={() => navigate('/dashboard')}
          style={{ padding: '0.5rem 1rem' }}
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>
        
        <h2 className="mb-2">Your Journal Entry</h2>
        <p className="text-muted">Your entry has been securely saved to this device.</p>
        
        <SupportResponseCard response={response} />
        
        <button 
          className="btn btn-primary w-full mt-6" 
          onClick={() => navigate('/dashboard')}
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="flex-between mb-6 mt-4">
        <h2>Daily Check-in</h2>
        <button 
          className="btn btn-secondary" 
          style={{ padding: '0.5rem' }}
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
      >
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="label">How are you feeling?</label>
            <div className="gap-4" style={{ flexWrap: 'wrap' }}>
              {(['great', 'good', 'okay', 'low', 'crisis'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`btn ${mood === m ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: '1 1 auto', textTransform: 'capitalize' }}
                  onClick={() => setMood(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label className="label">Are you dealing with any of these right now? (Optional)</label>
            <select 
              className="input" 
              value={trigger} 
              onChange={(e) => setTrigger(e.target.value)}
              style={{ appearance: 'auto' }}
            >
              <option value="">None / Other</option>
              <option value="social">Social Pressure</option>
              <option value="stress">Stress or Overwhelm</option>
              <option value="craving">Cravings or Urges</option>
              <option value="emotional">Emotional Distress</option>
              <option value="environmental">Difficult Places or People</option>
              <option value="physical">Pain or Fatigue</option>
            </select>
          </div>

          <div className="input-group">
            <label className="label">Write a private note (Optional)</label>
            <textarea 
              className="textarea" 
              placeholder="Write anything you like. This stays completely private on this device."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full interactive" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="spin" style={{ animation: 'spin 2s linear infinite' }} />
                <span>Reflecting...</span>
                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Save & Get Support
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
