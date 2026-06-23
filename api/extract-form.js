// Vercel Serverless Function — extract agenda topics from a real MOM document
// Activates when ANTHROPIC_API_KEY env var is set in Vercel
//
// Endpoint: POST /api/extract-form
// Body: { contentText }
// Returns: { topics: [...] } parsed JSON, or { fallback: true } if AI unavailable

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
    const { contentText } = req.body || {}
    if (!contentText || !contentText.trim()) {
      return res.status(400).json({ error: 'Missing contentText' })
    }

    const prompt = `ต่อไปนี้คือเนื้อหาที่สกัดได้จากเอกสารรายงานการประชุม (Minutes of Meeting) ของบริษัทแห่งหนึ่ง ช่วยอ่านแล้วดึง "รายชื่อหัวข้อวาระการประชุม" (agenda topic headers) ตามลำดับที่ปรากฏในเอกสารต้นฉบับ

กฎ:
- เอาแค่ "ชื่อหัวข้อวาระหลัก" (เช่น "เรื่องแจ้งเพื่อทราบ", "เรื่องติดตาม") ไม่เอารายละเอียดย่อยหรือเนื้อหาการประชุมจริงที่พูดถึงในวาระนั้น
- เรียงตามลำดับเลขวาระที่ปรากฏในเอกสาร
- ถ้าเอกสารไม่มีโครงสร้างวาระชัดเจน ให้เดาจากหัวข้อ section ที่ใกล้เคียงที่สุด
- ตอบเป็นชื่อวาระสั้นๆ ภาษาไทย ไม่ต้องมีเลขนำหน้า

เนื้อหาเอกสาร:
"""
${contentText.slice(0, 6000)}
"""

ตอบกลับเป็น JSON อย่างเดียว ห้ามมี markdown หรือ codeblock ตามรูปแบบนี้:
{"topics": ["ชื่อวาระ 1", "ชื่อวาระ 2", "..."]}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 512,
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

    let parsed
    try {
      parsed = JSON.parse(cleaned.slice(s, e + 1))
    } catch (err) {
      return res.status(200).json({ fallback: true, error: 'Parse error' })
    }

    if (!Array.isArray(parsed.topics) || !parsed.topics.length) {
      return res.status(200).json({ fallback: true, error: 'Invalid schema' })
    }

    return res.status(200).json({ topics: parsed.topics.filter((t) => typeof t === 'string' && t.trim()) })
  } catch (err) {
    console.error('extract-form handler error:', err)
    return res.status(200).json({ fallback: true, error: err.message })
  }
}
