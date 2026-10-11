const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
const MODEL = 'llama-3.3-70b-versatile'

export async function chatWithAI(messages, onStream = null) {
  const isStreaming = typeof onStream === 'function'

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 4096,
      stream: isStreaming
    })
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error?.message || `API error: ${response.status}`)
  }

  if (!isStreaming) {
    const data = await response.json()
    return data.choices[0].message.content
  }

  // Streaming response
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let fullContent = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value)
    const lines = chunk.split('\n').filter(line => line.trim().startsWith('data: '))

    for (const line of lines) {
      const data = line.replace('data: ', '').trim()
      if (data === '[DONE]') continue

      try {
        const parsed = JSON.parse(data)
        const content = parsed.choices?.[0]?.delta?.content || ''
        fullContent += content
        onStream(fullContent)
      } catch {
        // Skip malformed JSON chunks
      }
    }
  }

  return fullContent
}
