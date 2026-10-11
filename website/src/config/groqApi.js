// Same AI API as the mobile app: Groq (OpenAI-compatible).
// llama-3.3-70b-versatile is not available to the current key, so the default is gpt-oss-120b.
// Override with VITE_GROQ_MODEL in .env.
const API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = import.meta.env.VITE_GROQ_MODEL || 'openai/gpt-oss-120b'
const API_KEY = import.meta.env.VITE_GROQ_API_KEY || ''

// gpt-oss models "think" before answering: keep it short and don't stream the reasoning
const isReasoningModel = MODEL.startsWith('openai/gpt-oss')

function buildBody(messages, stream) {
  return JSON.stringify({
    model: MODEL,
    messages,
    temperature: 0.7,
    max_tokens: 4096,
    stream,
    ...(isReasoningModel ? { reasoning_effort: 'low', include_reasoning: false } : {})
  })
}

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${API_KEY}`
}

export async function chat(messages) {
  const response = await fetch(API_URL, { method: 'POST', headers, body: buildBody(messages, false) })
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || `API error: ${response.status}`)
  }
  const data = await response.json()
  return data.choices[0].message.content
}

/** Streaming chat — calls onChunk(fullContentSoFar) as content arrives, resolves with the full text. */
export async function chatStream(messages, onChunk, signal) {
  const response = await fetch(API_URL, { method: 'POST', headers, body: buildBody(messages, true), signal })
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || `API error: ${response.status}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let fullContent = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    // Keep the last (possibly incomplete) line in the buffer
    const lines = buffer.split('\n')
    buffer = lines.pop()

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data: ')) continue
      const data = trimmed.slice(6).trim()
      if (data === '[DONE]') continue
      try {
        const parsed = JSON.parse(data)
        fullContent += parsed.choices?.[0]?.delta?.content || ''
        onChunk(fullContent)
      } catch {
        // Skip malformed JSON chunks
      }
    }
  }

  return fullContent
}
