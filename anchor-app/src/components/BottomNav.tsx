import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Activity, Plus, Sparkles, AlertCircle, Book } from 'lucide-react';
import { useVault } from '../context/VaultContext';

export function BottomNav() {
  const { isAuthenticated } = useVault();
  const location = useLocation();

  if (!isAuthenticated) return null;
  if (location.pathname === '/crisis' || location.pathname === '/') return null;

  const links = [
    { to: '/dashboard', icon: <Activity className="w-5 h-5" />, label: 'Overview' },
    { to: '/journal', icon: <Book className="w-5 h-5" />, label: 'Journal' },
    { 
      to: '/checkin', 
      icon: <Plus className="w-6 h-6" />, 
      label: 'Log', 
      primary: true 
    },
    { to: '/breathe', icon: <Sparkles className="w-5 h-5" />, label: 'Breathe' },
    { 
      to: '/crisis', 
      icon: <AlertCircle className="w-5 h-5" />, 
      label: 'Crisis',
      danger: true
    },
  ];

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 border-t z-50 px-2 pb-safe pt-2 sm:hidden"
      style={{ background: 'rgba(247,248,243,0.95)', backdropFilter: 'blur(12px)', borderColor: 'var(--line)' }}
    >
      <div className="flex items-center justify-between max-w-md mx-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `
              flex flex-col items-center justify-center w-full py-1 gap-1 transition-colors
              ${link.primary 
                ? 'transform -translate-y-2' 
                : link.danger
                  ? 'opacity-80 hover:opacity-100'
                  : ''
              }
            `}
            style={({ isActive }) => ({
              color: link.primary 
                ? undefined
                : link.danger 
                  ? '#b2614f'
                  : isActive 
                    ? 'var(--green)' 
                    : '#758078'
            })}
          >
            {link.primary ? (
              <div 
                className="p-3 rounded-xl shadow-lg"
                style={{ background: 'var(--green)', color: '#fff', borderRadius: '11px 11px 11px 3px', transform: 'rotate(-4deg)' }}
              >
                <span style={{ display: 'block', transform: 'rotate(4deg)' }}>{link.icon}</span>
              </div>
            ) : (
              link.icon
            )}
            <span className="text-[10px] font-medium">{link.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
