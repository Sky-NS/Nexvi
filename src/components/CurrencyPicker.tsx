import { useState } from 'react';
import { CURRENCIES, getCurrency } from '@/lib/currencies';
import { useTranslation } from '@/i18n/LanguageContext';

interface Props {
  value: string;
  onChange: (code: string) => void;
}

export function CurrencyPicker({ value, onChange }: Props) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const selected = getCurrency(value);

  const filtered = query.trim()
    ? CURRENCIES.filter((c) => {
        const q = query.trim().toLowerCase();
        return c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q);
      })
    : CURRENCIES;

  return (
    <div className="relative">
      <input
        value={open ? query : (selected ? `${selected.code} — ${selected.name}` : value)}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => { setQuery(''); setOpen(true); }}
        placeholder={t('settings.currencySearchPlaceholder')}
        className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
      />
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1 w-full max-h-56 overflow-auto bg-white border rounded-lg shadow-lg">
            {filtered.length === 0 && <div className="px-3 py-2 text-sm text-gray-400">{t('settings.currencyNotFound')}</div>}
            {filtered.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => { onChange(c.code); setOpen(false); setQuery(''); }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between gap-2"
              >
                <span className="truncate">{c.code} — {c.name}</span>
                <span className="text-gray-400 shrink-0">{c.symbol}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
