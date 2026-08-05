import { useTranslation } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/Button';

interface Props {
  max: number;
  onClose: () => void;
}

export function TripLimitDialog({ max, onClose }: Props) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-overlay/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-surface rounded-3xl shadow-pop p-6 max-w-sm w-full nx-fade-in" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-bold text-lg mb-2">{t('limit.title')}</h3>
        <p className="text-sm text-ink-soft mb-5">{t('limit.body', { max })}</p>
        <div className="flex flex-col gap-2">
          <Button variant="outline" onClick={onClose}>{t('limit.gotIt')}</Button>
          <Button disabled className="opacity-50 cursor-not-allowed">{t('limit.subscribe')}</Button>
        </div>
      </div>
    </div>
  );
}
