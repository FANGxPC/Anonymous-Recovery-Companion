import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Book, PlusCircle, Wind, AlertCircle } from 'lucide-react';
import { useVault } from '../context/VaultContext';

export function BottomNav() {
  const { isAuthenticated } = useVault();
  const location = useLocation();

  if (!isAuthenticated) return null;

  // Don't show bottom nav on the crisis page or onboarding/login
  if (location.pathname === '/crisis' || location.pathname === '/') return null;

  const links = [
    { to: '/dashboard', icon: <Home className="w-5 h-5" />, label: 'Home' },
    { to: '/journal', icon: <Book className="w-5 h-5" />, label: 'Journal' },
    { 
      to: '/checkin', 
      icon: <PlusCircle className="w-6 h-6" />, 
      label: 'Log', 
      primary: true 
    },
    { to: '/breathe', icon: <Wind className="w-5 h-5" />, label: 'Breathe' },
    { 
      to: '/crisis', 
      icon: <AlertCircle className="w-5 h-5" />, 
      label: 'Crisis',
      danger: true
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur z-50 px-2 pb-safe pt-2 sm:hidden">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `
              flex flex-col items-center justify-center w-full py-1 gap-1
              ${link.primary 
                ? 'text-primary transform -translate-y-2' 
                : link.danger
                  ? 'text-destructive opacity-80 hover:opacity-100'
                  : isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
              }
            `}
          >
            {link.primary ? (
              <div className="bg-primary text-primary-foreground p-3 rounded-full shadow-lg">
                {link.icon}
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
