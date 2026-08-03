import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  apiKey: string;
  provider: 'openai' | 'gemini' | 'deepseek';
  setApiKey: (key: string) => void;
  setProvider: (p: 'openai' | 'gemini' | 'deepseek') => void;
  resetApiKey: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      apiKey: '',
      provider: 'openai',
      setApiKey: (key) => set({ apiKey: key }),
      setProvider: (p) => set({ provider: p }),
      resetApiKey: () => set({ apiKey: '' }),
    }),
    { name: 'nexvi-settings' }
  )
);