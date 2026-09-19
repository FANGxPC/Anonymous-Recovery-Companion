import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVault } from '../context/VaultContext';
import { deriveKey } from '../vault/crypto';
import { getSalt } from '../vault/db';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
    <div className="flex-1 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="text-center pb-8">
            <div className="mx-auto bg-muted p-3 rounded-full mb-4 border shadow-sm">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Welcome Back</CardTitle>
            <CardDescription className="text-base mt-2">
              Enter your private password to access your space.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  type="password" 
                  className="pl-10 h-12 text-lg"
                  value={passphrase}
                  onChange={(e: any) => setPassphrase(e.target.value)}
                  placeholder="Your Password"
                  required
                />
              </div>

              {error && (
                <p className="text-destructive text-sm text-center font-medium">{error}</p>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold"
                disabled={isLoading || !passphrase}
              >
                {isLoading ? 'Unlocking...' : 'Unlock'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
