import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, KeyRound, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVault } from '../context/VaultContext';
import { deriveKey, generateRandomBytes } from '../vault/crypto';
import { setSalt, markSetupComplete } from '../vault/db';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
      const salt = generateRandomBytes(16);
      const key = await deriveKey(passphrase, salt);
      await setSalt(salt);
      await markSetupComplete();
      
      login(key);
      await checkSetupStatus();
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Failed to setup the vault. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="text-center pb-8">
            <div className="mx-auto bg-muted p-3 rounded-full mb-4 border shadow-sm">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Your Private Space</CardTitle>
            <CardDescription className="text-base mt-2">
              Everything you write here stays on your device. It never goes to a server.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-destructive/10 text-destructive border-destructive/20 border p-4 rounded-md mb-6 flex flex-col gap-2">
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="w-5 h-5" />
                We Cannot Reset Your Password
              </div>
              <p className="text-sm opacity-90 leading-relaxed">
                Because your data never leaves your device, there is no "forgot password" button. If you forget this password, your previous journal entries will be lost forever.
              </p>
            </div>

            <form onSubmit={handleSetup} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="passphrase">Create a Password or PIN</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="passphrase"
                    type="password" 
                    className="pl-10 h-12 text-lg"
                    value={passphrase}
                    onChange={(e: any) => setPassphrase(e.target.value)}
                    placeholder="Choose something memorable"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm Password</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="confirm"
                    type="password" 
                    className="pl-10 h-12 text-lg"
                    value={confirm}
                    onChange={(e: any) => setConfirm(e.target.value)}
                    placeholder="Type it again"
                    required
                  />
                </div>
              </div>

              {error && (
                <p className="text-destructive text-sm text-center font-medium">{error}</p>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold"
                disabled={isLoading || !passphrase || !confirm}
              >
                {isLoading ? 'Securing your space...' : 'Start My Journey'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
