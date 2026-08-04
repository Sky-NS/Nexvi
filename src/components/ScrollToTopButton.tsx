import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { useTranslation } from '@/i18n/LanguageContext';

export function ScrollToTopButton() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo(0, 0)}
      aria-label={t('trip.scrollTop')}
      className="fixed bottom-5 right-5 z-40 w-11 h-11 rounded-full bg-gray-900 text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
