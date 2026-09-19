import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useVault } from './context/VaultContext';
import brain from './brain';

import { Onboarding } from './pages/Onboarding';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { CheckIn } from './pages/CheckIn';
import { Crisis } from './pages/Crisis';

function App() {
  const { isSetup, isAuthenticated } = useVault();
  const navigate = useNavigate();

  // Global Crisis Listeners
  useEffect(() => {
    const handleCrisis = (source: string) => {
      console.warn(`Crisis detected via ${source}. Escalating to emergency pathway.`);
      navigate('/crisis');
    };
    brain.onCrisis(handleCrisis);

    // 2. Keyboard Shortcut (Ctrl/Cmd + Shift + H)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        navigate('/crisis');
      }
    };

    // 3. Hardware Button Event Listener
    const handleHardwareCrisis = (e: Event) => {
      const source = (e as CustomEvent).detail || 'hardware_button';
      handleCrisis(source);
    };
    window.addEventListener('anchor-hardware-crisis', handleHardwareCrisis);

    return () => {
      brain.offCrisis(handleCrisis);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('anchor-hardware-crisis', handleHardwareCrisis);
    };
  }, [navigate]);

  // Loading state while checking IndexedDB
  if (isSetup === null) {
    return <div className="flex-center" style={{ minHeight: '100vh' }}>Loading secure vault...</div>;
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          isSetup ? (
            isAuthenticated ? <Navigate to="/dashboard" /> : <Login />
          ) : (
            <Onboarding />
          )
        } 
      />
      <Route 
        path="/dashboard" 
        element={isAuthenticated ? <Dashboard /> : <Navigate to="/" />} 
      />
      <Route 
        path="/checkin" 
        element={isAuthenticated ? <CheckIn /> : <Navigate to="/" />} 
      />
      <Route 
        path="/crisis" 
        element={<Crisis />} 
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
