import React, { useState, useEffect } from 'react';
import { ShieldCheck, ExternalLink, Activity, AlertTriangle, KeyRound } from 'lucide-react';
import { getResourceStatus } from '../blockchain/registry';

interface Resource {
  id: string;
  name: string;
  url: string;
  status: 'Unknown' | 'Verified' | 'Revoked';
  date: Date | null;
}

export function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  const resourceIdsToQuery = [
    '988-lifeline',
    'samhsa-helpline',
    'outdated-clinic'
  ];

  useEffect(() => {
    async function loadResources() {
      const results = await Promise.all(
        resourceIdsToQuery.map(async id => {
          const status = await getResourceStatus(id);
          return { id, ...status };
        })
      );
      setResources(results);
      setLoading(false);
    }
    loadResources();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex-1 w-full max-w-[900px] mx-auto px-4 md:px-16 pb-24">
      <header className="h-[86px] flex items-center border-b" style={{ borderColor: 'var(--line)' }}>
        <span className="eyebrow">My space <span className="mx-2" style={{ color: '#c2cac2' }}>/</span> Resources</span>
      </header>

      <div className="py-10">
        <p className="eyebrow mb-2">SAFE & VERIFIED</p>
        <h1 className="serif-heading text-[clamp(36px,5vw,56px)]">
          Trusted <em>resources.</em>
        </h1>
        <p className="mt-3 text-sm" style={{ color: '#859088' }}>Cryptographically verified crisis contacts.</p>
      </div>

      <div className="flex items-start md:items-center gap-4 min-h-[104px] p-5 rounded-sm border mb-8" style={{ background: '#f1f7ef', borderColor: '#dceadb', color: '#6f9374' }}>
        <KeyRound size={20} className="mt-1 md:mt-0" />
        <div className="flex-1">
          <strong className="block text-xs" style={{ color: '#506b58' }}>Blockchain verification.</strong>
          <p className="mt-1.5 text-[11px] leading-snug" style={{ color: '#8b978d' }}>These helplines are verified via an Ethereum smart contract registry. This prevents bad actors from injecting fake or scam treatment centers.</p>
        </div>
        <ShieldCheck size={20} className="hidden md:block" style={{ color: '#8eb392' }} />
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <Activity className="w-8 h-8 animate-spin" style={{ color: 'var(--green)' }} />
        </div>
      ) : (
        <div className="space-y-4">
          {resources.map((resource) => (
            <div key={resource.id} className={`p-6 rounded-sm border transition-opacity ${resource.status === 'Revoked' ? 'opacity-60 grayscale' : ''}`} style={{ background: 'var(--paper)', borderColor: 'var(--line)' }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="serif-heading text-[24px] mb-2">{resource.name || resource.id}</h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {resource.status === 'Verified' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border" style={{ background: '#f3faf1', borderColor: '#dcebd9', color: 'var(--green)' }}>
                        <ShieldCheck size={14} /> Verified
                      </span>
                    )}
                    {resource.status === 'Revoked' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border" style={{ background: '#fff5f0', borderColor: '#f0d5cb', color: '#b2614f' }}>
                        <AlertTriangle size={14} /> Revoked
                      </span>
                    )}
                    {resource.status === 'Unknown' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border" style={{ background: '#f8f6fb', borderColor: '#e7e2ef', color: '#7b6ca8' }}>
                        Unknown Status
                      </span>
                    )}
                    {resource.date && (
                      <span style={{ color: '#8b978d' }}>
                        {resource.status === 'Revoked' ? 'Revoked on ' : 'Verified on '}
                        {resource.date.toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                
                <a 
                  href={resource.status === 'Revoked' ? undefined : resource.url}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-semibold rounded-sm transition-colors ${resource.status === 'Revoked' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{ 
                    background: resource.status === 'Revoked' ? '#e5f0e2' : 'var(--green)', 
                    color: resource.status === 'Revoked' ? '#728279' : '#fff' 
                  }}
                  onClick={(e) => resource.status === 'Revoked' && e.preventDefault()}
                >
                  Visit Resource <ExternalLink size={16} />
                </a>
              </div>
              
              {resource.status === 'Revoked' && (
                <div className="mt-4 p-3 text-xs rounded-sm border" style={{ color: '#b2614f', background: '#fff5f0', borderColor: '#f0d5cb' }}>
                  This resource was cryptographically revoked from the trusted registry and has been disabled to protect your safety.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
