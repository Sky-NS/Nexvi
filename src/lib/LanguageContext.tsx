import { createContext, useContext, useMemo, ReactNode } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { dictionaries, DEFAULT_LANGUAGE, LANGUAGE_NAMES, SUPPORTED_LANGUAGES } from './translations';

function detectSystemLanguage(): string {
  if (typeof navigator === 'undefined') return DEFAULT_LANGUAGE;
  const langs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
  for (const raw of langs) {
    const short = (raw || '').toLowerCase().split('-')[0];
    if (SUPPORTED_LANGUAGES.some((l) => l.code === short)) return short;
  }
  return DEFAULT_LANGUAGE;
}

export function resolveLanguage(setting: string): string {
  if (setting === 'system' || !setting) return detectSystemLanguage();
  if (dictionaries[setting]) return setting;
  return DEFAULT_LANGUAGE;
}

interface LanguageContextValue {
  language: string;
  languageName: string;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: DEFAULT_LANGUAGE,
  languageName: LANGUAGE_NAMES[DEFAULT_LANGUAGE],
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const languageSetting = useSettingsStore((s) => s.language);
  const language = useMemo(() => resolveLanguage(languageSetting), [languageSetting]);

  const value = useMemo<LanguageContextValue>(() => {
    const dict = dictionaries[language] || dictionaries[DEFAULT_LANGUAGE];
    const fallback = dictionaries[DEFAULT_LANGUAGE];
    const t = (key: string, vars?: Record<string, string | number>) => {
      let str = dict[key] ?? fallback[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        }
      }
      return str;
    };
    return { language, languageName: LANGUAGE_NAMES[language] || language, t };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation() {
  return useContext(LanguageContext);
}
