// Nexvi test-mode proxy — deploy this on Cloudflare Workers (free tier is
// plenty). It holds the real DeepSeek API key server-side and forwards
// generation requests to DeepSeek on the app's behalf, so the key never
// ships in the browser bundle the way it would if entered in Settings.
//
// Setup (Cloudflare dashboard → Workers & Pages → Create Worker):
//   1. Paste this file in as the Worker's code.
//   2. Settings → Variables and Secrets:
//        - DEEPSEEK_API_KEY  (type: Secret)  → your real DeepSeek key
//        - ALLOWED_ORIGIN    (type: Text)    → e.g. https://yourname.github.io
//   3. Deploy, then copy the Worker's *.workers.dev URL — that's what goes
//      into the Nexvi repo's VITE_AI_PROXY_URL (see .env.example).
//
// This only accepts requests from ALLOWED_ORIGIN and only forwards
// `messages`/`max_tokens`/`temperature` — the model is fixed server-side so
// a request can't be crafted to call something else on your account.
// Note this origin check is a speed bump, not a hard guarantee (a
// non-browser client can set any Origin header it likes) — the real backstop
// is keeping a spending cap on the DeepSeek key itself.

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowedOrigin = (env.ALLOWED_ORIGIN || '').replace(/\/+$/, '');
    const originOk = !!allowedOrigin && origin === allowedOrigin;

    const corsHeaders = {
      'Access-Control-Allow-Origin': originOk ? origin : 'null',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (!originOk) {
      return json({ error: 'Forbidden origin' }, 403, corsHeaders);
    }
    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405, corsHeaders);
    }
    if (!env.DEEPSEEK_API_KEY) {
      return json({ error: 'Worker misconfigured: missing DEEPSEEK_API_KEY secret' }, 500, corsHeaders);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid JSON body' }, 400, corsHeaders);
    }
    if (!Array.isArray(body.messages)) {
      return json({ error: 'Missing "messages" array' }, 400, corsHeaders);
    }

    const upstream = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: body.messages,
        max_tokens: typeof body.max_tokens === 'number' ? body.max_tokens : 12000,
        temperature: typeof body.temperature === 'number' ? body.temperature : 0.7,
      }),
    });

    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  },
};

function json(obj, status, extraHeaders) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}
