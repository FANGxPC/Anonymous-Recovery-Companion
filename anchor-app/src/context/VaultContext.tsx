import React, { createContext, useContext, useState, useEffect } from 'react';
import { isSetupComplete } from '../vault/db';

interface VaultContextType {
  // Authentication status
  isSetup: boolean | null;
  isAuthenticated: boolean;
  
  // The actual key object (kept in memory, never in localStorage/IndexedDB)
  cryptoKey: CryptoKey | null;
  
  // Actions
  login: (key: CryptoKey) => void;
  logout: () => void;
  checkSetupStatus: () => Promise<void>;
}

const VaultContext = createContext<VaultContextType | null>(null);

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const [isSetup, setIsSetup] = useState<boolean | null>(null);
  const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null);

  const checkSetupStatus = async () => {
    try {
      const setup = await isSetupComplete();
      setIsSetup(setup);
    } catch (err) {
      console.error('Failed to check setup status', err);
      setIsSetup(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    checkSetupStatus();
  }, []);

  const login = (key: CryptoKey) => {
    setCryptoKey(key);
  };

  const logout = () => {
    setCryptoKey(null);
  };

  return (
    <VaultContext.Provider
      value={{
        isSetup,
        isAuthenticated: !!cryptoKey,
        cryptoKey,
        login,
        logout,
        checkSetupStatus,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useVault() {
  const ctx = useContext(VaultContext);
  if (!ctx) {
    throw new Error('useVault must be used within a VaultProvider');
  }
  return ctx;
}
