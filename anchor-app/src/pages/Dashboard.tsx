import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, PlusCircle, Activity, ArrowRight, ShieldCheck, Book, Target, Wind, AlertTriangle, Shield, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVault } from '../context/VaultContext';
import { getEntries } from '../vault/db';
import type { CheckInEntry } from '../vault/db';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { SmartwatchSimulator } from '../components/SmartwatchSimulator';

export function Dashboard() {
  const navigate = useNavigate();
  const { cryptoKey, logout } = useVault();
  const [entries, setEntries] = useState<CheckInEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const days = entries.length;
  let season = 'The Grounding Season';
  if (days > 7) season = 'The Growth Season';
  if (days > 30) season = 'The Renewal Season';
  
  // Calculate mood timeline stats
  const recentEntries = [...entries].sort((a, b) => b.timestamp - a.timestamp).slice(0, 7).reverse();
  const moodScoreMap: Record<string, number> = { 'great': 4, 'good': 3, 'okay': 2, 'low': 1, 'crisis': 0 };
  
  // Create SVG points for the timeline
  const getTimelinePoints = () => {
    if (recentEntries.length < 2) return "";
    const w = 300, h = 60;
    const dx = w / (recentEntries.length - 1);
    
    return recentEntries.map((e, i) => {
      const score = moodScoreMap[e.mood] || 2;
      const x = i * dx;
      const y = h - (score / 4) * h;
      return `${x},${y}`;
    }).join(' ');
  };

  const timelinePoints = getTimelinePoints();

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-8 space-y-8 pb-24">
      {/* Header */}
      <header className="flex items-center justify-between pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Your private recovery journey.</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="hidden sm:flex gap-1.5 font-medium border-primary/20 text-primary bg-primary/5">
            <Shield className="w-3.5 h-3.5" />
            0 Network Requests
          </Badge>
          <Button variant="outline" size="sm" onClick={logout} className="hidden sm:flex gap-2">
            <LogOut className="w-4 h-4" /> Lock Screen
          </Button>
          <Button variant="outline" size="icon" onClick={logout} className="sm:hidden">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Main Log Action */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-12 lg:col-span-8 space-y-6"
        >
          <Card className="border-primary/20 bg-primary/5 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 text-primary">
                  <Leaf className="w-6 h-6" />
                  <CardTitle className="text-2xl">{season}</CardTitle>
                </div>
              </div>
              <CardDescription className="pt-1 text-primary/80 text-base">
                Milestones are chapters, not streaks. Every day is a step forward.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Button 
                onClick={() => navigate('/checkin')}
                size="lg"
                className="w-full justify-between h-16 text-lg font-semibold shadow-md"
              >
                <div className="flex items-center gap-3">
                  <PlusCircle className="w-6 h-6" />
                  Daily Check-in
                </div>
                <ArrowRight className="w-6 h-6" />
              </Button>
            </CardContent>
          </Card>
          
          {/* Hardware Simulator for Demo */}
          <SmartwatchSimulator />
        </motion.div>

        {/* Quick Stats & Mood Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-12 lg:col-span-4"
        >
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Journey Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <div className="text-3xl font-bold text-primary">{days}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mt-1">Total Logs</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <div className="text-3xl font-bold text-primary">
                    {entries.filter(e => e.ragResponse).length}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mt-1">Techniques</div>
                </div>
              </div>

              {/* Minimal SVG Mood Chart */}
              <div>
                <div className="text-sm font-medium mb-2 flex justify-between">
                  <span>Recent Mood</span>
                  {recentEntries.length > 0 && <span className="text-muted-foreground text-xs">{recentEntries.length} days</span>}
                </div>
                <div className="h-16 w-full bg-muted/20 rounded-md border relative overflow-hidden flex items-end">
                  {recentEntries.length >= 2 ? (
                    <svg viewBox="0 0 300 60" preserveAspectRatio="none" className="w-full h-full text-primary">
                      <polyline
                        points={timelinePoints}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="drop-shadow-sm"
                      />
                      {recentEntries.map((e, i) => {
                        const w = 300, h = 60;
                        const dx = w / (recentEntries.length - 1);
                        const score = moodScoreMap[e.mood] || 2;
                        return (
                          <circle key={i} cx={i * dx} cy={h - (score / 4) * h} r="4" fill="currentColor" className="text-background stroke-primary stroke-[2px]" />
                        )
                      })}
                    </svg>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                      Not enough data yet
                    </div>
                  )}
                </div>
              </div>

            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Navigation Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Explore</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:bg-muted/30 transition-colors shadow-sm" onClick={() => navigate('/journal')}>
            <CardContent className="p-5 flex flex-col items-center text-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-full dark:bg-blue-900/30 dark:text-blue-400">
                <Book className="w-6 h-6" />
              </div>
              <div>
                <div className="font-semibold text-sm">Journal</div>
                <div className="text-xs text-muted-foreground hidden sm:block">View past entries</div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-muted/30 transition-colors shadow-sm" onClick={() => navigate('/goals')}>
            <CardContent className="p-5 flex flex-col items-center text-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full dark:bg-emerald-900/30 dark:text-emerald-400">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <div className="font-semibold text-sm">Goals</div>
                <div className="text-xs text-muted-foreground hidden sm:block">Track milestones</div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-muted/30 transition-colors shadow-sm" onClick={() => navigate('/breathe')}>
            <CardContent className="p-5 flex flex-col items-center text-center gap-3">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-full dark:bg-purple-900/30 dark:text-purple-400">
                <Wind className="w-6 h-6" />
              </div>
              <div>
                <div className="font-semibold text-sm">Breathe</div>
                <div className="text-xs text-muted-foreground hidden sm:block">4-7-8 exercise</div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-muted/30 transition-colors shadow-sm" onClick={() => navigate('/resources')}>
            <CardContent className="p-5 flex flex-col items-center text-center gap-3">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-full dark:bg-orange-900/30 dark:text-orange-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="font-semibold text-sm">Resources</div>
                <div className="text-xs text-muted-foreground hidden sm:block">Verified helplines</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
    </div>
  );
}
