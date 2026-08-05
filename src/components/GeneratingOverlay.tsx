import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslation } from '@/i18n/LanguageContext';

const PHRASE_KEYS = [
  'generating.phrase1', 'generating.phrase2', 'generating.phrase3', 'generating.phrase4',
  'generating.phrase5', 'generating.phrase6', 'generating.phrase7', 'generating.phrase8',
];

const INTERVAL_MS = 2200;

export function GeneratingOverlay() {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % PHRASE_KEYS.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/50 backdrop-blur-sm p-4">
      <div className="bg-surface rounded-3xl shadow-pop p-8 max-w-xs w-full text-center nx-fade-in">
        <Loader2 className="w-10 h-10 text-brand animate-spin mx-auto mb-5" />
        <p className="text-sm font-semibold text-ink-faint uppercase tracking-wider mb-2">{t('generating.title')}</p>
        <p key={index} className="nx-fade-in text-base font-semibold text-ink min-h-[3rem] flex items-center justify-center">
          {t(PHRASE_KEYS[index])}
        </p>
      </div>
    </div>
  );
}
