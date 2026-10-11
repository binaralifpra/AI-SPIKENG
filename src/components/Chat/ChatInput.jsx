import { useState, useRef, useEffect } from 'react'
import { Send, Mic, MicOff, Square } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition'

export default function ChatInput({ onSend, isLoading }) {
  const { userData } = useAuth()
  const languagePref = userData?.settings?.language || 'hybrid'
  const speechLang = languagePref === 'english' ? 'en-US' : 'id-ID'

  const [text, setText] = useState('')
  const textareaRef = useRef(null)
  const {
    isListening, transcript, isSupported,
    startListening, stopListening, resetTranscript
  } = useSpeechRecognition(speechLang)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px'
    }
  }, [text])

  // Update text with transcript while listening
  useEffect(() => {
    if (isListening && transcript) {
      setText(transcript)
    }
  }, [transcript, isListening])

  function handleSend() {
    const content = text.trim()
    if (!content || isLoading) return

    if (isListening) {
      stopListening()
    }
    onSend(content)
    setText('')
    resetTranscript()
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function toggleRecording() {
    if (isListening) {
      stopListening()
    } else {
      setText('')
      resetTranscript()
      startListening()
    }
  }

  return (
    <div className="chat-input-area">
      <div className="chat-input-container">
        {/* Voice recorder button */}
        {isSupported && (
          <button
            className={`voice-recorder-btn ${isListening ? 'recording' : 'idle'}`}
            onClick={toggleRecording}
            disabled={isLoading}
            title={isListening ? 'Stop recording' : 'Start voice input'}
            id="voice-recorder-btn"
          >
            {isListening ? <Square size={20} /> : <Mic size={20} />}
          </button>
        )}

        {/* Text input */}
        <div className="chat-input-wrapper">
          <textarea
            ref={textareaRef}
            className="chat-input"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? 'Listening... Speak now' : 'Type a message or use the microphone...'}
            rows={1}
            disabled={isLoading}
            id="chat-text-input"
          />
          <button
            className="chat-send-btn"
            onClick={handleSend}
            disabled={!text.trim() || isLoading}
            title="Send message"
            id="chat-send-btn"
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      {isListening && (
        <div style={{
          textAlign: 'center', marginTop: 8,
          fontSize: '0.8rem', color: 'var(--danger)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--danger)', animation: 'pulse 1s infinite'
          }} />
          Recording... Click the button to stop
        </div>
      )}

      {!isSupported && (
        <div style={{
          textAlign: 'center', marginTop: 8,
          fontSize: '0.75rem', color: 'var(--text-tertiary)'
        }}>
          Voice input not supported in this browser. Use Chrome or Edge for voice features.
        </div>
      )}
    </div>
  )
}
