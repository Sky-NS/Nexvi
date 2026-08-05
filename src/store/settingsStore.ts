import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  apiKey: string;
  provider: 'openai' | 'gemini' | 'deepseek';
  preferredCurrency: string;
  language: string;
  theme: string;
  setApiKey: (key: string) => void;
  setProvider: (p: 'openai' | 'gemini' | 'deepseek') => void;
  setPreferredCurrency: (code: string) => void;
  setLanguage: (lang: string) => void;
  setTheme: (theme: string) => void;
  resetApiKey: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      apiKey: '',
      provider: 'openai',
      preferredCurrency: 'USD',
      language: 'system',
      theme: 'system',
      setApiKey: (key) => set({ apiKey: key }),
      setProvider: (p) => set({ provider: p }),
      setPreferredCurrency: (code) => set({ preferredCurrency: code }),
      setLanguage: (lang) => set({ language: lang }),
      setTheme: (theme) => set({ theme }),
      resetApiKey: () => set({ apiKey: '' }),
    }),
    { name: 'nexvi-settings' }
  )
);
