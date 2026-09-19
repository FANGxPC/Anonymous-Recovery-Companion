import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVault } from '../context/VaultContext';
import { deriveKey } from '../vault/crypto';
import { getSalt } from '../vault/db';

export function Login() {
  const [passphrase, setPassphrase] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useVault();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphrase) return;

    setIsLoading(true);
    setError('');

    try {
      const salt = await getSalt();
      if (!salt) throw new Error('Vault is corrupted (salt missing).');
      
      const key = await deriveKey(passphrase, salt);
      
      // Note: We can't verify if the password is correct immediately without trying to decrypt something.
      // For simplicity, we just set the key. If decryption fails later, it means wrong password.
      login(key);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Failed to unlock vault.');
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
            <Lock size={32} className="text-accent" />
          </div>
          <h2>Welcome Back</h2>
          <p className="text-muted text-sm">
            Enter your private password to access your space.
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <div style={{ position: 'relative' }}>
              <KeyRound size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input 
                type="password" 
                className="input" 
                style={{ paddingLeft: '3rem' }}
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Your Password"
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
            disabled={isLoading || !passphrase}
          >
            {isLoading ? 'Unlocking...' : 'Unlock'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
