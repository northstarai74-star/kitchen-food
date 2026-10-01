// Recipe generation shared by the local server (server.js) and the Vercel function (api/generate-dish.js).
// Locally it uses Ollama by default; on Vercel (or with USE_LOCAL_MODEL=false) it uses Anthropic.

import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-opus-5';
const USE_LOCAL_MODEL = process.env.USE_LOCAL_MODEL ? process.env.USE_LOCAL_MODEL !== 'false' : !process.env.VERCEL;
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';
// OLLAMA_NUM_GPU=0 forces CPU (faster than a power-throttled laptop GPU on battery); unset = Ollama decides.
const OLLAMA_OPTIONS = process.env.OLLAMA_NUM_GPU ? { num_gpu: Number(process.env.OLLAMA_NUM_GPU) } : {};
const OLLAMA_PORT = process.env.OLLAMA_PORT || '11434';
const OLLAMA_URL = `http://localhost:${OLLAMA_PORT}/api/generate`;

/* ---------- Recipe generation ---------- */

const RECIPE_SCHEMA = {
  type: 'object',
  properties: {
    is_dish: { type: 'boolean', description: 'false if the name is not a food or drink someone could cook or make' },
    ingredients: { type: 'array', items: { type: 'string' } },
    method: { type: 'string' },
    notes: { type: 'string' },
    description: { type: 'string' },
    quick: { type: 'boolean' },
    category: { type: 'string', enum: ['main', 'dessert', 'drink'] }
  },
  required: ['is_dish', 'ingredients', 'method', 'notes', 'description', 'quick', 'category'],
  additionalProperties: false
};

const SYSTEM = `You write recipes for Kitchen Food, a family recipe notebook used mostly for home-style Indian cooking.
Return one recipe for the dish the user names, written for a home cook.

- ingredients: 4 to 12 entries, one ingredient each. Put the quantity first in simple kitchen units, e.g. "1 cup toor dal", "2 tomatoes, chopped", "1/2 tsp turmeric", "a pinch of salt". The app builds a shopping list by reading the quantity at the start of each line, so keep that order.
- method: 2 to 4 short sentences in plain language, no numbering.
- notes: one short household tip.
- description: one warm sentence about the dish, under 20 words.
- quick: true if it takes about 30 minutes or less.
- category: dessert for sweets, drink for beverages, otherwise main.
Respect the servings and spice preference when given. If the name is not something a person could cook or make, set is_dish to false and leave the other fields short.`;

let client;
function getClient() {
  // Resolves ANTHROPIC_API_KEY / ANTHROPIC_AUTH_TOKEN / an `ant auth login` profile.
  client ??= new Anthropic();
  return client;
}

async function askOllama(prompt) {
  const response = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(90000),
    body: JSON.stringify({
      model: OLLAMA_MODEL, prompt, stream: false, format: 'json',
      keep_alive: '30m', // stay loaded between requests: no 6-10s reload after idle
      options: { temperature: 0.4, num_ctx: 2048, num_predict: 450, ...OLLAMA_OPTIONS }
    })
  });
  if (response.status === 404) throw Object.assign(new Error('model missing'), { code: 'NO_MODEL' });
  if (!response.ok) throw new Error(`Ollama error: ${response.status} ${response.statusText}`);
  const text = (await response.json()).response || '';
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new SyntaxError('no JSON in reply');
  return JSON.parse(match[0]);
}

async function generateDishLocal({ name, servings, spice }) {
  const details = [`Dish: ${name}`];
  if (servings) details.push(`Serves: ${servings}`);
  if (spice) details.push(`Spice preference: ${spice}`);

  // Short output = low latency (generation time scales with tokens), so this prompt asks for a compact recipe.
  const prompt = `You write recipes for Kitchen Food, a family notebook of home-style Indian cooking.
${details.join('\n')}
First recall how "${name}" is traditionally made in Indian homes and which ingredients it really uses. Use only those ingredients, never generic placeholders.
Respect servings and spice. Use at most 8 ingredients, plain and short. Each ingredient starts with a quantity in simple kitchen units (cup, tbsp, tsp, pinch, or a count).
The method must describe the real cooking steps for ${name}, in the right order.
If the name is not food or drink someone could make, set is_dish to false and keep other fields empty.
Reply with ONLY JSON in this shape (angle brackets are placeholders to fill in for ${name}):
{"is_dish": true, "ingredients": ["<quantity> <ingredient>", "..."], "method": "<2 to 3 short sentences>", "notes": "<one tip, under 12 words>", "description": "<under 15 words>", "quick": <true if about 30 minutes or less>, "category": "<main, dessert or drink>"}`;

  try {
    let recipe;
    try { recipe = await askOllama(prompt); }
    catch (e) { if (!(e instanceof SyntaxError)) throw e; recipe = await askOllama(prompt); } // one retry on bad JSON

    if (!recipe.is_dish) {
      return { status: 422, body: { error: `"${name}" doesn't look like a dish. Check the name and try again.` } };
    }
    if (!Array.isArray(recipe.ingredients) || !recipe.method || recipe.ingredients.some(i => /[<>]/.test(i))) {
      return { status: 502, body: { error: 'The AI reply was incomplete. Please try again.' } };
    }
    if (!['main', 'dessert', 'drink'].includes(recipe.category)) recipe.category = 'main';
    recipe.quick = Boolean(recipe.quick);
    delete recipe.is_dish;
    return { status: 200, body: recipe };
  } catch (error) {
    console.error('Ollama error:', error.message);
    if (error.code === 'NO_MODEL') return { status: 503, body: { error: `Model not found. Run: ollama pull ${OLLAMA_MODEL}` } };
    if (error.name === 'TimeoutError') return { status: 504, body: { error: 'The local AI took too long. Try again.' } };
    if (error instanceof SyntaxError) return { status: 502, body: { error: 'The AI reply could not be read. Please try again.' } };
    return { status: 503, body: { error: 'Local AI is not available. Start Ollama (ollama serve) and try again.' } };
  }
}

