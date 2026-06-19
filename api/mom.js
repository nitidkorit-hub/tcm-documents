// Vercel Serverless Function — AI MOM Writer generation
// Activates when ANTHROPIC_API_KEY env var is set in Vercel
//
// Endpoint: POST /api/mom
// Body: { prompt }
// Returns: { mom: {...} } parsed JSON, or { fallback: true } to signal client-side fallback

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(200).json({ fallback: true })
  }

  try {
    const { prompt } = req.body || {}
    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt' })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Anthropic API error:', response.status, errorText)
      return res.status(200).json({ fallback: true, error: `API error: ${response.status}` })
    }

    const data = await response.json()
    const rawText = data.content?.[0]?.text || ''
    const cleaned = rawText.replace(/```json|```/g, '').trim()
    const s = cleaned.indexOf('{')
    const e = cleaned.lastIndexOf('}')
    if (s < 0 || e <= s) {
      return res.status(200).json({ fallback: true, error: 'No JSON in response' })
    }

    let mom
    try {
      mom = JSON.parse(cleaned.slice(s, e + 1))
    } catch (err) {
      return res.status(200).json({ fallback: true, error: 'Parse error' })
    }

    if (!mom || !Array.isArray(mom.agenda)) {
      return res.status(200).json({ fallback: true, error: 'Invalid schema' })
    }

    return res.status(200).json({ mom })
  } catch (err) {
    console.error('MOM handler error:', err)
    return res.status(200).json({ fallback: true, error: err.message })
  }
}
