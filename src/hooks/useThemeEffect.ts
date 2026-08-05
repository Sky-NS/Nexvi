import { useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';

function resolveIsDark(theme: string): boolean {
  if (theme === 'dark') return true;
  if (theme === 'light') return false;
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme(isDark: boolean) {
  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
}

// Keeps <html class="dark"> in sync with the theme setting. When the setting
// is "system", also listens for the OS preference changing live (e.g. the
// user's device switches to dark mode at sunset) and re-applies immediately.
export function useThemeEffect() {
  const theme = useSettingsStore((s) => s.theme);

  useEffect(() => {
    applyTheme(resolveIsDark(theme));

    if (theme === 'system' && typeof window !== 'undefined') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const onChange = () => applyTheme(resolveIsDark(theme));
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    }
  }, [theme]);
}
