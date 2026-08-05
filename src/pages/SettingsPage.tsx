import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '@/store/settingsStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { CurrencyPicker } from '@/components/CurrencyPicker';
import { useTranslation } from '@/i18n/LanguageContext';
import { SUPPORTED_LANGUAGES } from '@/i18n/translations';
import { ArrowLeft, Trash2, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    apiKey, provider, setApiKey, setProvider, resetApiKey,
    preferredCurrency, setPreferredCurrency,
    language, setLanguage,
  } = useSettingsStore();
  const [show, setShow] = useState(false);

  return (
    <div className="nx-fade-in max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}><ArrowLeft className="w-4 h-4" /></Button>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">{t('settings.title')}</h1>
      </div>
      <div className="bg-surface rounded-2xl shadow-card border border-border p-4 sm:p-6 space-y-6">
        <div>
          <Label>{t('settings.provider')}</Label>
          <div className="flex gap-2 mt-2 flex-wrap">
            <Button variant={provider === 'openai' ? 'default' : 'outline'} onClick={() => setProvider('openai')}>OpenAI</Button>
            <Button variant={provider === 'gemini' ? 'default' : 'outline'} onClick={() => setProvider('gemini')}>Gemini</Button>
            <Button variant={provider === 'deepseek' ? 'default' : 'outline'} onClick={() => setProvider('deepseek')}>DeepSeek</Button>
          </div>
        </div>

        <div>
          <Label>{t('settings.apiKey')}</Label>
          <div className="flex gap-2 mt-2">
            <div className="relative flex-1">
              <Input type={show ? 'text' : 'password'} placeholder={provider === 'deepseek' ? 'sk-... (DeepSeek)' : provider === 'gemini' ? 'Gemini key' : 'sk-... (OpenAI)'} value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink-soft">{show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
            </div>
            {apiKey && <Button variant="destructive" size="icon" onClick={resetApiKey} className="shrink-0"><Trash2 className="w-4 h-4" /></Button>}
          </div>
          <p className="text-xs text-ink-soft mt-2">{t('settings.apiKeyHelp')}</p>
        </div>

        <div>
          <Label>{t('settings.currency')}</Label>
          <div className="mt-2">
            <CurrencyPicker value={preferredCurrency} onChange={setPreferredCurrency} />
          </div>
          <p className="text-xs text-ink-soft mt-2">{t('settings.currencyHelp')}</p>
        </div>

        <div>
          <Label>{t('settings.language')}</Label>
          <div className="flex gap-2 mt-2 flex-wrap">
            <Button variant={language === 'system' ? 'default' : 'outline'} onClick={() => setLanguage('system')}>
              {t('settings.language.system')}
            </Button>
            {SUPPORTED_LANGUAGES.map((l) => (
              <Button key={l.code} variant={language === l.code ? 'default' : 'outline'} onClick={() => setLanguage(l.code)}>
                {t(l.labelKey)}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
