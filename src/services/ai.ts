import { TripPreferences } from '@/types/trip';
import { format, eachDayOfInterval } from 'date-fns';

const ACTIVITY_LIMITS: Record<string, string> = {
  relaxed: '1-2',
  moderate: '2-3',
  packed: '3-4',
};

const SYSTEM_PROMPT = `Ты — профессиональный туристический эксперт с 20-летним опытом.
Создай детальный план путешествия на русском языке.

ПРАВИЛА:
1. Ответь СТРОГО валидным JSON. Без markdown, без комментариев, без объяснений до или после JSON.
2. Количество активностей СТРОГО ограничено темпом: 1-2 для расслабленного, 2-3 для умеренного, 3-4 для насыщенного. Не превышай лимит.
3. Время в формате HH:MM (24-часовой формат, местное время назначения).
4. Дата в формате YYYY-MM-DD.
5. Описание активности — 1-2 предложения, конкретные места.
6. Локация — конкретный район/адрес/название заведения.
7. Заметки — практические советы (что взять, как добраться, бронь).
8. Учитывай бюджет, темп и интересы пользователя.
9. Учитывай группу путешественников:
   - один: индивидуальные места, тихие кафе, хостелы
   - пара: романтичные места, уютные рестораны
   - семья: детские активности, безопасные районы, удобства для детей
   - компания: групповые развлечения, бары, активности для большой компании
10. Учитывай тип передвижения:
    - пешком: всё в пешей доступности (до 2-3 км между точками), парки, пешеходные зоны
    - общественный транспорт: удобные маршруты метро/автобусов/трамваев, остановки рядом
    - машина: парковки, трассы, загородные локации, избегай центров с пробками
11. Первый день — прибытие/заселение, последний — выезд.
12. Логичное перемещение между локациями (не гонять туда-сюда по городу).
13. Учитывай время работы мест (не предлагай музеи в 23:00).

СТРУКТУРА:
{
  "destination": "Страна (Города)",
  "days": [
    {
      "dayNumber": 1,
      "date": "YYYY-MM-DD",
      "title": "Короткий заголовок дня",
      "activities": [
        {
          "time": "HH:MM",
          "title": "Название активности",
          "description": "1-2 предложения",
          "location": "Конкретное место",
          "notes": "Практический совет"
        }
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

function extractJson(text: string): string {
  let clean = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*$/gi, '')
    .replace(/```/g, '')
    .trim();
  const firstBrace = clean.indexOf('{');
  const lastBrace = clean.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    clean = clean.slice(firstBrace, lastBrace + 1);
  }
  return clean;
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

  const groupLabels: Record<string, string> = {
    solo: 'один',
    couple: 'парой',
    family: 'семьёй',
    group: 'компанией',
  };

  const transportLabels: Record<string, string> = {
    walking: 'пешком',
    public: 'общественный транспорт',
    car: 'на машине',
  };

  const userPrompt = `Создай план поездки:

📍 Место: ${params.destination}
📅 Даты: ${format(new Date(params.startDate), 'dd.MM.yyyy')} — ${format(new Date(params.endDate), 'dd.MM.yyyy')} (${days.length} дней)
👥 Группа: ${groupLabels[params.preferences.travelGroup]} (${params.travelers} чел.)
🚗 Передвижение: ${transportLabels[params.preferences.transportation]}
💰 Бюджет: ${params.budget || 'не указан'}
🚶 Темп: ${params.preferences.pace === 'relaxed' ? 'расслабленный' : params.preferences.pace === 'moderate' ? 'умеренный' : 'насыщенный'}
📊 Лимит активностей: ${ACTIVITY_LIMITS[params.preferences.pace]} на день
🎯 Интересы: ${[
    params.preferences.beach && 'пляжный',
    params.preferences.culture && 'культурный',
    params.preferences.adventure && 'активный',
    params.preferences.food && 'гастрономический',
    params.preferences.nightlife && 'ночная жизнь',
    params.preferences.shopping && 'шопинг',
    params.preferences.relaxation && 'релакс',
    params.preferences.nature && 'природа',
  ].filter(Boolean).join(', ') || 'общий'}
⭐ Доп. интересы: ${params.preferences.interests.join(', ') || 'нет'}

ТРЕБОВАНИЯ:
- Все названия на русском языке
- Реальные достопримечательности, рестораны, места
- Логичное перемещение между локациями
- Учитывай время работы мест
- Для каждого дня — краткий, но ёмкий заголовок

Верни ТОЛЬКО JSON.`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  let response: Response;

  try {
    if (provider === 'openai') {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        signal: controller.signal,
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
          max_tokens: 4000,
          temperature: 0.7,
        }),
      });
    } else if (provider === 'deepseek') {
      response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        signal: controller.signal,
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
          max_tokens: 4000,
          temperature: 0.7,
        }),
      });
    } else {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: SYSTEM_PROMPT + '\n\n' + userPrompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 4000 },
          }),
        }
      );
    }
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Ошибка API: ${response.status} — ${error}`);
  }

  const data = await response.json();
  const content = provider === 'gemini'
    ? data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    : data.choices?.[0]?.message?.content || '';

  const clean = extractJson(content);

  try {
    return JSON.parse(clean);
  } catch {
    throw new Error('Нейросеть вернула некорректный формат. Попробуйте снова.');
  }
}