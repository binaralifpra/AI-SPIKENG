import { useMemo } from 'react'
import { Volume2, Copy, Check } from 'lucide-react'
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis'
import { useState } from 'react'

// Enhanced markdown-like rendering (ChatGPT/Gemini style)
function renderContent(text) {
  if (!text) return null

  // Split into blocks by double newline
  const blocks = text.split(/\n\n+/)

  return blocks.map((block, blockIdx) => {
    // Check for code block
    if (block.trim().startsWith('```')) {
      return renderCodeBlock(block, blockIdx)
    }

    // Check for table
    if (block.includes('|') && block.split('\n').filter(l => l.trim().startsWith('|')).length >= 2) {
      return renderTable(block, blockIdx)
    }

    // Render lines
    const lines = block.split('\n')
    return (
      <div key={blockIdx} className="md-block">
        {lines.map((line, lineIdx) => renderLine(line, lineIdx))}
      </div>
    )
  })
}

function renderLine(line, key) {
  // Headers
  if (line.startsWith('#### ')) {
    return <h5 key={key} className="md-h4">{formatInline(line.slice(5))}</h5>
  }
  if (line.startsWith('### ')) {
    return <h4 key={key} className="md-h3">{formatInline(line.slice(4))}</h4>
  }
  if (line.startsWith('## ')) {
    return <h3 key={key} className="md-h2">{formatInline(line.slice(3))}</h3>
  }
  if (line.startsWith('# ')) {
    return <h2 key={key} className="md-h1">{formatInline(line.slice(2))}</h2>
  }

  // Horizontal rule
  if (/^[-─═]{3,}$/.test(line.trim())) {
    return <hr key={key} className="md-hr" />
  }

  // Blockquote
  if (line.trim().startsWith('> ')) {
    return (
      <blockquote key={key} className="md-blockquote">
        {formatInline(line.trim().slice(2))}
      </blockquote>
    )
  }

  // Bullet list (handle indented sublists)
  if (/^(\s*)[-•*]\s/.test(line)) {
    const indent = line.match(/^(\s*)/)[1].length
    return (
      <div key={key} className="md-list-item" style={{ paddingLeft: 16 + indent * 8 }}>
        <span className="md-bullet">•</span>
        {formatInline(line.trim().replace(/^[-•*]\s/, ''))}
      </div>
    )
  }

  // Numbered list
  if (/^\s*\d+[.)]\s/.test(line)) {
    const num = line.trim().match(/^(\d+)[.)]/)[1]
    const content = line.trim().replace(/^\d+[.)]\s/, '')
    return (
      <div key={key} className="md-list-item md-list-numbered">
        <span className="md-number">{num}.</span>
        {formatInline(content)}
      </div>
    )
  }

  // Empty line
  if (!line.trim()) return null

  // Regular paragraph
  return <p key={key} className="md-paragraph">{formatInline(line)}</p>
}

function renderCodeBlock(text, key) {
  const lines = text.trim().split('\n')
  const firstLine = lines[0].replace('```', '').trim()
  const lang = firstLine || 'text'
  const code = lines.slice(1, lines.length - 1).join('\n')

  return (
    <div key={key} className="md-code-block">
      <div className="md-code-header">
        <span>{lang}</span>
      </div>
      <pre><code>{code}</code></pre>
    </div>
  )
}

