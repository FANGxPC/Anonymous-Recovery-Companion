import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useVault } from './context/VaultContext';
import brain from './brain';
import { BottomNav } from './components/BottomNav';
import { GeminiChatbot } from './components/GeminiChatbot';

import { Onboarding } from './pages/Onboarding';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { CheckIn } from './pages/CheckIn';
import { Crisis } from './pages/Crisis';
import { Journal } from './pages/Journal';
import { Goals } from './pages/Goals';
import { Triggers } from './pages/Triggers';
import { Resources } from './pages/Resources';
import { Settings } from './pages/Settings';
import { Breathe } from './pages/Breathe';

function App() {
  const { isSetup, isAuthenticated } = useVault();
  const navigate = useNavigate();
  const location = useLocation();

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
    return <div className="flex-1 flex items-center justify-center min-h-screen text-muted-foreground">Loading secure vault...</div>;
  }

  // Do not show the chat button on onboarding/login or crisis
  const showChatbot = isAuthenticated && location.pathname !== '/crisis' && location.pathname !== '/';

  return (
    <>
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
      <Route 
        path="/journal" 
        element={isAuthenticated ? <Journal /> : <Navigate to="/" />} 
      />
      <Route 
        path="/goals" 
        element={isAuthenticated ? <Goals /> : <Navigate to="/" />} 
      />
      <Route 
        path="/triggers" 
        element={isAuthenticated ? <Triggers /> : <Navigate to="/" />} 
      />
      <Route 
        path="/resources" 
        element={isAuthenticated ? <Resources /> : <Navigate to="/" />} 
      />
      <Route 
        path="/settings" 
        element={isAuthenticated ? <Settings /> : <Navigate to="/" />} 
      />
      <Route 
        path="/breathe" 
        element={<Breathe />} 
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
    
    <BottomNav />
    {showChatbot && <GeminiChatbot />}
    </>
  );
}

export default App;
