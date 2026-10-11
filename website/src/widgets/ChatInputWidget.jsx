import { useEffect, useRef, useState } from 'react'
import { Mic, Send, Square } from 'lucide-react'
import { useAuth } from '../providers/AuthProvider'
import { useSpeechToText } from '../hooks/useSpeechToText'

export default function ChatInputWidget({ onSend, isLoading = false }) {
  const { userData } = useAuth()
  const [text, setText] = useState('')
  const textRef = useRef('')
  const inputRef = useRef(null)

  const updateText = (value) => {
    textRef.current = value
    setText(value)
  }

  // Same locale rule as the app: English-only → en-US, Hybrid → id-ID
  const locale = userData?.settings?.language === 'english' ? 'en-US' : 'id-ID'
  const speech = useSpeechToText({ locale, getText: () => textRef.current, setText: updateText })

  // Auto-grow up to 4 lines
  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }, [text])

  useEffect(() => {
    if (!isLoading) inputRef.current?.focus({ preventScroll: true })
  }, [isLoading])

  const send = () => {
    const value = textRef.current.trim()
    if (!value || isLoading) return
    if (speech.isListening) speech.stop()
    onSend(value)
    updateText('')
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="chat-input">
      <div className="chat-input-row">
        {speech.available && (
          <button
            className={`round-btn mic-btn${speech.isListening ? ' recording' : ''}`}
            onClick={speech.toggle}
            disabled={isLoading}
            title={speech.isListening ? 'Stop' : 'Bicara (voice input)'}
            aria-label={speech.isListening ? 'Stop recording' : 'Start recording'}
          >
            {speech.isListening ? <Square size={18} fill="currentColor" /> : <Mic size={22} />}
          </button>
        )}
        <textarea
          ref={inputRef}
          className="chat-textarea"
          rows={1}
          value={text}
          disabled={isLoading}
          placeholder={speech.isListening ? 'Listening... Speak now' : 'Type a message...'}
          onChange={(e) => updateText(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button
          className="round-btn send-btn"
          onClick={send}
          disabled={isLoading || !text.trim()}
          aria-label="Send"
        >
          <Send size={19} />
        </button>
      </div>
      {speech.isListening && (
        <div className="recording-indicator"><span className="rec-dot" /> Recording...</div>
      )}
    </div>
  )
}
