const { GoogleGenerativeAI } = require('@google/generative-ai')
const { VALID_TAGS } = require('../models/Project')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const TIMEOUT_MS = 30000

const withTimeout = (promise) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS)),
  ])

// Try multiple model names in order of preference
const MODELS = [
  'gemini-2.0-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash',
  'gemini-pro',
]

const callGemini = async (prompt) => {
  let lastError = null
  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName })
      const result = await withTimeout(model.generateContent(prompt))
      return result.response.text()
    } catch (err) {
      lastError = err
      // If model not found, try next one
      if (err.message && (err.message.includes('404') || err.message.includes('not found'))) {
        continue
      }
      // For other errors (auth, quota, etc.), throw immediately
      throw err
    }
  }
  throw lastError
}

/** POST /api/ai/generate-description */
const generateDescription = async (req, res) => {
  try {
    const { bulletPoints } = req.body

    if (!bulletPoints || !Array.isArray(bulletPoints) || bulletPoints.length === 0)
      return res.status(400).json({ message: 'At least one bullet point is required.' })
    if (bulletPoints.length > 20)
      return res.status(400).json({ message: 'Maximum 20 bullet points allowed.' })

    const prompt = `Write a compelling project description (100-500 words) for a developer side project based on these bullet points:\n${bulletPoints.map((b) => `- ${b}`).join('\n')}\n\nReturn only the description text, no extra commentary.`

    const description = await callGemini(prompt)
    res.json({ description })
  } catch (err) {
    console.error('AI generateDescription error:', err.message)
    res.status(503).json({ message: 'AI service temporarily unavailable. Please try again later.' })
  }
}

/** POST /api/ai/suggest-tags */
const suggestTags = async (req, res) => {
  try {
    const { title, description } = req.body
    const missing = []
    if (!title) missing.push('title')
    if (!description) missing.push('description')
    if (missing.length)
      return res.status(400).json({ message: `Missing required fields: ${missing.join(', ')}` })

    const prompt = `Given this project title: "${title}" and description: "${description}", suggest 1-3 tags from this list only: ${VALID_TAGS.join(', ')}. Return ONLY a valid JSON array of tag strings, e.g. ["AI","SaaS"]. No explanation, no markdown, just the JSON array.`

    const raw = await callGemini(prompt)
    const cleaned = raw.replace(/```json?/gi, '').replace(/```/g, '').trim()

    let suggested = []
    try {
      suggested = JSON.parse(cleaned)
    } catch {
      const match = cleaned.match(/\[.*?\]/s)
      if (match) {
        try { suggested = JSON.parse(match[0]) } catch { suggested = [] }
      }
    }

    const valid = Array.isArray(suggested)
      ? suggested.filter((t) => VALID_TAGS.includes(t))
      : []

    res.json({ tags: valid })
  } catch (err) {
    console.error('AI suggestTags error:', err.message)
    res.status(503).json({ message: 'AI service temporarily unavailable. Please try again later.' })
  }
}

module.exports = { generateDescription, suggestTags }
