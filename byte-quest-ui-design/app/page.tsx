'use client'

import { useState } from 'react'
import {
  Activity,
  ArrowRight,
  Bell,
  Check,
  ChevronRight,
  CircleHelp,
  HeartHandshake,
  KeyRound,
  Leaf,
  LockKeyhole,
  LogOut,
  Menu,
  Phone,
  Plus,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'

const entries = [
  { day: 'Today', mood: 'Good', trigger: 'Social pressure', note: 'I took a walk before the meeting and felt more present.', tone: 'sun' },
  { day: 'Yesterday', mood: 'Okay', trigger: 'Stress or overwhelm', note: 'Naming the feeling helped it feel less permanent.', tone: 'lavender' },
  { day: 'Mon, Jun 10', mood: 'Great', trigger: 'None', note: 'A quiet morning and a good conversation with a friend.', tone: 'mint' },
]

export default function Home() {
  const [active, setActive] = useState('Overview')
  const [showCheckIn, setShowCheckIn] = useState(false)
  const [crisis, setCrisis] = useState(false)

  return (
    <main className="anchor-app">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark"><Leaf size={19} /></span><span>anchor</span></div>
        <div className="privacy-pill"><LockKeyhole size={13} /> private on this device</div>
        <nav aria-label="Main navigation">
          {['Overview', 'Daily check-in', 'Journal', 'Goals', 'Triggers', 'Resources', 'Breathe'].map((item) => (
            <button key={item} className={active === item ? 'nav-item active' : 'nav-item'} onClick={() => { setActive(item); if (item === 'Daily check-in') setShowCheckIn(true) }}>
              {item === 'Overview' ? <Activity size={17} /> : item === 'Daily check-in' ? <Plus size={17} /> : item === 'Journal' ? <HeartHandshake size={17} /> : item === 'Breathe' ? <Sparkles size={17} /> : <Leaf size={17} />}
              {item}<ChevronRight className="nav-arrow" size={15} />
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="nav-item muted"><CircleHelp size={17} /> How Anchor works</button>
          <button className="nav-item muted"><Bell size={17} /> Notifications</button>
          <div className="profile"><div className="avatar">J</div><div><strong>Just for me</strong><span>Local vault</span></div><button aria-label="Lock screen"><LogOut size={16} /></button></div>
        </div>
      </aside>

      <section className="content">
        <header className="topbar"><button className="mobile-menu" aria-label="Open menu"><Menu size={20} /></button><div className="breadcrumb">My space <span>/</span> {active}</div><div className="top-actions"><span className="safe-status"><span className="status-dot" /> All data encrypted</span><button className="icon-btn" aria-label="Notifications"><Bell size={18} /></button></div></header>

        {crisis ? <CrisisPanel onClose={() => setCrisis(false)} /> : showCheckIn ? <CheckIn onClose={() => setShowCheckIn(false)} /> : <>
          <div className="welcome-row"><div><p className="eyebrow">Monday, June 17, 2024</p><h1>Welcome back, <em>friend.</em></h1><p className="subhead">This is your space to pause, notice, and keep moving forward.</p></div><button className="crisis-button" onClick={() => setCrisis(true)}><span className="pulse" /> I need help now</button></div>

          <section className="hero-card"><div className="hero-copy"><div className="mini-label"><ShieldCheck size={15} /> YOUR PRIVATE JOURNEY</div><h2>Small steps<br /><em>count.</em></h2><p>Milestones are chapters, not streaks. You are building something steady, one honest check-in at a time.</p><button className="primary-btn" onClick={() => setShowCheckIn(true)}>Begin today&apos;s check-in <ArrowRight size={17} /></button></div><div className="hero-art" aria-hidden="true"><div className="sun-disc" /><div className="leaf-shape leaf-one" /><div className="leaf-shape leaf-two" /><div className="line-orbit orbit-one" /><div className="line-orbit orbit-two" /><span className="art-caption">a grounded<br />place to return to</span></div></section>

          <div className="section-heading"><div><p className="eyebrow">YOUR JOURNEY</p><h3>Recent reflections</h3></div><button className="text-button">View all <ArrowRight size={15} /></button></div>
          <section className="entry-grid">{entries.map((entry) => <article className={`entry-card ${entry.tone}`} key={entry.day}><div className="entry-top"><span className="entry-date">{entry.day}</span><span className="mood-tag"><span /> {entry.mood}</span></div><p className="entry-trigger">{entry.trigger}</p><p className="entry-note">{entry.note}</p><button className="entry-link">Read reflection <ChevronRight size={14} /></button></article>)}</section>

          <section className="module-grid"><button className="module-card" onClick={() => setActive('Breathe')}><span className="module-mark breathe-mark"><Sparkles size={18} /></span><span><b>Reset with breath</b><small>4–7–8 guided practice</small></span><ArrowRight size={16} /></button><button className="module-card" onClick={() => setActive('Resources')}><span className="module-mark resource-mark"><ShieldCheck size={18} /></span><span><b>Verified resources</b><small>Support when you need it</small></span><ArrowRight size={16} /></button><button className="module-card" onClick={() => setActive('Goals')}><span className="module-mark goal-mark"><Leaf size={18} /></span><span><b>Quiet milestones</b><small>No streaks. Just progress.</small></span><ArrowRight size={16} /></button></section><section className="bottom-grid"><div className="plan-card"><div className="plan-icon"><Sparkles size={18} /></div><div><p className="eyebrow">YOUR COPING PLAN</p><h3>Three things that help</h3><p>Notice the urge. Name what you need. Choose the next kind action.</p></div><button className="round-arrow" aria-label="Open coping plan"><ArrowRight size={17} /></button></div><div className="security-card"><KeyRound size={20} /><div><strong>Your space is yours.</strong><p>Entries are encrypted and stored only on this device.</p></div><ShieldCheck className="security-check" size={20} /></div></section><button className="assistant-pill" aria-label="Open Anchor companion"><span className="assistant-orb"><Sparkles size={14} /></span><span><b>Anchor companion</b><small>Here when you need a little help</small></span><ChevronRight size={15} /></button>\n        </>}
      </section>
    </main>
  )
}

function CheckIn({ onClose }: { onClose: () => void }) { return <div className="checkin-shell"><button className="back-link" onClick={onClose}><X size={16} /> Close</button><div className="checkin-header"><p className="eyebrow">A MOMENT FOR YOU</p><h2>How are you feeling<br /><em>today?</em></h2><p>There is no right answer. Just notice what is true right now.</p></div><div className="mood-grid">{['Great', 'Good', 'Okay', 'Low', 'Crisis'].map((m, i) => <button className={i === 1 ? 'mood-choice selected' : 'mood-choice'} key={m}><span>{['☀', '◒', '○', '◡', '△'][i]}</span>{m}</button>)}</div><div className="journal-box"><label htmlFor="note">A private note <span>optional</span></label><textarea id="note" placeholder="What is on your mind? This stays on your device." /></div><button className="primary-btn wide" onClick={onClose}>Save & get support <ArrowRight size={17} /></button></div> }
function CrisisPanel({ onClose }: { onClose: () => void }) { return <div className="crisis-panel"><div className="crisis-symbol">!</div><p className="eyebrow">YOU DESERVE SUPPORT</p><h2>You are not alone.</h2><p>Help is available right now. These services are free, confidential, and open 24/7.</p><a className="call-btn" href="tel:988"><Phone size={19} /> Call 988 Lifeline <ArrowRight size={16} /></a><a className="secondary-call" href="sms:988">Text 988</a><button className="back-link" onClick={onClose}>I&apos;m safe now — return to my space</button></div> }
