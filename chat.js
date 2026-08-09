// Vercel Serverless Function — proxies requests to the Anthropic API.
// The real API key lives only here, server-side, as an environment variable —
// it is never sent to or visible in the browser.
//
// Deployed automatically by Vercel because it sits in /api/chat.js.
// The frontend calls POST /api/chat instead of calling api.anthropic.com directly.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Server is not configured with an API key.' });
    return;
  }

  try {
    const { model, max_tokens, system, messages } = req.body || {};

    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model || 'claude-sonnet-4-6',
        max_tokens: max_tokens || 1000,
        system: system,
        messages: messages
      })
    });

    const data = await anthropicResponse.json();
    res.status(anthropicResponse.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to reach the AI service.' });
  }
}