async function generateDish({ name, servings, spice }) {
  if (USE_LOCAL_MODEL) {
    return generateDishLocal({ name, servings, spice });
  }

  const details = [`Dish: ${name}`];
  if (servings) details.push(`Serves: ${servings}`);
  if (spice) details.push(`Spice preference: ${spice}`);

  const response = await getClient().beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'low', format: { type: 'json_schema', schema: RECIPE_SCHEMA } },
    system: SYSTEM,
    messages: [{ role: 'user', content: details.join('\n') }]
  });

  if (response.stop_reason === 'refusal') {
    return { status: 422, body: { error: "The AI couldn't write a recipe for that name. Try a different dish." } };
  }
  const text = response.content.find(b => b.type === 'text')?.text;
  if (!text || response.stop_reason === 'max_tokens') {
    return { status: 502, body: { error: 'The AI reply was incomplete. Please try again.' } };
  }
  const recipe = JSON.parse(text);
  if (!recipe.is_dish) {
    return { status: 422, body: { error: `"${name}" doesn't look like a dish. Check the name and try again.` } };
  }
  delete recipe.is_dish;
  return { status: 200, body: recipe };
}

/* ---------- HTTP helpers ---------- */

export function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}

async function readJson(req, limit = 4096) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > limit) throw Object.assign(new Error('Request too large'), { status: 413 });
  }
  return JSON.parse(raw || '{}');
}

export async function handleGenerate(req, res) {
  let input;
  try { input = await readJson(req); } catch (e) { return send(res, e.status || 400, { error: 'Send JSON like {"name": "Masala dosa"}.' }); }
  const name = String(input.name || '').trim();
  if (name.length < 2 || name.length > 80) return send(res, 400, { error: 'Enter a dish name (2–80 characters) first.' });
  const clean = v => String(v || '').trim().slice(0, 40);

  try {
    const { status, body } = await generateDish({ name, servings: clean(input.servings), spice: clean(input.spice) });
    send(res, status, body);
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      send(res, 503, { error: 'AI is not set up: the Anthropic API key is missing or invalid. Set ANTHROPIC_API_KEY (in .env locally, or in the Vercel project Environment Variables) and redeploy.' });
    } else if (error instanceof Anthropic.RateLimitError) {
      send(res, 429, { error: 'The AI is busy right now. Wait a moment and try again.' });
    } else if (error instanceof Anthropic.APIError) {
      console.error('Anthropic API error', error.status, error.message);
      send(res, 502, { error: 'The AI service returned an error. Please try again.' });
    } else if (error instanceof SyntaxError) {
      send(res, 502, { error: 'The AI reply could not be read. Please try again.' });
    } else {
      // Most often: no credentials configured, so the client could not be created.
      console.error(error);
      send(res, 503, { error: 'AI is not set up yet. Set ANTHROPIC_API_KEY (in .env locally, or in the Vercel project Environment Variables) and redeploy.' });
    }
  }
}

// Load the model now so the first "Write with AI" click isn't a cold start.
export function warmUpLocalModel() {
  if (!USE_LOCAL_MODEL) return;
  fetch(OLLAMA_URL, { method: 'POST', body: JSON.stringify({ model: OLLAMA_MODEL, prompt: '', keep_alive: '30m', options: OLLAMA_OPTIONS }) })
    .then(() => console.log(`Ollama model ${OLLAMA_MODEL} warmed up`)).catch(() => console.log('Ollama not reachable yet (start it with: ollama serve)'));
}
