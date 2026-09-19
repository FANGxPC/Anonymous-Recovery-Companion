import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Activity, Zap, Layers } from 'lucide-react';
import { useVault } from '../context/VaultContext';
import { getEntries } from '../vault/db';
import type { CheckInEntry } from '../vault/db';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function Triggers() {
  const { cryptoKey } = useVault();
  const [entries, setEntries] = useState<CheckInEntry[]>([]);

  useEffect(() => {
    async function loadData() {
      if (!cryptoKey) return;
      const loaded = await getEntries(cryptoKey);
      setEntries(loaded);
    }
    loadData();
  }, [cryptoKey]);

  // Aggregate triggers
  const triggersWithData = entries.filter(e => e.triggerCategory);
  
  const triggerCounts = triggersWithData.reduce((acc, entry) => {
    const trigger = entry.triggerCategory as string;
    acc[trigger] = (acc[trigger] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topTriggers = Object.entries(triggerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const entriesWithCopings = entries.filter(e => e.triggerCategory && e.ragResponse);

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto p-4 md:p-8 space-y-8 pb-24">
      <header className="flex items-center justify-between pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Zap className="w-8 h-8 text-amber-500" />
            Triggers & Coping
          </h1>
          <p className="text-muted-foreground mt-1">Understand your patterns to build resilience.</p>
        </div>
      </header>

      {topTriggers.length === 0 ? (
        <Card className="py-12 border-dashed bg-transparent shadow-none text-center">
          <CardContent className="flex flex-col items-center text-muted-foreground">
            <Activity className="w-8 h-8 mb-4 opacity-30" />
            <p>Log a check-in with a trigger to see your patterns here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Triggers</CardTitle>
              <CardDescription>Most frequent situations preceding a check-in.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topTriggers.map(([trigger, count], index) => (
                  <div key={trigger} className="flex items-center gap-4">
                    <div className="w-24 text-sm font-medium capitalize truncate">
                      {trigger}
                    </div>
                    <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / topTriggers[0][1]) * 100}%` }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="h-full bg-amber-500 rounded-full"
                      />
                    </div>
                    <div className="w-8 text-right text-sm text-muted-foreground font-semibold">
                      {count}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              Effective Coping Strategies
            </h3>
            <div className="space-y-4">
              {entriesWithCopings.slice(0, 5).map(entry => (
                <Card key={entry.id} className="bg-primary/5 border-primary/20">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-amber-500/50 text-amber-600 bg-amber-500/10">
                        Trigger: <span className="capitalize ml-1 font-semibold">{entry.triggerCategory}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium leading-relaxed">{entry.ragResponse?.text}</p>
                    <div className="text-xs text-muted-foreground mt-3 pt-3 border-t border-primary/10">
                      Cited Source: {entry.ragResponse?.source}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
