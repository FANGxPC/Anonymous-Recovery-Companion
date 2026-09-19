import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import { useVault } from '../context/VaultContext';
import { getEntries } from '../vault/db';
import type { CheckInEntry } from '../vault/db';

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

  const triggersWithData = entries.filter(e => e.triggerCategory);
  const triggerCounts = triggersWithData.reduce((acc, entry) => {
    const trigger = entry.triggerCategory as string;
    acc[trigger] = (acc[trigger] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topTriggers = Object.entries(triggerCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const entriesWithCopings = entries.filter(e => e.triggerCategory && e.ragResponse);

  return (
    <div className="flex-1 w-full max-w-[900px] mx-auto px-4 md:px-16 pb-24">
      <header className="h-[86px] flex items-center border-b" style={{ borderColor: 'var(--line)' }}>
        <span className="eyebrow">My space <span className="mx-2" style={{ color: '#c2cac2' }}>/</span> Triggers</span>
      </header>

      <div className="py-10">
        <p className="eyebrow mb-2">YOUR PATTERNS</p>
        <h1 className="serif-heading text-[clamp(36px,5vw,56px)]">
          Triggers & <em>coping.</em>
        </h1>
        <p className="mt-3 text-sm" style={{ color: '#859088' }}>Understand your patterns to build resilience.</p>
      </div>

      {topTriggers.length === 0 ? (
        <div className="text-center py-16 rounded-sm border" style={{ background: 'var(--paper)', borderColor: 'var(--line)' }}>
          <Activity size={24} className="mx-auto mb-4 opacity-30" style={{ color: '#8b958d' }} />
          <p className="text-sm" style={{ color: '#8b958d' }}>Log a check-in with a trigger to see your patterns here.</p>
        </div>
      ) : (
        <div className="space-y-10">
          <div className="p-6 rounded-sm border" style={{ background: 'var(--paper)', borderColor: 'var(--line)' }}>
            <p className="eyebrow mb-1">FREQUENCY</p>
            <h3 className="serif-heading text-[20px] font-semibold mb-6" style={{ letterSpacing: '-0.03em' }}>Top triggers</h3>
            <div className="space-y-4">
              {topTriggers.map(([trigger, count], index) => (
                <div key={trigger} className="flex items-center gap-4">
                  <div className="w-24 text-xs font-medium capitalize truncate">{trigger}</div>
                  <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: '#e5f0e2' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / topTriggers[0][1]) * 100}%` }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className="h-full rounded-full"
                      style={{ background: 'var(--green)' }}
                    />
                  </div>
                  <div className="w-8 text-right text-xs font-semibold" style={{ color: '#8b958d' }}>{count}</div>
                </div>
              ))}
            </div>
          </div>

          {entriesWithCopings.length > 0 && (
            <div>
              <p className="eyebrow mb-1">WHAT HELPED</p>
              <h3 className="serif-heading text-[20px] font-semibold mb-5" style={{ letterSpacing: '-0.03em' }}>Effective coping strategies</h3>
              <div className="space-y-3">
                {entriesWithCopings.slice(0, 5).map(entry => (
                  <div key={entry.id} className="p-5 rounded-sm border" style={{ background: '#e5f0e2', borderColor: '#d3e4d2' }}>
                    <span className="eyebrow" style={{ color: '#a46836' }}>Trigger: {entry.triggerCategory}</span>
                    <p className="mt-2 text-sm font-medium leading-relaxed" style={{ color: 'var(--ink)' }}>{entry.ragResponse?.text}</p>
                    <p className="mt-2 text-[10px]" style={{ color: '#8b978d' }}>Source: {entry.ragResponse?.source}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
