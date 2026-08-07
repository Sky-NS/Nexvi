import { useState } from 'react';
import { Download, X } from 'lucide-react';
import { useTranslation } from '@/i18n/LanguageContext';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { Button } from '@/components/ui/Button';
import { RoamvasMark } from '@/components/RoamvasMark';

const DISMISSED_KEY = 'nexvi-install-dismissed';

export function InstallPrompt() {
  const { t } = useTranslation();
  const { canInstall, isInstalled, isIos, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(DISMISSED_KEY) === '1'; } catch { return false; }
  });

  const dismiss = () => {
    setDismissed(true);
    try { localStorage.setItem(DISMISSED_KEY, '1'); } catch { /* private mode etc. — fine to just not persist */ }
  };

  const install = async () => {
    await promptInstall();
    dismiss();
  };

  if (dismissed || isInstalled || (!canInstall && !isIos)) return null;

  return (
    <div className="nx-fade-in flex items-start gap-3 bg-brand-soft border border-brand/20 rounded-2xl p-4 mb-6">
      <RoamvasMark className="w-9 h-9 text-brand shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-ink">{t('install.title')}</p>
        <p className="text-sm text-ink-soft mt-0.5">{canInstall ? t('install.body') : t('install.iosBody')}</p>
        {canInstall && (
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
