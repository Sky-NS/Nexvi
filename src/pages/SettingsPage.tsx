import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '@/store/settingsStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { RoundCheckbox } from '@/components/ui/RoundCheckbox';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CurrencyPicker } from '@/components/CurrencyPicker';
import { useTranslation, resolveLanguage } from '@/i18n/LanguageContext';
import { SUPPORTED_LANGUAGES } from '@/i18n/translations';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { TEST_MODE } from '@/config';
import { ArrowLeft, Trash2, Eye, EyeOff, Monitor, Download, ClipboardPaste } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    apiKey, provider, setApiKey, setProvider, resetApiKey,
    preferredCurrency, setPreferredCurrency,
    language, setLanguage,
    theme, setTheme,
  } = useSettingsStore();
  const [show, setShow] = useState(false);
  const { canInstall, isInstalled, isIos, promptInstall } = useInstallPrompt();

  const pasteApiKey = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        setApiKey(text.trim());
        setShow(true);
      }
    } catch {
      // Clipboard permission denied or unsupported here — the user can
      // still paste manually through the field's own context menu.
    }
  };

  // Turning "use system" off locks in whatever it currently resolves to,
  // so the visible theme/language doesn't jump at the moment of toggling —
  // it just stops following the system from then on.
  const handleThemeSystemToggle = (useSystem: boolean) => {
    if (useSystem) { setTheme('system'); return; }
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(systemDark ? 'dark' : 'light');
  };
  const handleLanguageSystemToggle = (useSystem: boolean) => {
    if (useSystem) { setLanguage('system'); return; }
    setLanguage(resolveLanguage('system'));
  };

  const languageValue = language === 'system' ? resolveLanguage('system') : language;

  return (
    <div className="nx-fade-in max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}><ArrowLeft className="w-4 h-4" /></Button>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">{t('settings.title')}</h1>
      </div>
      <div className="bg-surface rounded-2xl shadow-card border border-border p-4 sm:p-6 space-y-6">
        {!TEST_MODE && (
          <>
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
                <Button variant="outline" size="icon" onClick={pasteApiKey} className="shrink-0" aria-label={t('settings.apiKeyPaste')}><ClipboardPaste className="w-4 h-4" /></Button>
                {apiKey && <Button variant="destructive" size="icon" onClick={resetApiKey} className="shrink-0"><Trash2 className="w-4 h-4" /></Button>}
              </div>
              <p className="text-xs text-ink-soft mt-2">{t('settings.apiKeyHelp')}</p>
            </div>
          </>
        )}

        <div>
          <Label>{t('settings.currency')}</Label>
          <div className="mt-2">
            <CurrencyPicker value={preferredCurrency} onChange={setPreferredCurrency} />
          </div>
          <p className="text-xs text-ink-soft mt-2">{t('settings.currencyHelp')}</p>
        </div>

        <div>
          <Label>{t('settings.theme')}</Label>
          <div className="mt-2">
            <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
              <RoundCheckbox checked={theme === 'system'} onChange={handleThemeSystemToggle} />
              <Monitor className="w-4 h-4 text-ink-soft" />
              <span className="text-sm font-medium text-ink">{t('settings.theme.system')}</span>
            </label>
          </div>
          <div className="flex items-center gap-3 mt-3">
            <ThemeToggle
              value={theme === 'dark' ? 'dark' : 'light'}
              disabled={theme === 'system'}
              onChange={setTheme}
            />
            <span className={theme === 'system' ? 'text-sm text-ink-faint' : 'text-sm text-ink-soft'}>
              {theme === 'dark' ? t('settings.theme.dark') : t('settings.theme.light')}
            </span>
          </div>
        </div>

        <div>
          <Label>{t('settings.language')}</Label>
          <div className="mt-2">
            <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
              <RoundCheckbox checked={language === 'system'} onChange={handleLanguageSystemToggle} />
              <Monitor className="w-4 h-4 text-ink-soft" />
              <span className="text-sm font-medium text-ink">{t('settings.language.system')}</span>
            </label>
          </div>
          <select
            value={languageValue}
            disabled={language === 'system'}
            onChange={(e) => setLanguage(e.target.value)}
            className="mt-3 w-full h-10 rounded-xl border border-border bg-surface px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{t(l.labelKey)}</option>
            ))}
          </select>
        </div>

        <div>
          <Label>{t('settings.app')}</Label>
          <div className="mt-2">
            {isInstalled ? (
              <p className="text-sm text-ink-soft">{t('settings.app.installed')}</p>
            ) : canInstall ? (
              <Button onClick={() => promptInstall()}><Download className="w-4 h-4 mr-2" />{t('install.installButton')}</Button>
            ) : isIos ? (
              <p className="text-sm text-ink-soft">{t('install.iosBody')}</p>
            ) : (
              <p className="text-sm text-ink-soft">{t('settings.app.unavailable')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
