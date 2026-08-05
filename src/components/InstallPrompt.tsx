import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { useTranslation } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/Button';
import { NexviMark } from '@/components/NexviMark';

const DISMISSED_KEY = 'nexvi-install-dismissed';

// Not in the standard DOM lib — Chrome/Edge/Android fire this instead of the
// plain Event type when the page qualifies for installation.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari's own (non-standard) flag for "already added to home screen"
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent);
}

export function InstallPrompt() {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(DISMISSED_KEY) === '1'; } catch { return false; }
  });
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    if (isStandalone() || dismissed) return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);

    // iOS never fires beforeinstallprompt — offer the manual instructions instead.
    if (isIos()) setShowIosHint(true);

    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, [dismissed]);

  const dismiss = () => {
    setDismissed(true);
    try { localStorage.setItem(DISMISSED_KEY, '1'); } catch { /* private mode etc. — fine to just not persist */ }
  };

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    dismiss();
  };

  if (dismissed || (!deferredPrompt && !showIosHint)) return null;

  return (
    <div className="nx-fade-in flex items-start gap-3 bg-brand-soft border border-brand/20 rounded-2xl p-4 mb-6">
      <NexviMark className="w-9 h-9 text-brand shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-ink">{t('install.title')}</p>
        <p className="text-sm text-ink-soft mt-0.5">{deferredPrompt ? t('install.body') : t('install.iosBody')}</p>
        {deferredPrompt && (
          <div className="flex items-center gap-2 mt-3">
            <Button size="sm" onClick={install}><Download className="w-4 h-4 mr-1.5" />{t('install.installButton')}</Button>
            <Button size="sm" variant="ghost" onClick={dismiss}>{t('install.dismiss')}</Button>
          </div>
        )}
      </div>
      <button type="button" onClick={dismiss} className="text-ink-faint hover:text-ink-soft shrink-0" aria-label={t('install.dismiss')}>
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
