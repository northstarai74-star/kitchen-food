import { handleGenerate, send } from '../lib/recipes.js';

// Vercel function for the "Write with AI" button. Needs ANTHROPIC_API_KEY in the project's Environment Variables.
export default function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Use POST.' });
  return handleGenerate(req, res);
}
