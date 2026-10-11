import { useRef, useEffect } from 'react'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import { MessageCircle } from 'lucide-react'

export default function ChatWindow({
  messages,
  isLoading,
  streamingContent,
  onSendMessage,
  title,
  subtitle,
  emptyMessage = 'Start a conversation to begin your session.'
}) {
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  const visibleMessages = messages.filter(m => !m.hidden)

  return (
    <div className="chat-page">
      <div className="chat-header">
        <div className="chat-message-avatar" style={{ background: 'var(--gradient-primary)', color: '#fff' }}>
          AI
        </div>
        <div className="chat-header-info">
          <h3>{title || 'AI-SPIKENG'}</h3>
          <span>{subtitle || 'English Learning Assistant'}</span>
        </div>
      </div>

      <div className="chat-messages">
        {visibleMessages.length === 0 && !isLoading && !streamingContent && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <MessageCircle size={28} />
            </div>
            <h3>Ready to Learn!</h3>
            <p>{emptyMessage}</p>
          </div>
        )}

        {visibleMessages.map((msg, idx) => (
          <ChatMessage key={idx} message={msg} />
        ))}

        {streamingContent && (
          <ChatMessage
            message={{ role: 'assistant', content: streamingContent }}
            isStreaming
          />
        )}

        {isLoading && !streamingContent && (
          <div className="chat-message ai">
            <div className="chat-message-avatar" style={{ background: 'var(--gradient-primary)', color: '#fff' }}>
              AI
            </div>
            <div className="chat-message-bubble" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
              <div className="typing-dots">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSend={onSendMessage} isLoading={isLoading} />
    </div>
  )
}
