import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Info, ChevronDown, ChevronUp } from 'lucide-react';
import type { SupportResponse } from '../brain/contracts';
import { getResourceStatus } from '../blockchain/registry';
import type { ResourceInfo } from '../blockchain/registry';
import { ShieldAlert, ShieldX } from 'lucide-react';

interface Props {
  response: SupportResponse;
}

export function SupportResponseCard({ response }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [registryInfo, setRegistryInfo] = useState<ResourceInfo | null>(null);

  React.useEffect(() => {
    if (!response.source) return;
    
    // In a real production system, the RAG chunks would contain the exact registry IDs.
    // For the hackathon demo, we map the text title to the ID we deployed.
    let id = "unknown-resource";
    const src = response.source.toLowerCase();
    if (src.includes('988') || src.includes('lifeline')) id = '988-lifeline';
    if (src.includes('samhsa')) id = 'samhsa-helpline';
    if (src.includes('outdated')) id = 'outdated-clinic';

    getResourceStatus(id).then(setRegistryInfo);
  }, [response.source]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card mt-4"
    >
      <div className="flex-between mb-4">
        <h3 className="text-accent flex-center" style={{ gap: '0.5rem', marginBottom: 0 }}>
          <Info size={20} />
          Suggested Strategy
        </h3>
        
        {/* Verification Badge (from Person C's blockchain registry) */}
        {registryInfo && registryInfo.status === 'Verified' && (
          <div 
            className="flex-center" 
            style={{ 
              gap: '0.25rem', 
              fontSize: '0.75rem', 
              backgroundColor: '#dcfce7', 
              color: 'var(--accent-success)',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              border: '1px solid #86efac'
            }}
            title={`Cryptographically verified on-chain at ${registryInfo.date?.toLocaleDateString()}`}
          >
            <ShieldCheck size={14} />
            <span>Verified Source</span>
          </div>
        )}
        
        {registryInfo && registryInfo.status === 'Revoked' && (
          <div 
            className="flex-center" 
            style={{ 
              gap: '0.25rem', 
              fontSize: '0.75rem', 
              backgroundColor: '#fee2e2', 
              color: 'var(--accent-danger)',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              border: '1px solid #fca5a5'
            }}
            title="WARNING: This resource's verification has been revoked on-chain."
          >
            <ShieldX size={14} />
            <span>Revoked Source</span>
          </div>
        )}

        {(!registryInfo || registryInfo.status === 'Unknown') && (
          <div 
            className="flex-center" 
            style={{ 
              gap: '0.25rem', 
              fontSize: '0.75rem', 
              backgroundColor: '#f1f5f9', 
              color: 'var(--text-tertiary)',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              border: '1px solid var(--border-color)'
            }}
            title="This source is not present in the blockchain registry."
          >
            <ShieldAlert size={14} />
            <span>Unverified Source</span>
          </div>
        )}
      </div>

      <p style={{ whiteSpace: 'pre-line' }}>{response.text}</p>

      {response.source && (
        <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <button 
            className="flex-between w-full"
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex-center" style={{ gap: '0.5rem', fontSize: '0.875rem' }}>
              <strong>Source:</strong> {response.source}
            </div>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          <AnimatePresence>
            {isExpanded && response.excerpt && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <div 
                  style={{ 
                    marginTop: '1rem', 
                    padding: '1rem', 
                    backgroundColor: 'var(--bg-surface)', 
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem',
                    color: 'var(--text-tertiary)',
                    borderLeft: '2px solid var(--text-secondary)'
                  }}
                >
                  "{response.excerpt}"
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