function renderTable(text, key) {
  const lines = text.split('\n').filter(l => l.trim().startsWith('|'))
  if (lines.length < 2) return <p key={key}>{text}</p>

  const parseRow = (line) =>
    line.split('|').slice(1, -1).map(cell => cell.trim())

  const headers = parseRow(lines[0])
  const isSeparator = (line) => /^\|[\s\-:|]+\|$/.test(line.trim())
  const dataLines = lines.filter((l, i) => i > 0 && !isSeparator(l))

  return (
    <div key={key} className="md-table-wrap">
      <table className="md-table">
        <thead>
          <tr>
            {headers.map((h, i) => <th key={i}>{formatInline(h)}</th>)}
          </tr>
        </thead>
        <tbody>
          {dataLines.map((line, i) => {
            const cells = parseRow(line)
            return (
              <tr key={i}>
                {cells.map((cell, j) => <td key={j}>{formatInline(cell)}</td>)}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function formatInline(text) {
  if (!text) return text

  const elements = []
  let keyCounter = 0

  // Process bold
  const boldRegex = /\*\*([^*]+)\*\*/g
  let lastIndex = 0
  let match

  const processText = (str) => {
    if (!str) return null
    // Process italic within text
    const italicRegex = /\*([^*]+)\*/g
    const parts = []
    let idx = 0
    let m

    while ((m = italicRegex.exec(str)) !== null) {
      if (m.index > idx) {
        // Process inline code in non-italic text
        parts.push(...processCode(str.slice(idx, m.index), keyCounter))
        keyCounter += 10
      }
      parts.push(<em key={`em-${keyCounter++}`}>{m[1]}</em>)
      idx = m.index + m[0].length
    }
    if (idx < str.length) {
      parts.push(...processCode(str.slice(idx), keyCounter))
      keyCounter += 10
    }
    return parts.length > 0 ? parts : str
  }

  const processCode = (str, base) => {
    if (!str) return []
    const codeRegex = /`([^`]+)`/g
    const parts = []
    let idx = 0
    let m

    while ((m = codeRegex.exec(str)) !== null) {
      if (m.index > idx) {
        parts.push(str.slice(idx, m.index))
      }
      parts.push(
        <code key={`code-${base}-${idx}`} className="md-inline-code">
          {m[1]}
        </code>
      )
      idx = m.index + m[0].length
    }
    if (idx < str.length) {
      parts.push(str.slice(idx))
    }
    return parts.length > 0 ? parts : [str]
  }

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const before = text.slice(lastIndex, match.index)
      elements.push(<span key={`t-${keyCounter++}`}>{processText(before)}</span>)
    }
    elements.push(<strong key={`b-${keyCounter++}`}>{match[1]}</strong>)
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    const rest = text.slice(lastIndex)
    elements.push(<span key={`t-${keyCounter++}`}>{processText(rest)}</span>)
  }

  return elements.length > 0 ? elements : text
}

export default function ChatMessage({ message, isStreaming }) {
  const { speak, stop, isSpeaking } = useSpeechSynthesis()
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'

  const content = useMemo(() => renderContent(message.content), [message.content])

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content?.replace(/[*#|_`]/g, '') || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`chat-message ${isUser ? 'user' : 'ai'} ${message.isError ? 'error' : ''}`}>
      <div className="chat-message-avatar">
        {isUser ? 'U' : 'AI'}
      </div>
      <div className="chat-message-body">
        <div className={isUser ? "chat-message-bubble" : "ai-document-content"}>
          <div className="md-content">
            {content}
          </div>
          {isStreaming && (
            <span className="streaming-cursor" />
          )}
        </div>

        {/* Action bar for AI messages */}
        {!isUser && !isStreaming && message.content && (
          <div className="chat-message-actions">
            {message.timestamp && (
              <span className="chat-message-time">
                {new Date(message.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button
              onClick={() => isSpeaking ? stop() : speak(message.content.replace(/[*#|_`]/g, ''))}
              className={`msg-action-btn ${isSpeaking ? 'active' : ''}`}
              title={isSpeaking ? 'Stop reading' : 'Read aloud'}
            >
              <Volume2 size={14} />
            </button>
            <button
              onClick={handleCopy}
              className={`msg-action-btn ${copied ? 'active' : ''}`}
              title="Copy text"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        )}

        {/* Timestamp for user messages */}
        {isUser && message.timestamp && (
          <div className="chat-message-actions">
            <span className="chat-message-time">
              {new Date(message.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
