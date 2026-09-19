import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Trash2, ShieldCheck, Activity, Smartphone, Server } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVault } from '../context/VaultContext';
import { cryptoShred, getEntries } from '../vault/db';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function Settings() {
  const navigate = useNavigate();
  const { logout, cryptoKey } = useVault();
  const [showShredConfirm, setShowShredConfirm] = useState(false);
  
  const handleCryptoShred = async () => {
    await cryptoShred();
    logout();
    navigate('/');
    window.location.reload();
  };

  const exportData = async () => {
    if (!cryptoKey) return;
    const entries = await getEntries(cryptoKey);
    const dataStr = JSON.stringify(entries, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'anchor-export.json';
    a.click();
  };

  return (
    <div className="flex-1 w-full max-w-2xl mx-auto p-4 md:p-8 space-y-6 pb-20">
      <header className="flex items-center justify-between pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your configuration and data.</p>
        </div>
      </header>

      <div className="space-y-6">
        {/* Support Network */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Support Network</CardTitle>
            <CardDescription>Trusted contact for SMS alerts.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="trusted-contact">Phone Number</Label>
              <Input 
                id="trusted-contact"
                type="tel" 
                placeholder="+1 (555) 000-0000" 
                defaultValue={localStorage.getItem('anchor_trusted_contact') || ''}
                onChange={(e: any) => localStorage.setItem('anchor_trusted_contact', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* AI Generation Mode */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">AI Support Mode</CardTitle>
            <CardDescription>Configure how your insights are generated.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-3">
              <label className="flex items-start space-x-3 p-3 border rounded-md bg-muted/50 cursor-pointer">
                <input type="radio" name="aiMode" className="mt-1" defaultChecked />
                <div>
                  <div className="flex items-center space-x-2">
                    <Smartphone className="w-4 h-4 text-primary" />
                    <span className="font-medium">Sealed Mode (Local)</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Everything runs directly on your device. Maximum privacy. Requires more battery.</p>
                </div>
              </label>
              
              <label className="flex items-start space-x-3 p-3 border rounded-md cursor-pointer hover:bg-muted/30">
                <input type="radio" name="aiMode" className="mt-1" disabled />
                <div className="opacity-70">
                  <div className="flex items-center space-x-2">
                    <Server className="w-4 h-4" />
                    <span className="font-medium">Assisted Mode (Cloud)</span>
                    <span className="text-xs bg-secondary px-2 rounded-full">Coming Soon</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Faster responses via cloud API. Anonymizes data before sending.</p>
                </div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Gemini Chatbot Config */}
        <Card className="shadow-sm border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg text-primary">Gemini Chat Companion</CardTitle>
            <CardDescription>Enable the AI companion with a Gemini API key.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="gemini-key">Gemini API Key</Label>
              <Input 
                id="gemini-key"
                type="password" 
                placeholder="AIzaSy..." 
                defaultValue={localStorage.getItem('anchor_gemini_key') || import.meta.env.VITE_GEMINI_API_KEY || ''}
                onChange={(e: any) => localStorage.setItem('anchor_gemini_key', e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Your key is stored securely on this device and never shared.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Hardware */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Physical Anchor Button</CardTitle>
            <CardDescription>Connect an ESP32 Bluetooth button.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="secondary" 
              className="w-full text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200"
              onClick={async () => {
                const { connectAnchorButton } = await import('../hardware/bluetooth');
                connectAnchorButton();
              }}
            >
              Connect Device
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={async () => {
                const { simulateHardwarePress } = await import('../hardware/bluetooth');
                simulateHardwarePress();
              }}
            >
              Simulate Press
            </Button>
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card className="shadow-sm border-destructive/20">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive">
              <ShieldCheck className="w-5 h-5" />
              <CardTitle className="text-lg">Privacy & Data</CardTitle>
            </div>
            <CardDescription>You are in full control.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!showShredConfirm ? (
              <>
                <Button variant="outline" className="w-full" onClick={exportData}>
                  <Download className="w-4 h-4 mr-2" /> Save a Copy
                </Button>
                <Button variant="destructive" className="w-full" onClick={() => setShowShredConfirm(true)}>
                  <Trash2 className="w-4 h-4 mr-2" /> Delete All Data
                </Button>
              </>
            ) : (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 bg-destructive/10 p-4 rounded-md border border-destructive/20"
              >
                <p className="text-sm font-medium text-destructive leading-tight">
                  WARNING: This will instantly and permanently erase all your data from this device.
                </p>
                <div className="space-y-2">
                  <Button variant="destructive" className="w-full font-bold" onClick={handleCryptoShred}>
                    Confirm Delete
                  </Button>
                  <Button variant="ghost" className="w-full" onClick={() => setShowShredConfirm(false)}>
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
