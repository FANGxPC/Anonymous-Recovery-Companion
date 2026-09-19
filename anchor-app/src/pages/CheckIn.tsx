import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight } from 'lucide-react';
import { useVault } from '../context/VaultContext';
import { saveEntry } from '../vault/db';

export function CheckIn() {
  const navigate = useNavigate();
  const { cryptoKey } = useVault();
  const [mood, setMood] = useState<string | null>(null);
  const [trigger, setTrigger] = useState<string>('');
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const moods = [
    { label: 'Great', icon: '☀' },
    { label: 'Good', icon: '◒' },
    { label: 'Okay', icon: '○' },
    { label: 'Low', icon: '◡' },
    { label: 'Crisis', icon: '△' }
  ];

  const triggers = [
    'None', 'Stress or overwhelm', 'Social pressure', 
    'Physical discomfort', 'Conflict', 'Financial worry', 
    'Boredom or emptiness'
  ];

  const handleSave = async () => {
    if (!mood || !cryptoKey) return;
    setIsSaving(true);
    
    try {
      await saveEntry({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        mood: mood.toLowerCase(),
        note: note.trim() || undefined,
        triggerCategory: trigger !== 'None' ? trigger : undefined,
      }, cryptoKey);
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to save entry:', err);
      alert('Failed to save your check-in securely.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--cream)' }}>
      <header className="p-6">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-xs" style={{ color: '#728279' }}>
          <X size={16} /> Close
        </button>
      </header>

      <main className="flex-1 w-full max-w-[650px] mx-auto px-6 pb-24">
        
        <div className="mb-12">
          <p className="eyebrow mb-3">A MOMENT FOR YOU</p>
          <h2 className="serif-heading text-[clamp(42px,5vw,56px)]">
            How are you feeling<br /><em>today?</em>
          </h2>
          <p className="mt-4 text-sm" style={{ color: '#86928a' }}>
            There is no right answer. Just notice what is true right now.
          </p>
        </div>

        <div className="space-y-10">
          
          <div className="grid grid-cols-5 gap-2.5">
            {moods.map(m => {
              const isSelected = mood === m.label;
              return (
                <button 
                  key={m.label}
                  onClick={() => setMood(m.label)}
                  className="flex flex-col items-center justify-center gap-2 py-4 rounded-md border transition-all"
                  style={{
                    background: isSelected ? '#e5f0e2' : '#fff',
                    borderColor: isSelected ? '#bcd8bc' : 'var(--line)',
                    color: isSelected ? '#52745b' : '#76837a',
                  }}
                >
                  <span className="text-[23px] mb-1" style={{ color: isSelected ? 'inherit' : '#e39a78' }}>{m.icon}</span>
                  <span className="text-[11px] font-medium">{m.label}</span>
                </button>
              );
            })}
          </div>

          <div>
            <label className="block mb-3 text-xs font-semibold" style={{ color: '#51675a' }}>
              What feels most true right now? <span className="font-normal" style={{ color: '#9ba59d' }}>optional</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {triggers.map(t => (
                <button
                  key={t}
                  onClick={() => setTrigger(t)}
                  className="px-4 py-2 text-[11px] rounded-full border transition-colors"
                  style={{
                    background: trigger === t ? 'var(--green)' : '#fff',
                    color: trigger === t ? '#fff' : '#6f7972',
                    borderColor: trigger === t ? 'var(--green)' : 'var(--line)'
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="note" className="block mb-2 text-xs font-semibold" style={{ color: '#51675a' }}>
              A private note <span className="font-normal" style={{ color: '#9ba59d' }}>optional</span>
            </label>
            <textarea 
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What is on your mind? This stays on your device." 
              className="w-full min-h-[150px] p-4 text-[13px] border rounded-md outline-none transition-colors focus:border-[#8fb392]"
              style={{ background: '#fffefa', borderColor: 'var(--line)', color: 'var(--ink)' }}
            />
          </div>

          <button 
            onClick={handleSave}
            disabled={!mood || isSaving}
            className="w-full flex items-center justify-between p-4 text-[13px] font-semibold text-white rounded-md disabled:opacity-50 transition-transform active:scale-[0.98]"
            style={{ background: 'var(--green)' }}
          >
            {isSaving ? 'Saving securely...' : 'Save & get support'}
            <ArrowRight size={17} />
          </button>
        </div>
      </main>
    </div>
  );
}
