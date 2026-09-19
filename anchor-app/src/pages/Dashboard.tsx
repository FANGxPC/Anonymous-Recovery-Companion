import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, PlusCircle, Activity, ArrowRight, ShieldCheck, Download, Trash2, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVault } from '../context/VaultContext';
import { getEntries, cryptoShred } from '../vault/db';
import type { CheckInEntry } from '../vault/db';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

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

  const days = entries.length;
  let season = 'The Grounding Season';
  if (days > 7) season = 'The Growth Season';
  if (days > 30) season = 'The Renewal Season';

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Your private recovery journey.</p>
        </div>
        <Button variant="outline" size="sm" onClick={logout} className="hidden sm:flex gap-2">
          <LogOut className="w-4 h-4" /> Lock Screen
        </Button>
        <Button variant="outline" size="icon" onClick={logout} className="sm:hidden">
          <LogOut className="w-4 h-4" />
        </Button>
      </header>

      {/* Main Actions Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Milestone Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2"
        >
          <Card className="h-full border-primary/10 bg-primary/5">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 text-primary">
                  <Leaf className="w-6 h-6" />
                  <CardTitle className="text-xl">{season}</CardTitle>
                </div>
                <Badge variant="secondary" className="gap-1.5 bg-background shadow-sm text-xs font-medium text-emerald-600 border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Private & Secure
                </Badge>
              </div>
              <CardDescription className="pt-2 text-primary/80">
                Milestones are chapters, not streaks. Every day is a step forward, and your history is always yours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/checkin')}
                className="w-full justify-between h-14 text-base font-semibold shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <PlusCircle className="w-5 h-5" />
                  Daily Check-in
                </div>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Coping Plan Card (Side) */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-1"
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">My Coping Plan</CardTitle>
              <CardDescription>Verified strategies.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {entries.filter(e => e.ragResponse).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Complete a check-in to generate a plan.</p>
              ) : (
                <div className="space-y-3">
                  {entries.filter(e => e.ragResponse).slice(0, 2).map((entry) => (
                    <div key={`plan-${entry.id}`} className="text-sm bg-muted/50 p-3 rounded-md border">
                      <p className="line-clamp-3 leading-snug">{entry.ragResponse?.text}</p>
                    </div>
                  ))}
                  <Button variant="secondary" className="w-full mt-2 text-sm" onClick={() => window.print()}>
                    Print Full Plan
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* History Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Recent Entries</h3>
        
        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground flex flex-col items-center">
            <Activity className="w-8 h-8 mb-4 opacity-50 animate-pulse" />
            Loading your journal...
          </div>
        ) : entries.length === 0 ? (
          <Card className="py-12 border-dashed bg-transparent shadow-none">
            <CardContent className="flex flex-col items-center text-muted-foreground text-center">
              <Activity className="w-8 h-8 mb-4 opacity-30" />
              <p>No entries yet. Start your journey today.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {entries.slice(0, 4).map(entry => (
              <motion.div 
                key={entry.id} 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="capitalize">Mood: {entry.mood}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    {entry.triggerCategory && (
                      <div className="text-sm font-medium text-primary mt-2">
                        Trigger: {entry.triggerCategory}
                      </div>
                    )}
                  </CardHeader>
                  {entry.note && (
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                        {entry.note}
                      </p>
                    </CardContent>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t">
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
            <CardTitle className="text-lg text-destructive">Privacy & Data</CardTitle>
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
