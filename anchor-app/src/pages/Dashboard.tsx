import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, ArrowRight, ShieldCheck, Sparkles, KeyRound, LockKeyhole, ChevronRight, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVault } from '../context/VaultContext';
import { getEntries } from '../vault/db';
import type { CheckInEntry } from '../vault/db';

import { Button } from '@/components/ui/button';
import { SmartwatchSimulator } from '../components/SmartwatchSimulator';

const todayString = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();

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

  const recentEntries = [...entries].sort((a, b) => b.timestamp - a.timestamp).slice(0, 3);
  const entryTones = ['sun', 'lavender', 'mint'] as const;

  return (
    <div className="flex-1 w-full max-w-[1120px] mx-auto px-4 md:px-16 pb-24">

      {/* ─── Top bar ─── */}
      <header className="h-[86px] flex items-center justify-between border-b" style={{ borderColor: 'var(--line)' }}>
        <div className="flex items-center gap-2">
          <span className="eyebrow">My space <span className="mx-2" style={{ color: '#c2cac2' }}>/</span> Overview</span>
        </div>
        <div className="flex items-center gap-5">
          <span className="eyebrow flex items-center gap-1.5"><span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: '#78aa82' }} /> All data encrypted</span>
          <button onClick={logout} className="text-[#7b8780] hover:text-[var(--ink)] transition-colors"><LogOut size={18} /></button>
        </div>
      </header>

      {/* ─── Welcome row ─── */}
      <div className="py-12 md:py-14 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <p className="eyebrow mb-3">{todayString}</p>
          <h1 className="serif-heading text-[clamp(42px,5vw,64px)]">
            Welcome back, <em>friend.</em>
          </h1>
          <p className="mt-3 text-sm" style={{ color: '#859088' }}>
            This is your space to pause, notice, and keep moving forward.
          </p>
        </div>
        <button 
          onClick={() => navigate('/crisis')}
          className="flex items-center gap-2 px-4 py-3 text-xs rounded-lg border cursor-pointer transition-colors hover:bg-[#fff0ea]"
          style={{ color: '#b2614f', background: '#fff5f0', borderColor: '#f0d5cb' }}
        >
          <span className="w-2 h-2 rounded-full" style={{ background: '#e48267', boxShadow: '0 0 0 4px #fbe3dc' }} />
          I need help now
        </button>
      </div>

      {/* ─── Hero card ─── */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden flex flex-col md:flex-row justify-between p-8 md:p-10 rounded-sm border"
        style={{ minHeight: 316, background: '#e5f0e2', borderColor: '#d3e4d2', boxShadow: '0 18px 38px rgba(65,92,71,.08)' }}
      >
        <div className="max-w-[395px] z-10">
          <div className="eyebrow flex items-center gap-2 mb-5" style={{ color: '#709174' }}>
            <ShieldCheck size={15} /> YOUR PRIVATE JOURNEY
          </div>
          <h2 className="serif-heading text-[clamp(43px,5vw,62px)] mb-4">
            Small steps<br /><em>count.</em>
          </h2>
          <p className="text-[13px] leading-relaxed mb-7" style={{ color: '#6e8274' }}>
            Milestones are chapters, not streaks. You are building something steady, one honest check-in at a time.
          </p>
          <button
            onClick={() => navigate('/checkin')}
            className="inline-flex items-center gap-6 px-5 py-3.5 text-xs font-semibold text-white rounded-lg"
            style={{ background: 'var(--green)', boxShadow: '0 6px 12px #4d755b2b' }}
          >
            Begin today's check-in <ArrowRight size={17} />
          </button>
        </div>
        {/* Organic art shapes */}
        <div className="hidden md:block relative w-[42%]" aria-hidden="true">
          <div className="absolute rounded-full opacity-85" style={{ width: 230, height: 230, top: 2, right: 42, background: '#f4c8a5' }} />
          <div className="absolute rounded-full border" style={{ width: 330, height: 120, top: 60, right: -2, borderColor: '#8eb49b', transform: 'rotate(-25deg)' }} />
          <div className="absolute rounded-full border" style={{ width: 270, height: 230, top: 1, right: 29, borderColor: '#8eb49b', transform: 'rotate(28deg)' }} />
          <div className="absolute opacity-80" style={{ width: 105, height: 57, borderRadius: '100% 0 100% 0', background: '#81a77f', transform: 'rotate(-29deg)', top: 136, right: 158 }} />
          <div className="absolute opacity-80" style={{ width: 75, height: 42, borderRadius: '100% 0 100% 0', background: '#a7c29a', transform: 'rotate(38deg)', top: 71, right: 8 }} />
          <span className="absolute right-6 bottom-1 text-right uppercase leading-snug" style={{ color: '#719178', fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: '.08em' }}>
            a grounded<br />place to return to
          </span>
        </div>
      </motion.section>

      {/* ─── Recent Reflections ─── */}
      <div className="flex justify-between items-end mt-12 mb-5">
        <div>
          <p className="eyebrow mb-1">YOUR JOURNEY</p>
          <h3 className="serif-heading text-[27px] font-semibold" style={{ letterSpacing: '-0.03em' }}>Recent reflections</h3>
        </div>
        <button onClick={() => navigate('/journal')} className="inline-flex items-center gap-1.5 text-xs" style={{ color: '#718b79' }}>
          View all <ArrowRight size={15} />
        </button>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {recentEntries.length === 0 ? (
          <div className="md:col-span-3 text-center py-16 rounded-sm border" style={{ background: 'var(--paper)', borderColor: 'var(--line)' }}>
            <p className="text-sm" style={{ color: '#8b958d' }}>No entries yet. Begin your first check-in.</p>
          </div>
        ) : (
          recentEntries.map((entry, idx) => {
            const tone = entryTones[idx % entryTones.length];
            const toneStyles = {
              sun: { bg: '#fff9ed', border: '#f1e6cc' },
              lavender: { bg: '#f8f6fb', border: '#e7e2ef' },
              mint: { bg: '#f3faf1', border: '#dcebd9' }
            };
            const s = toneStyles[tone];
            return (
              <article key={entry.id} className="min-h-[189px] p-5 rounded-sm border" style={{ background: s.bg, borderColor: s.border }}>
                <div className="flex justify-between items-center">
                  <span className="eyebrow">{new Date(entry.timestamp).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  <span className="eyebrow flex items-center gap-1.5" style={{ color: '#6e9273' }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#94c194' }} /> {entry.mood}
                  </span>
                </div>
                {entry.triggerCategory && (
                  <p className="mt-7 mb-1.5 text-xs font-semibold" style={{ color: '#6e806f' }}>{entry.triggerCategory}</p>
                )}
                {entry.note && (
                  <p className="text-xs leading-relaxed mb-3" style={{ color: '#6f7972' }}>{entry.note}</p>
                )}
                <button className="text-[10px] inline-flex items-center gap-1" style={{ color: '#6f9777' }}>
                  Read reflection <ChevronRight size={14} />
                </button>
              </article>
            );
          })
        )}
      </section>

      {/* ─── Module Grid ─── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
        <button onClick={() => navigate('/breathe')} className="flex items-center gap-3 text-left p-4 border rounded-sm bg-white/60 cursor-pointer transition-all hover:-translate-y-0.5 hover:border-[var(--green)] hover:bg-[#fffdf7]" style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}>
          <span className="grid place-items-center w-9 h-9 rounded-full" style={{ color: '#7b6ca8', background: '#eee9fb' }}>
            <Sparkles size={18} />
          </span>
          <span className="flex-1">
            <b className="block text-[13px] font-bold">Reset with breath</b>
            <small className="block mt-0.5 text-[11px]" style={{ color: 'var(--muted-foreground)' }}>4–7–8 guided practice</small>
          </span>
          <ArrowRight size={16} />
        </button>
        <button onClick={() => navigate('/resources')} className="flex items-center gap-3 text-left p-4 border rounded-sm bg-white/60 cursor-pointer transition-all hover:-translate-y-0.5 hover:border-[var(--green)] hover:bg-[#fffdf7]" style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}>
          <span className="grid place-items-center w-9 h-9 rounded-full" style={{ color: 'var(--green)', background: '#e4eee6' }}>
            <ShieldCheck size={18} />
          </span>
          <span className="flex-1">
            <b className="block text-[13px] font-bold">Verified resources</b>
            <small className="block mt-0.5 text-[11px]" style={{ color: 'var(--muted-foreground)' }}>Support when you need it</small>
          </span>
          <ArrowRight size={16} />
        </button>
        <button onClick={() => navigate('/goals')} className="flex items-center gap-3 text-left p-4 border rounded-sm bg-white/60 cursor-pointer transition-all hover:-translate-y-0.5 hover:border-[var(--green)] hover:bg-[#fffdf7]" style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}>
          <span className="grid place-items-center w-9 h-9 rounded-full" style={{ color: '#a46836', background: '#f5e8d8' }}>
            <Leaf size={18} />
          </span>
          <span className="flex-1">
            <b className="block text-[13px] font-bold">Quiet milestones</b>
            <small className="block mt-0.5 text-[11px]" style={{ color: 'var(--muted-foreground)' }}>No streaks. Just progress.</small>
          </span>
          <ArrowRight size={16} />
        </button>
      </section>

      {/* ─── Bottom cards ─── */}
      <section className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-3.5 mt-3.5">
        <div className="flex items-center gap-4 min-h-[104px] p-5 border rounded-sm" style={{ borderColor: 'var(--line)', background: '#fbfcf8' }}>
          <div className="grid place-items-center w-10 h-10 rounded-full" style={{ color: '#709675', background: '#e8f2e4' }}>
            <Sparkles size={18} />
          </div>
          <div className="flex-1">
            <p className="eyebrow mb-1">YOUR COPING PLAN</p>
            <h3 className="serif-heading text-[20px] font-semibold" style={{ letterSpacing: '-0.03em' }}>Three things that help</h3>
            <p className="mt-1.5 text-[11px] leading-snug" style={{ color: '#8b978d' }}>Notice the urge. Name what you need. Choose the next kind action.</p>
          </div>
          <button onClick={() => navigate('/triggers')} className="grid place-items-center w-8 h-8 rounded-full" style={{ color: '#75957d', background: '#edf4eb' }}>
            <ArrowRight size={17} />
          </button>
        </div>
        <div className="flex items-center gap-4 min-h-[104px] p-5 rounded-sm border" style={{ background: '#f1f7ef', borderColor: '#dceadb', color: '#6f9374' }}>
          <KeyRound size={20} />
          <div className="flex-1">
            <strong className="block text-xs" style={{ color: '#506b58' }}>Your space is yours.</strong>
            <p className="mt-1.5 text-[11px] leading-snug" style={{ color: '#8b978d' }}>Entries are encrypted and stored only on this device.</p>
          </div>
          <ShieldCheck size={20} style={{ color: '#8eb392' }} />
        </div>
      </section>

      {/* ─── Smartwatch Simulator ─── */}
      <section className="mt-6">
        <SmartwatchSimulator />
      </section>

    </div>
  );
}
