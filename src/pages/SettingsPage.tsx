import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '@/store/settingsStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { ArrowLeft, Trash2, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { apiKey, provider, setApiKey, setProvider, resetApiKey } = useSettingsStore();
  const [show, setShow] = useState(false);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}><ArrowLeft className="w-4 h-4" /></Button>
        <h1 className="text-2xl font-bold">Настройки</h1>
      </div>
      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
        <div>
          <Label>Провайдер ИИ</Label>
          <div className="flex gap-2 mt-2 flex-wrap">
            <Button variant={provider === 'openai' ? 'default' : 'outline'} onClick={() => setProvider('openai')}>OpenAI</Button>
            <Button variant={provider === 'gemini' ? 'default' : 'outline'} onClick={() => setProvider('gemini')}>Gemini</Button>
            <Button variant={provider === 'deepseek' ? 'default' : 'outline'} onClick={() => setProvider('deepseek')}>DeepSeek</Button>
          </div>
        </div>
        <div>
          <Label>API-ключ</Label>
          <div className="flex gap-2 mt-2">
            <div className="relative flex-1">
              <Input type={show ? 'text' : 'password'} placeholder={provider === 'deepseek' ? 'sk-... (DeepSeek)' : provider === 'gemini' ? 'Ключ Gemini' : 'sk-... (OpenAI)'} value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
            </div>
            {apiKey && <Button variant="destructive" size="icon" onClick={resetApiKey}><Trash2 className="w-4 h-4" /></Button>}
          </div>
          <p className="text-xs text-gray-500 mt-2">Ключ хранится только в вашем браузере (localStorage) и отправляется напрямую в API провайдера.</p>
        </div>
      </div>
    </div>
  );
}