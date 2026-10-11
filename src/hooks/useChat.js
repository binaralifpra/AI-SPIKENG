import { useState, useCallback, useRef } from 'react'
import { chatWithAI } from '../config/groq'
import { SKILL_PROMPTS } from '../config/prompts'

const CORRECTION_INSTRUCTION = `

INSTRUKSI KOREKSI WAJIB:
- Jika user melakukan kesalahan grammar, typo, atau mencampur bahasa (contoh: "I want to pergi"), KAMU WAJIB MENGOREKSINYA SECARA KESELURUHAN.
- Berikan penjabaran koreksi yang SANGAT RAPI, DETAIL, dan EDUKATIF. Gunakan markdown dengan baik (bullet points, bold, italic). Jangan menggunakan kata-kata yang membingungkan.
- Koreksi jawaban user WAJIB berupa perbaikan kalimat dalam BAHASA INGGRIS (English), bukan menerjemahkan jawaban ke Bahasa Indonesia.
- KAMU WAJIB MENGGUNAKAN FORMAT TABEL KOREKSI 3 KOLOM SEPERTI INI:

| Kalimat Kamu | Koreksi (English) | Penjelasan Detail (Indonesia) |
|---|---|---|
| [kalimat user yg salah] | [perbaikan kalimat dlm Bahasa Inggris] | [Penjelasan detail grammar & alasan salah] |

- Setelah tabel koreksi, berikan penjelasan tambahan, tips, atau contoh kalimat lain yang relevan secara rapi.
- Lakukan semua koreksi dalam satu respons.`

const LANGUAGE_INSTRUCTIONS = {
  hybrid: `\n\nPREFERENSI BAHASA: Mode HYBRID (Indonesia + Inggris). 
- Penjelasan, instruksi, dan koreksi WAJIB menggunakan Bahasa Indonesia agar mudah dipahami.
- UNTUK SETIAP MATERI ATAU PERTANYAAN, WAJIB TULIS DALAM BAHASA INGGRIS LALU BERIKAN TERJEMAHAN BAHASA INDONESIA DI BAWAHNYA (*italic*). Jangan pernah memberikan soal hanya dalam satu bahasa.`,

  english: `\n\nLANGUAGE PREFERENCE: ENGLISH ONLY mode.
- Write ALL instructions, explanations, questions, and corrections purely in English.
- Do not use Indonesian at all.`
}

export function useChat(skillType, { userName, gender, level, day, language = 'hybrid' }) {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const abortControllerRef = useRef(null)

  const getSystemPrompt = useCallback(() => {
    const promptFn = SKILL_PROMPTS[skillType]
    if (!promptFn) return ''
    let prompt = promptFn({ userName, gender, level, day, language })
    prompt += CORRECTION_INSTRUCTION
    prompt += LANGUAGE_INSTRUCTIONS[language] || LANGUAGE_INSTRUCTIONS.hybrid
    return prompt
  }, [skillType, userName, gender, level, day, language])

  const sendMessage = useCallback(async (content) => {
    if (!content.trim() || isLoading) return

    const userMessage = {
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setStreamingContent('')

    try {
      const systemPrompt = getSystemPrompt()
      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: content.trim() }
      ]

      const fullContent = await chatWithAI(apiMessages, (partial) => {
        setStreamingContent(partial)
      })

      const aiMessage = {
        role: 'assistant',
        content: fullContent,
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, aiMessage])
      setStreamingContent('')
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = {
        role: 'assistant',
        content: `⚠️ Maaf, terjadi kesalahan: ${error.message}. Silakan coba lagi.`,
        timestamp: new Date().toISOString(),
        isError: true
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setStreamingContent('')
    }
  }, [messages, isLoading, getSystemPrompt])

  const startSession = useCallback(async () => {
    if (isLoading || messages.length > 0) return

    setIsLoading(true)
    setStreamingContent('')

    try {
      const systemPrompt = getSystemPrompt()
      const apiMessages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: "Let's go! Mulai sesi kita." }
      ]

      const fullContent = await chatWithAI(apiMessages, (partial) => {
        setStreamingContent(partial)
      })

      setMessages([
        {
          role: 'user',
          content: "Let's go! Mulai sesi kita.",
          timestamp: new Date().toISOString(),
          hidden: true
        },
        {
          role: 'assistant',
          content: fullContent,
          timestamp: new Date().toISOString()
        }
      ])
      setStreamingContent('')
    } catch (error) {
      console.error('Session start error:', error)
      setMessages([{
        role: 'assistant',
        content: `⚠️ Gagal memulai sesi: ${error.message}. Refresh halaman dan coba lagi.`,
        timestamp: new Date().toISOString(),
        isError: true
      }])
    } finally {
      setIsLoading(false)
      setStreamingContent('')
    }
  }, [isLoading, messages.length, getSystemPrompt])

  const clearMessages = useCallback(() => {
    setMessages([])
    setStreamingContent('')
  }, [])

  return {
    messages,
    isLoading,
    streamingContent,
    sendMessage,
    startSession,
    clearMessages
  }
}
