import { TripPreferences } from '@/types/trip';
import { format, eachDayOfInterval } from 'date-fns';
import { TEST_MODE, AI_PROXY_URL } from '@/config';

const ACTIVITY_LIMITS: Record<string, string> = {
  relaxed: '1-2',
  moderate: '2-3',
  packed: '3-4',
};

const SYSTEM_PROMPT = `Ты — профессиональный туристический эксперт с 20-летним опытом.
Создай детальный план путешествия.

ПРАВИЛА:
1. Ответь СТРОГО валидным JSON. Без markdown, без комментариев, без объяснений до или после JSON.
2. Весь текстовый контент (заголовки, описания, заметки) — строго на языке, указанном в поле "Язык ответа" запроса пользователя.
3. Количество активностей СТРОГО ограничено темпом: 1-2 для расслабленного, 2-3 для умеренного, 3-4 для насыщенного. Не превышай лимит.
4. НЕ указывай время (time) активностей — просто логичный порядок в течение дня, без привязки к конкретным часам.
5. Описание активности — 1-2 предложения, конкретные места.
6. Локация — ТОЧНОЕ название конкретного места действия (заведения, достопримечательности, музея, парка, ресторана), которое можно найти по названию в Google Maps или Wikipedia. Это НЕ должен быть просто район, квартал или общая часть города. Плохо: «Намба», «центр Осаки», «район Гион». Хорошо: «Kuromon Ichiba Market», «Осакский замок», «Fushimi Inari Taisha», «Ichiran Ramen Dotonbori».
7. Заметки — практические советы (что взять, как добраться, бронь).
8. Учитывай бюджет, темп и интересы пользователя.
9. Если пользователь указал конкретные пожелания (обязательные места/активности) — обязательно включи их в план.
10. Учитывай группу путешественников:
    - один: индивидуальные места, тихие кафе, хостелы
    - пара: романтичные места, уютные рестораны
    - семья: детские активности, безопасные районы, удобства для детей
    - компания: групповые развлечения, бары, активности для большой компании
11. Учитывай тип передвижения:
    - пешком: всё в пешей доступности (до 2-3 км между точками), парки, пешеходные зоны
    - общественный транспорт: удобные маршруты метро/автобусов/трамваев, остановки рядом
    - машина: парковки, трассы, загородные локации, избегай центров с пробками
    - аренда транспорта: пользователь арендовал авто/скутер на всю поездку — доступны более удалённые и живописные места; НЕ указывай cost для "route" (переходов), это отдельная статья расходов пользователя — для всех route используй cost: 0
12. НЕ включай в план логистические пункты вроде «прилёт», «вылет», «заселение в отель», «выселение», «переезд между городами» — только реальные активности (что посмотреть/сделать/попробовать). Пользователь добавит логистику сам в режиме редактирования, если понадобится.
13. Логичное перемещение между локациями (не гонять туда-сюда по городу без необходимости).
14. Учитывай время работы мест (не предлагай ночные клубы вместо музеев и наоборот).
15. "currency" — всегда равно валюте, указанной в запросе пользователя ("Предпочитаемая валюта"). Переведи ВСЕ числовые cost-поля в эту валюту по приблизительному текущему курсу.
16. "route" — список переходов между точками за день (включая от жилья и обратно), не более 4 переходов, с примерным способом передвижения и стоимостью (см. правило 11 про аренду). Пешком/бесплатно — cost: 0.
17. "cost" у активности — примерная стоимость входа/участия в указанной валюте, числом, без символа и без диапазонов. Бесплатно — 0. ИСКЛЮЧЕНИЕ: для активностей про еду/рестораны/кафе (обед, ужин, дегустация и т.п.) и про шопинг — ПОЛЕ "cost" НЕ УКАЗЫВАЙ ВООБЩЕ (пропусти это поле). Эти расходы у каждого свои, оценить их нельзя — пользователь впишет сам при необходимости.
18. "hours" у активности — часы работы, если применимо (например "9:00–18:00"), иначе не указывай.
19. НЕ придумывай номера бронирований, места в транспорте и т.п. — это добавит сам пользователь после реального бронирования.
20. "icon" — один конкретный emoji, отражающий суть дня/активности (например 🏯 храм, 🍜 еда, 🏖 пляж, 🚉 вокзал, 🛍 шопинг, ⛩ святилище). Не повторяй один и тот же emoji для всех подряд — подбирай по смыслу каждый раз.

СТРУКТУРА:
{
  "destination": "Страна (Города)",
  "currency": "USD",
  "days": [
    {
      "dayNumber": 1,
      "date": "YYYY-MM-DD",
      "title": "Короткий заголовок дня",
      "icon": "🏯",
      "route": [
        { "from": "точка A", "to": "точка B", "mode": "метро/пешком/такси/поезд", "cost": 0 }
      ],
      "activities": [
        {
          "title": "Название активности",
          "description": "1-2 предложения",
          "location": "Kuromon Ichiba Market",
          "notes": "Практический совет",
          "cost": 0,
          "hours": "9:00–18:00",
          "icon": "🍜"
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
  preferredCurrency: string;
  languageName: string;
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
  } else if (firstBrace !== -1) {
    // No closing brace at all — the response was almost certainly cut off mid-JSON.
    clean = clean.slice(firstBrace);
  }
  return clean;
}

// Best-effort repair for a response that got truncated (e.g. hit the token
// limit) before its brackets were closed. Walks the string once, and at every
// safe boundary outside a string literal ('{', '[', '}', ']', ',') records a
// candidate cut point together with the exact closing brackets needed to
// balance the JSON at that moment. Then tries candidates from the latest
// (most information kept) back to the earliest, actually validating each one
// with JSON.parse, and returns the first that parses — i.e. the truncated
// trailing member (an in-progress activity, route leg, etc.) gets dropped
// rather than guessed at.
function closeUnbalancedJson(text: string): string | null {
  let inString = false;
  let escaped = false;
  const stack: string[] = [];
  const candidates: { pos: number; closers: string }[] = [];

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') { inString = true; continue; }
    if (ch === '{' || ch === '[') {
      stack.push(ch === '{' ? '}' : ']');
      candidates.push({ pos: i + 1, closers: stack.slice().reverse().join('') });
    } else if (ch === '}' || ch === ']') {
      stack.pop();
      candidates.push({ pos: i + 1, closers: stack.slice().reverse().join('') });
    } else if (ch === ',') {
      candidates.push({ pos: i, closers: stack.slice().reverse().join('') });
    }
  }

  if (stack.length === 0) return null;

  for (let k = candidates.length - 1; k >= 0; k--) {
    const attempt = text.slice(0, candidates[k].pos) + candidates[k].closers;
    try {
      JSON.parse(attempt);
      return attempt;
    } catch {
      // try an earlier, less-truncated candidate
    }
  }
  return null;
}

export async function generateTripPlan(
  params: GenerationParams,
  apiKey: string,
  provider: 'openai' | 'gemini' | 'deepseek' = 'openai'
): Promise<{ destination?: string; currency?: string; days?: any[] }> {
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
    rental: 'аренда транспорта (авто/скутер на весь срок поездки)',
  };

  const userPrompt = `Создай план поездки:

