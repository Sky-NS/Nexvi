import { HashRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from '@/i18n/LanguageContext';
import { useThemeEffect } from '@/hooks/useThemeEffect';
import HomePage from '@/pages/HomePage';
import TripWizard from '@/pages/TripWizard';
import TripEditPage from '@/pages/TripEditPage';
import SettingsPage from '@/pages/SettingsPage';

function App() {
  useThemeEffect();

  return (
    <LanguageProvider>
      <HashRouter>
        <div className="min-h-screen bg-bg text-ink">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/wizard" element={<TripWizard />} />
            <Route path="/trip/:id" element={<TripEditPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </HashRouter>
    </LanguageProvider>
  );
}
export default App;
