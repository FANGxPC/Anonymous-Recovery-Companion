import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Book, Filter, Calendar } from 'lucide-react';
import { useVault } from '../context/VaultContext';
import { getEntries } from '../vault/db';
import type { CheckInEntry } from '../vault/db';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function Journal() {
  const { cryptoKey } = useVault();
  const [entries, setEntries] = useState<CheckInEntry[]>([]);
  const [filterMood, setFilterMood] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!cryptoKey) return;
      const loaded = await getEntries(cryptoKey);
      // Sort by newest first
      setEntries(loaded.sort((a, b) => b.timestamp - a.timestamp));
    }
    loadData();
  }, [cryptoKey]);

  const filteredEntries = filterMood 
    ? entries.filter(e => e.mood === filterMood)
    : entries;

  const moods = ['great', 'good', 'okay', 'low', 'crisis'];

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto p-4 md:p-8 space-y-6 pb-24">
      <header className="flex items-center justify-between pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Book className="w-8 h-8 text-primary" />
            Journal
          </h1>
          <p className="text-muted-foreground mt-1">Your encrypted recovery log.</p>
        </div>
      </header>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <Filter className="w-4 h-4 text-muted-foreground mr-2" />
        <Button 
          variant={filterMood === null ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterMood(null)}
          className="rounded-full"
        >
          All
        </Button>
        {moods.map(mood => (
          <Button 
            key={mood}
            variant={filterMood === mood ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterMood(mood)}
            className="rounded-full capitalize"
          >
            {mood}
          </Button>
        ))}
      </div>

      {/* Entries List */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No entries found.
          </div>
        ) : (
          filteredEntries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize text-sm font-semibold">
                          {entry.mood}
                        </Badge>
                        {entry.triggerCategory && (
                          <Badge variant="secondary" className="capitalize">
                            {entry.triggerCategory}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(entry.timestamp).toLocaleString(undefined, { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {entry.note && (
                    <div className="p-3 bg-muted/30 rounded-md border text-sm whitespace-pre-wrap">
                      {entry.note}
                    </div>
                  )}
                  {entry.ragResponse && (
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-md">
                      <div className="text-sm font-medium text-primary mb-1">Anchor Response:</div>
                      <p className="text-sm text-foreground/90">{entry.ragResponse.text}</p>
                      <div className="mt-2 text-xs text-muted-foreground border-t pt-2 border-primary/10">
                        Source: {entry.ragResponse.source}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
