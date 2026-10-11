import { useEffect, useRef, useState } from 'react'
import ChatMessageWidget from './ChatMessageWidget'
import ChatInputWidget from './ChatInputWidget'
import EditMessageDialog from './EditMessageDialog'

// Message list + input + "Edit Pesan" dialog, as in the Test/Training screens
export default function ChatView({ session }) {
  const { visibleMessages, isLoading, send, editAndResend } = session
  const [editing, setEditing] = useState(null)
  const listRef = useRef(null)
  const stickToBottom = useRef(true)

  const onScroll = () => {
    const el = listRef.current
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120
  }

  // Follow the stream unless the user scrolled up to read
  useEffect(() => {
    const el = listRef.current
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight
  }, [visibleMessages])

  const handleSend = (text) => {
    stickToBottom.current = true
    send(text)
  }

  const last = visibleMessages[visibleMessages.length - 1]

  return (
    <>
      <div className="chat-list" ref={listRef} onScroll={onScroll}>
        <div className="chat-list-inner">
          {visibleMessages.map((msg) => (
            <ChatMessageWidget
              key={msg.id}
              role={msg.role}
              content={msg.content}
              isStreaming={isLoading && msg === last && msg.role === 'assistant'}
              onEdit={msg.role === 'user' && !isLoading ? () => setEditing(msg) : undefined}
            />
          ))}
        </div>
      </div>
      <ChatInputWidget onSend={handleSend} isLoading={isLoading} />

      {editing && (
        <EditMessageDialog
          initialText={editing.content}
          onCancel={() => setEditing(null)}
          onSubmit={(text) => {
            const id = editing.id
            setEditing(null)
            stickToBottom.current = true
            editAndResend(id, text)
          }}
        />
      )}
    </>
  )
}
