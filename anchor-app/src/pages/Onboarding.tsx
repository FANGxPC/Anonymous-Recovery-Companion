import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, KeyRound, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVault } from '../context/VaultContext';
import { deriveKey, generateRandomBytes } from '../vault/crypto';
import { setSalt, markSetupComplete } from '../vault/db';

export function Onboarding() {
  const [passphrase, setPassphrase] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, checkSetupStatus } = useVault();

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passphrase.length < 8) {
      setError('Passphrase must be at least 8 characters.');
      return;
    }
    if (passphrase !== confirm) {
      setError('Passphrases do not match.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 1. Generate salt
      const salt = generateRandomBytes(16);
      
      // 2. Derive key via Argon2id (this takes a moment, hence isLoading)
      const key = await deriveKey(passphrase, salt);
      
      // 3. Save salt & mark setup complete
      await setSalt(salt);
      await markSetupComplete();
      
      // 4. Update VaultContext and redirect
      login(key);
      await checkSetupStatus(); // Refresh context state
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Failed to setup the vault. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card w-full"
        style={{ maxWidth: '400px' }}
      >
        <div className="flex-col flex-center mb-6 text-center">
          <div 
            style={{ 
              backgroundColor: 'var(--bg-surface-elevated)', 
              padding: '1rem', 
              borderRadius: '50%',
              marginBottom: '1rem',
              border: '1px solid var(--border-color)'
            }}
          >
            <Shield size={32} className="text-accent" />
          </div>
          <h2>Your Private Space</h2>
          <p className="text-muted text-sm">
            Everything you write here stays on your device. It never goes to a server.
          </p>
        </div>

        <div className="mb-6" style={{ backgroundColor: '#fef2f2', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #fca5a5' }}>
          <div className="flex-center mb-2" style={{ gap: '0.5rem', color: 'var(--accent-danger)' }}>
            <AlertTriangle size={18} />
            <strong>Important: We Cannot Reset Your Password</strong>
          </div>
          <p className="text-sm text-muted" style={{ marginBottom: 0 }}>
            Because your data never leaves your device, there is no "forgot password" button. If you forget this password, your previous journal entries will be lost forever.
          </p>
        </div>

        <form onSubmit={handleSetup}>
          <div className="input-group">
            <label className="label">Create a Password or PIN</label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input 
                type="password" 
                className="input" 
                style={{ paddingLeft: '3rem' }}
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Choose something memorable"
                required
              />
            </div>
          </div>
          
          <div className="input-group">
            <label className="label">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input 
                type="password" 
                className="input" 
                style={{ paddingLeft: '3rem' }}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Type it again"
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-danger text-sm mb-4 text-center">{error}</p>
          )}

          <button 
            type="submit" 
            className="btn btn-primary w-full" 
            disabled={isLoading || !passphrase || !confirm}
          >
            {isLoading ? 'Securing your space...' : 'Start My Journey'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