📍 Место: ${params.destination}
📅 Даты: ${format(new Date(params.startDate), 'dd.MM.yyyy')} — ${format(new Date(params.endDate), 'dd.MM.yyyy')} (${days.length} дней)
👥 Группа: ${groupLabels[params.preferences.travelGroup]} (${params.travelers} чел.)
🚗 Передвижение: ${transportLabels[params.preferences.transportation]}
💰 Бюджет: ${params.budget || 'не указан'}
💱 Предпочитаемая валюта: ${params.preferredCurrency}
🌐 Язык ответа: ${params.languageName}
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
${params.preferences.wishes?.trim() ? `🌟 Обязательные пожелания пользователя (включи в план): ${params.preferences.wishes.trim()}` : ''}

ТРЕБОВАНИЯ:
- Весь текст строго на языке из поля "Язык ответа"
- Реальные достопримечательности, рестораны, места
- Логичное перемещение между локациями
- Учитывай время работы мест
- Для каждого дня — краткий, но ёмкий заголовок
- Без пунктов логистики (прилёт/вылет/заселение/переезд) — только активности
- Без поля time у активностей
- Добавь "route" и "cost"/"hours" для активностей, как описано в структуре, все суммы — в валюте ${params.preferredCurrency}

Верни ТОЛЬКО JSON.`;

  const controller = new AbortController();
  // Generating up to 12000 tokens of structured JSON genuinely takes a
  // while, especially for longer trips — 30s was cutting requests off
  // mid-flight and surfacing a raw "signal is aborted without reason"
  // browser error instead of ever reaching a real response.
  const timeoutId = setTimeout(() => controller.abort(), 90000);

  let response: Response;

  try {
    if (TEST_MODE) {
      if (!AI_PROXY_URL) throw new Error('Прокси для тестового режима не настроен (VITE_AI_PROXY_URL).');
      response = await fetch(AI_PROXY_URL, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 12000,
          temperature: 0.7,
        }),
      });
    } else if (provider === 'openai') {
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
          max_tokens: 12000,
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
          max_tokens: 12000,
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
            generationConfig: { temperature: 0.7, maxOutputTokens: 12000 },
          }),
        }
      );
    }
  } catch (e: any) {
    if (e?.name === 'AbortError') {
      throw new Error('Генерация заняла слишком много времени. Попробуйте ещё раз — если повторится, попробуйте сократить число дней или сменить провайдера в настройках.');
    }
    if (e instanceof TypeError) {
      // The fetch itself never got a response — this is what a CORS
      // rejection, a wrong/unreachable URL, or a real connectivity problem
      // all look like from here (browsers deliberately don't say which).
      if (TEST_MODE) {
        // eslint-disable-next-line no-console
        console.error(
          'Roamvas: proxy fetch failed. Most likely cause: the Worker\'s ALLOWED_ORIGIN doesn\'t exactly match this site\'s origin, or VITE_AI_PROXY_URL is wrong/unreachable.',
          '\nThis site\'s origin:', typeof window !== 'undefined' ? window.location.origin : '(unknown)',
          '\nVITE_AI_PROXY_URL:', AI_PROXY_URL || '(not set)',
          '\nOriginal error:', e
        );
        throw new Error('Не удалось связаться с сервером генерации. Похоже, прокси-сервер недоступен или неверно настроен — проверьте ALLOWED_ORIGIN в воркере (должен точно совпадать с адресом сайта) и VITE_AI_PROXY_URL в переменных репозитория.');
      }
      throw new Error('Не удалось связаться с сервером ИИ. Проверьте подключение к интернету и попробуйте снова.');
    }
    throw e;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Ошибка API: ${response.status} — ${error}`);
  }

  const data = await response.json();
  const content = (!TEST_MODE && provider === 'gemini')
    ? data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    : data.choices?.[0]?.message?.content || '';

  const clean = extractJson(content);

  try {
    return JSON.parse(clean);
  } catch {
    const repaired = closeUnbalancedJson(clean);
    if (repaired) {
      try {
        return JSON.parse(repaired);
      } catch {
        // fall through to the diagnostic + error below
      }
    }
    // eslint-disable-next-line no-console
    console.error('Roamvas: не удалось разобрать ответ ИИ как JSON. Сырой ответ модели:', content);
    throw new Error('Нейросеть вернула некорректный формат. Попробуйте снова.');
  }
}
