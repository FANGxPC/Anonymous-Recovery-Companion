import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Filter, ArrowRight } from 'lucide-react';
import { useVault } from '../context/VaultContext';
import { getEntries } from '../vault/db';
import type { CheckInEntry } from '../vault/db';
import { ReflectionModal } from '../components/ReflectionModal';

export function Journal() {
  const { cryptoKey } = useVault();
  const [entries, setEntries] = useState<CheckInEntry[]>([]);
  const [filterMood, setFilterMood] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<CheckInEntry | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!cryptoKey) return;
      const loaded = await getEntries(cryptoKey);
      setEntries(loaded.sort((a, b) => b.timestamp - a.timestamp));
    }
    loadData();
  }, [cryptoKey]);

  const filteredEntries = filterMood ? entries.filter(e => e.mood === filterMood) : entries;
  const moods = ['great', 'good', 'okay', 'low', 'crisis'];
  const entryTones = ['sun', 'lavender', 'mint'] as const;
  const toneStyles = {
    sun: { bg: '#fff9ed', border: '#f1e6cc' },
    lavender: { bg: '#f8f6fb', border: '#e7e2ef' },
    mint: { bg: '#f3faf1', border: '#dcebd9' }
  };

  return (
    <div className="flex-1 w-full max-w-[900px] mx-auto px-4 md:px-16 pb-24">
      <header className="h-[86px] flex items-center border-b" style={{ borderColor: 'var(--line)' }}>
        <span className="eyebrow">My space <span className="mx-2" style={{ color: '#c2cac2' }}>/</span> Journal</span>
      </header>

      <div className="py-10">
        <p className="eyebrow mb-2">YOUR REFLECTIONS</p>
        <h1 className="serif-heading text-[clamp(36px,5vw,56px)]">
          Your encrypted <em>journal.</em>
        </h1>
        <p className="mt-3 text-sm" style={{ color: '#859088' }}>Private reflections, stored only on this device.</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b" style={{ borderColor: 'var(--line)' }}>
        <Filter size={14} style={{ color: '#8b958d' }} />
        <button onClick={() => setFilterMood(null)} className="px-3 py-1.5 text-xs rounded-sm border" style={{ background: filterMood === null ? '#e5f0e2' : 'var(--paper)', borderColor: filterMood === null ? '#bcd8bc' : 'var(--line)', color: filterMood === null ? 'var(--green)' : '#758078', fontWeight: filterMood === null ? 600 : 400 }}>All</button>
        {moods.map(mood => (
          <button key={mood} onClick={() => setFilterMood(mood)} className="px-3 py-1.5 text-xs rounded-sm border capitalize" style={{ background: filterMood === mood ? '#e5f0e2' : 'var(--paper)', borderColor: filterMood === mood ? '#bcd8bc' : 'var(--line)', color: filterMood === mood ? 'var(--green)' : '#758078', fontWeight: filterMood === mood ? 600 : 400 }}>{mood}</button>
        ))}
      </div>

      {/* Entries */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {filteredEntries.length === 0 ? (
          <div className="md:col-span-3 text-center py-16 rounded-sm border" style={{ background: 'var(--paper)', borderColor: 'var(--line)' }}>
            <p className="text-sm" style={{ color: '#8b958d' }}>No entries found.</p>
          </div>
        ) : (
          filteredEntries.map((entry, idx) => {
            const tone = entryTones[idx % entryTones.length];
            const s = toneStyles[tone];
            return (
              <motion.article
                key={entry.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="min-h-[189px] p-5 rounded-sm border"
                style={{ background: s.bg, borderColor: s.border }}
              >
                <div className="flex justify-between items-center">
                  <span className="eyebrow">{new Date(entry.timestamp).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  <span className="eyebrow flex items-center gap-1.5 capitalize" style={{ color: '#6e9273' }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#94c194' }} /> {entry.mood}
                  </span>
                </div>
                {entry.triggerCategory && (
                  <p className="mt-7 mb-1.5 text-xs font-semibold" style={{ color: '#6e806f' }}>{entry.triggerCategory}</p>
                )}
                {entry.note && (
                  <p className="text-xs leading-relaxed mb-3" style={{ color: '#6f7972' }}>{entry.note}</p>
                )}
                {entry.ragResponse && (
                  <div className="mt-3 p-3 rounded-sm border text-xs" style={{ background: '#e5f0e2', borderColor: '#d3e4d2' }}>
                    <p className="font-semibold mb-1" style={{ color: 'var(--green)' }}>Anchor Response</p>
                    <p style={{ color: '#6e8274' }}>{entry.ragResponse.text}</p>
                  </div>
                )}
                <button 
                  onClick={() => setSelectedEntry(entry)}
                  className="mt-3 text-[10px] inline-flex items-center gap-1" 
                  style={{ color: '#6f9777' }}
                >
                  Read reflection <ChevronRight size={14} />
                </button>
              </motion.article>
            );
          })
        )}
      </div>

      {selectedEntry && (
        <ReflectionModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
      )}
    </div>
  );
}
