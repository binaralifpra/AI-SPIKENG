// Chat flow shared by TestScreen and TrainingScreen (same behaviour as the mobile screens):
// hidden system prompt → AI opens the session → streaming replies → edit & resend.
import { useCallback, useEffect, useRef, useState } from 'react'
import { chatStream } from '../config/groqApi'

let nextId = 1
const makeMessage = (role, content, hidden = false) => ({ id: nextId++, role, content, hidden })

export function useChatSession({ onAssistantDone, onError } = {}) {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesRef = useRef([])
  const abortRef = useRef(null)
  const callbacks = useRef({ onAssistantDone, onError })
  callbacks.current = { onAssistantDone, onError }

  const commit = (next) => {
    messagesRef.current = next
    setMessages(next)
  }

  useEffect(() => () => abortRef.current?.abort(), [])

  const sendToApi = useCallback(async () => {
    setIsLoading(true)
    const apiMessages = messagesRef.current.map(({ role, content }) => ({ role, content }))
    const assistant = makeMessage('assistant', '')
    commit([...messagesRef.current, assistant])

    const controller = new AbortController()
    abortRef.current = controller
    try {
      const full = await chatStream(apiMessages, (chunk) => {
        commit(messagesRef.current.map((m) => (m.id === assistant.id ? { ...m, content: chunk } : m)))
      }, controller.signal)
      callbacks.current.onAssistantDone?.(full)
    } catch (e) {
      if (e.name === 'AbortError') return
      // Drop the empty assistant bubble, keep any partial text
      commit(messagesRef.current.filter((m) => m.id !== assistant.id || m.content))
      callbacks.current.onError?.(e)
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null
        setIsLoading(false)
      }
    }
  }, [])

  const start = useCallback((systemPrompt) => {
    commit([makeMessage('system', systemPrompt, true)])
    sendToApi()
  }, [sendToApi])

  const send = useCallback((text) => {
    commit([...messagesRef.current, makeMessage('user', text)])
    sendToApi()
  }, [sendToApi])

  /** Replace a user message: drop it and everything after, then resend the new text. */
  const editAndResend = useCallback((messageId, newText) => {
    const index = messagesRef.current.findIndex((m) => m.id === messageId)
    if (index === -1) return
    commit(messagesRef.current.slice(0, index))
    send(newText)
  }, [send])

  return {
    messages,
    visibleMessages: messages.filter((m) => !m.hidden),
    isLoading,
    start,
    send,
    editAndResend,
  }
}
