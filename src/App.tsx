import { HashRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from '@/i18n/LanguageContext';
import HomePage from '@/pages/HomePage';
import TripWizard from '@/pages/TripWizard';
import TripEditPage from '@/pages/TripEditPage';
import SettingsPage from '@/pages/SettingsPage';

function App() {
  return (
    <LanguageProvider>
      <HashRouter>
        <div className="min-h-screen bg-gray-50 text-gray-900">
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
