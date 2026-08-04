import { useTranslation } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/Button';

interface Props {
  max: number;
  onClose: () => void;
}

export function TripLimitDialog({ max, onClose }: Props) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-5 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-bold text-lg mb-2">{t('limit.title')}</h3>
        <p className="text-sm text-gray-600 mb-5">{t('limit.body', { max })}</p>
        <div className="flex flex-col gap-2">
          <Button variant="outline" onClick={onClose}>{t('limit.gotIt')}</Button>
          <Button disabled className="opacity-50 cursor-not-allowed">{t('limit.subscribe')}</Button>
        </div>
      </div>
    </div>
  );
}
