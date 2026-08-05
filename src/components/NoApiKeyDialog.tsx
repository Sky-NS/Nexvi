import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/Button';

interface Props {
  onClose: () => void;
}

export function NoApiKeyDialog({ onClose }: Props) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/30 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-surface rounded-3xl shadow-pop p-6 max-w-sm w-full nx-fade-in" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-bold text-lg mb-2">{t('noKey.title')}</h3>
        <p className="text-sm text-ink-soft mb-5">{t('noKey.body')}</p>
        <div className="flex flex-col gap-2">
          <Button onClick={() => navigate('/settings')}>{t('noKey.goToSettings')}</Button>
          <Button variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
        </div>
      </div>
    </div>
  );
}
