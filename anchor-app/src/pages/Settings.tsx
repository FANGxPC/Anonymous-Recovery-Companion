import React, { useState } from 'react';
import { ShieldCheck, Download, Trash2, Shield, Smartphone, Server } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVault } from '../context/VaultContext';
import { getEntries, getGoals, cryptoShred } from '../vault/db';

export function Settings() {
  const navigate = useNavigate();
  const { cryptoKey, logout, isSetup } = useVault();
  const [isExporting, setIsExporting] = useState(false);
  const [isShredding, setIsShredding] = useState(false);

  const handleExport = async () => {
    if (!cryptoKey) return;
    setIsExporting(true);
    try {
      const entries = await getEntries(cryptoKey);
      const goals = await getGoals(cryptoKey);
      const data = { entries, goals, exportedAt: new Date().toISOString() };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `anchor_export_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  const handleShred = async () => {
    if (!confirm("CRITICAL WARNING: This will cryptographically shred your vault. All entries and goals will be permanently destroyed. Are you absolutely sure?")) return;
    setIsShredding(true);
    try {
      await cryptoShred();
      logout();
      navigate('/');
    } catch (err) {
      console.error(err);
      alert("Failed to shred vault");
    } finally {
      setIsShredding(false);
    }
  };

  return (
    <div className="flex-1 w-full max-w-[900px] mx-auto px-4 md:px-16 pb-24">
      <header className="h-[86px] flex items-center border-b" style={{ borderColor: 'var(--line)' }}>
        <span className="eyebrow">My space <span className="mx-2" style={{ color: '#c2cac2' }}>/</span> Settings</span>
      </header>

      <div className="py-10">
        <p className="eyebrow mb-2">PREFERENCES</p>
        <h1 className="serif-heading text-[clamp(36px,5vw,56px)]">
          Settings & <em>privacy.</em>
        </h1>
        <p className="mt-3 text-sm" style={{ color: '#859088' }}>Control your data, connections, and AI support.</p>
      </div>

      <div className="space-y-6">
        
        {/* Support Network */}
        <section className="p-6 rounded-sm border" style={{ background: 'var(--paper)', borderColor: 'var(--line)' }}>
          <div className="mb-5">
            <h3 className="serif-heading text-[24px]">Support Network</h3>
            <p className="text-sm mt-1" style={{ color: '#8b958d' }}>Who to contact when you need help.</p>
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold" style={{ color: '#506b58' }}>Trusted Contact Phone</label>
            <input 
              type="tel" 
              placeholder="+1 (555) 0123" 
              className="w-full px-4 py-3 text-sm border rounded-sm outline-none focus:border-[#8fb392] bg-transparent"
              style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
              defaultValue={localStorage.getItem('anchor_trusted_contact') || ''}
              onChange={(e) => localStorage.setItem('anchor_trusted_contact', e.target.value)}
            />
            <p className="text-[11px]" style={{ color: '#8b978d' }}>This number will be available as a quick-dial option during a crisis.</p>
          </div>
        </section>

        {/* AI Support Mode */}
        <section className="p-6 rounded-sm border" style={{ background: 'var(--paper)', borderColor: 'var(--line)' }}>
          <div className="mb-5">
            <h3 className="serif-heading text-[24px]">AI Support Mode</h3>
            <p className="text-sm mt-1" style={{ color: '#8b958d' }}>Configure how your insights are generated.</p>
          </div>
          <div className="space-y-3">
            <label className="flex items-start gap-4 p-4 border rounded-sm cursor-pointer transition-colors" style={{ background: '#e5f0e2', borderColor: '#bcd8bc' }}>
              <input type="radio" name="aiMode" className="mt-1" defaultChecked />
              <div>
                <div className="flex items-center gap-2" style={{ color: 'var(--green)' }}>
                  <Smartphone size={16} />
                  <span className="text-sm font-bold">Sealed Mode (Local)</span>
                </div>
                <p className="text-xs mt-1" style={{ color: '#6e8274' }}>Everything runs directly on your device. Maximum privacy. Requires more battery.</p>
              </div>
            </label>
            
            <label className="flex items-start gap-4 p-4 border rounded-sm cursor-not-allowed opacity-60" style={{ background: 'var(--cream)', borderColor: 'var(--line)' }}>
              <input type="radio" name="aiMode" className="mt-1" disabled />
              <div>
                <div className="flex items-center gap-2" style={{ color: '#506b58' }}>
                  <Server size={16} />
                  <span className="text-sm font-bold">Assisted Mode (Cloud)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-sm" style={{ background: '#dceadb' }}>Coming Soon</span>
                </div>
                <p className="text-xs mt-1" style={{ color: '#8b978d' }}>Faster responses via cloud API. Anonymizes data before sending.</p>
              </div>
            </label>
          </div>
        </section>

        {/* Gemini API Key */}
        <section className="p-6 rounded-sm border" style={{ background: '#f3faf1', borderColor: '#dcebd9' }}>
          <div className="mb-5">
            <h3 className="serif-heading text-[24px]" style={{ color: 'var(--green)' }}>Gemini Chat Companion</h3>
            <p className="text-sm mt-1" style={{ color: '#6e8274' }}>Enable the AI companion with a Gemini API key.</p>
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold" style={{ color: '#506b58' }}>Gemini API Key</label>
            <input 
              type="password" 
              placeholder="AIzaSy..." 
              className="w-full px-4 py-3 text-sm border rounded-sm outline-none focus:border-[#8fb392] bg-white"
              style={{ borderColor: '#dcebd9', color: 'var(--ink)' }}
              defaultValue={localStorage.getItem('anchor_gemini_key') || import.meta.env.VITE_GEMINI_API_KEY || ''}
              onChange={(e) => localStorage.setItem('anchor_gemini_key', e.target.value)}
            />
            <p className="text-[11px]" style={{ color: '#8b978d' }}>Your key is stored securely on this device and never shared.</p>
          </div>
        </section>

        {/* Hardware Button */}
        <section className="p-6 rounded-sm border" style={{ background: 'var(--paper)', borderColor: 'var(--line)' }}>
          <div className="mb-5">
            <h3 className="serif-heading text-[24px]">Physical Anchor Button</h3>
            <p className="text-sm mt-1" style={{ color: '#8b958d' }}>Connect an ESP32 Bluetooth button.</p>
          </div>
          <button className="w-full py-3 text-sm font-semibold rounded-sm border transition-colors hover:bg-[#e7e2ef]" style={{ color: '#7b6ca8', background: '#f8f6fb', borderColor: '#e7e2ef' }}>
            Pair via Bluetooth
          </button>
        </section>

        {/* Data & Privacy */}
        <section className="p-6 rounded-sm border" style={{ background: '#fff5f0', borderColor: '#f0d5cb' }}>
          <div className="mb-5 flex items-start gap-2 text-[#b2614f]">
            <Shield className="w-5 h-5 shrink-0 mt-1" />
            <div>
              <h3 className="serif-heading text-[24px]">Data & Privacy</h3>
              <p className="text-sm mt-1" style={{ color: '#a45f4d' }}>Export or permanently destroy your vault.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={handleExport} disabled={isExporting} className="flex-1 inline-flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-sm border" style={{ color: '#a45f4d', background: 'transparent', borderColor: '#e6c3b6' }}>
              <Download size={16} /> {isExporting ? 'Exporting...' : 'Export Vault'}
            </button>
            <button onClick={handleShred} disabled={isShredding} className="flex-1 inline-flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white rounded-sm" style={{ background: '#c96b54' }}>
              <Trash2 size={16} /> Shred Vault
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
