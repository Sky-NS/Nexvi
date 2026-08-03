import { TripPreferences } from '@/types/trip';
import { format, eachDayOfInterval } from 'date-fns';

const SYSTEM_PROMPT = `Ты — туристический эксперт. Создай детальный план путешествия.
Ответь СТРОГО в формате JSON без markdown, без комментариев, без объяснений.
Структура:
{
  "destination": "Страна (Города)",
  "days": [
    {
      "dayNumber": 1,
      "date": "YYYY-MM-DD",
      "title": "Заголовок дня",
      "activities": [
        { "time": "HH:MM", "title": "...", "description": "...", "location": "...", "notes": "..." }
      ]
    }
  ]
}`;

export interface GenerationParams {
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget?: string;
  preferences: TripPreferences;
}

export async function generateTripPlan(
  params: GenerationParams,
  apiKey: string,
  provider: 'openai' | 'gemini' | 'deepseek' = 'openai'
): Promise<{ destination?: string; days?: any[] }> {
  const days = eachDayOfInterval({
    start: new Date(params.startDate),
    end: new Date(params.endDate),
  });

  const userPrompt = `Создай план поездки:
Место: ${params.destination}
Даты: ${format(new Date(params.startDate), 'dd.MM.yyyy')} — ${format(new Date(params.endDate), 'dd.MM.yyyy')} (${days.length} дней)
Путешественников: ${params.travelers}
Бюджет: ${params.budget || 'не указан'}
Темп: ${params.preferences.pace === 'relaxed' ? 'расслабленный' : params.preferences.pace === 'moderate' ? 'умеренный' : 'насыщенный'}
Интересы: ${[
    params.preferences.beach && 'пляжный',
    params.preferences.culture && 'культурный',
    params.preferences.adventure && 'активный',
    params.preferences.food && 'гастрономический',
    params.preferences.nightlife && 'ночная жизнь',
    params.preferences.shopping && 'шопинг',
    params.preferences.relaxation && 'релакс',
    params.preferences.nature && 'природа',
  ].filter(Boolean).join(', ') || 'общий'}
Доп. интересы: ${params.preferences.interests.join(', ') || 'нет'}

ВАЖНО: Верни ТОЛЬКО JSON.`;

  let response: Response;

  if (provider === 'openai') {
    response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });
  } else if (provider === 'deepseek') {
    response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });
  } else {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: SYSTEM_PROMPT + '\n\n' + userPrompt }] }],
          generationConfig: { temperature: 0.7 },
        }),
      }
    );
  }

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Ошибка API: ${response.status} — ${error}`);
  }

  const data = await response.json();
  const content = provider === 'gemini'
    ? data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    : data.choices?.[0]?.message?.content || '';

  const clean = content.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();

  try {
    return JSON.parse(clean);
  } catch {
    throw new Error('Нейросеть вернула некорректный формат. Попробуйте снова.');
  }
}