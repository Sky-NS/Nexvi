import { useState } from 'react';
import { useTranslation } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Props {
  onAdd: (values: string[]) => void;
  onClose: () => void;
}

export function CustomInterestDialog({ onAdd, onClose }: Props) {
  const { t } = useTranslation();
  const [text, setText] = useState('');

  const submit = () => {
    const values = text.split(',').map((s) => s.trim()).filter(Boolean);
    if (values.length) onAdd(values);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-overlay/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-surface rounded-3xl shadow-pop p-6 max-w-sm w-full nx-fade-in" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-bold text-lg text-ink mb-1">{t('wizard.customInterest.title')}</h3>
        <p className="text-sm text-ink-soft mb-3">{t('wizard.customInterest.hint')}</p>
        <Input
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') onClose(); }}
          placeholder={t('wizard.customInterest.placeholder')}
        />
        <div className="flex gap-2 mt-4">
          <Button className="flex-1" onClick={submit} disabled={!text.trim()}>{t('common.add')}</Button>
          <Button variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
        </div>
      </div>
    </div>
  );
}
