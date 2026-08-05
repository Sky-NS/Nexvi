import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { useTranslation } from '@/i18n/LanguageContext';

const NAV_GRID_ID = 'day-nav-grid';

export function ScrollToTopButton() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = document.getElementById(NAV_GRID_ID);

    // Preferred trigger: show once the day-navigation grid has scrolled out
    // of view (that's the point where the user has lost quick access to
    // jump between days, so a way back up becomes useful).
    if (target) {
      const observer = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting), { threshold: 0 });
      observer.observe(target);
      return () => observer.disconnect();
    }

    // Fallback for trips too short to render a nav grid at all (1 day) —
    // a plain scroll-distance threshold instead.
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label={t('trip.scrollTop')}
      className="fixed bottom-5 right-5 z-40 w-11 h-11 rounded-full bg-brand text-white shadow-pop flex items-center justify-center active:scale-95 transition-transform"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
