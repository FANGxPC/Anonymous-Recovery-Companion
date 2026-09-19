import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, PlusCircle, Activity, ArrowRight, ShieldCheck, Download, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVault } from '../context/VaultContext';
import { getEntries, cryptoShred } from '../vault/db';
import type { CheckInEntry } from '../vault/db';

export function Dashboard() {
  const navigate = useNavigate();
  const { cryptoKey, logout } = useVault();
  const [entries, setEntries] = useState<CheckInEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showShredConfirm, setShowShredConfirm] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!cryptoKey) return;
      try {
        const loadedEntries = await getEntries(cryptoKey);
        setEntries(loadedEntries);
      } catch (err) {
        console.error('Failed to load entries:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [cryptoKey]);

  const handleCryptoShred = async () => {
    await cryptoShred();
    logout();
    navigate('/');
    window.location.reload();
  };

  const exportData = () => {
    const dataStr = JSON.stringify(entries, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'anchor-export.json';
    a.click();
  };

  // Determine the current "Season" (milestone)
  const days = entries.length; // Simplified for hackathon
  let season = 'The Grounding Season';
  if (days > 7) season = 'The Growth Season';
  if (days > 30) season = 'The Renewal Season';

  return (
    <div className="container">
      <div className="flex-between mb-8 mt-4">
        <h2>Your Journey</h2>
        <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }} onClick={logout}>
          Lock Screen
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card mb-8"
      >
        <div className="flex-between mb-4">
          <div className="flex-center" style={{ gap: '0.5rem', color: 'var(--accent-success)' }}>
            <Leaf size={24} />
            <span style={{ fontWeight: 600, fontSize: '1.25rem' }}>{season}</span>
          </div>
          
          <div 
            className="flex-center" 
            style={{ 
              gap: '0.25rem', 
              fontSize: '0.85rem', 
              backgroundColor: '#dbeafe', 
              color: 'var(--accent-primary)',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
            }}
          >
            <ShieldCheck size={16} />
            <span>Private & Secure</span>
          </div>
        </div>
        
        <p className="text-muted">
          Milestones are chapters, not streaks. Every day is a step forward, and your history is always yours.
        </p>

        <div className="flex-col mt-6" style={{ gap: '1rem' }}>
          <button 
            className="btn btn-primary interactive w-full"
            onClick={() => navigate('/checkin')}
            style={{ justifyContent: 'space-between' }}
          >
            <div className="flex-center" style={{ gap: '0.5rem' }}>
              <PlusCircle size={20} />
              <span>Daily Check-in</span>
            </div>
            <ArrowRight size={20} />
          </button>
        </div>
      </motion.div>

      <h3 className="mb-4 text-tertiary" style={{ fontSize: '1.25rem' }}>Recent Entries</h3>
      
      {isLoading ? (
        <p className="text-muted text-center py-8">Loading your journal...</p>
      ) : entries.length === 0 ? (
        <div className="glass-card text-center text-muted" style={{ padding: '3rem 1rem' }}>
          <Activity size={32} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <p>No entries yet. Start your journey today.</p>
        </div>
      ) : (
        <div className="flex-col" style={{ gap: '1rem' }}>
          {entries.slice(0, 5).map(entry => (
            <motion.div 
              key={entry.id} 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card" 
              style={{ padding: '1rem 1.5rem' }}
            >
              <div className="flex-between mb-2">
                <span style={{ textTransform: 'capitalize', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Mood: {entry.mood}
                </span>
                <span className="text-sm text-muted">
                  {new Date(entry.timestamp).toLocaleDateString()}
                </span>
              </div>
              {entry.triggerCategory && (
                <div className="text-sm text-accent mb-2">
                  Trigger: {entry.triggerCategory}
                </div>
              )}
              {entry.note && (
                <p className="text-muted text-sm" style={{ marginBottom: 0 }}>
                  {entry.note.length > 100 ? entry.note.substring(0, 100) + '...' : entry.note}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Hardware Connection */}
      <div className="mt-8 mb-8 pt-8" style={{ borderTop: '2px solid var(--border-color)' }}>
        <h3 className="mb-4">Physical Anchor Button</h3>
        <p className="text-sm text-muted mb-6">Connect your Bluetooth ESP32 button for instant, hands-free crisis support.</p>
        <div className="gap-4">
          <button 
            className="btn btn-secondary flex-center" 
            style={{ flex: 1, backgroundColor: '#eff6ff', color: 'var(--accent-primary)', borderColor: '#bfdbfe' }}
            onClick={async () => {
              const { connectAnchorButton } = await import('../hardware/bluetooth');
              connectAnchorButton();
            }}
          >
            Connect Bluetooth Device
          </button>
          <button 
            className="btn btn-secondary flex-center" 
            style={{ flex: 1 }}
            onClick={async () => {
              const { simulateHardwarePress } = await import('../hardware/bluetooth');
              simulateHardwarePress();
            }}
          >
            Simulate Press
          </button>
        </div>
      </div>

      {/* Settings / Privacy Actions */}
      <div className="mt-8 mb-8 pt-8" style={{ borderTop: '2px solid var(--border-color)' }}>
        <h3 className="mb-4">Privacy & Data</h3>
        <p className="text-sm text-muted mb-6">Because your data never leaves your device, you are in full control of it.</p>
        <div className="gap-4">
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={exportData}>
            <Download size={20} />
            Save a Copy
          </button>
          
          <button 
            className="btn btn-danger" 
            style={{ flex: 1 }} 
            onClick={() => setShowShredConfirm(true)}
          >
            <Trash2 size={20} />
            Delete All My Data
          </button>
        </div>
        
        {showShredConfirm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 p-6"
            style={{ backgroundColor: '#fef2f2', borderRadius: 'var(--radius-lg)', border: '2px solid #fca5a5' }}
          >
            <p className="text-danger mb-6">
              <strong>WARNING:</strong> This will instantly and permanently erase all your journal entries and settings from this device. We cannot recover it for you.
            </p>
            <div className="gap-4">
              <button className="btn btn-secondary w-full" onClick={() => setShowShredConfirm(false)}>Cancel</button>
              <button className="btn w-full crisis-bg" onClick={handleCryptoShred}>Yes, Permanently Delete</button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
