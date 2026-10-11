import { memo, useMemo } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { Pencil } from 'lucide-react'
import Logo from './Logo'

marked.setOptions({ gfm: true, breaks: true })

function renderMarkdown(text) {
  const html = DOMPurify.sanitize(marked.parse(text || ''))
  // Let wide correction tables scroll horizontally instead of breaking the layout
  return html.replace(/<table>/g, '<div class="md-table-wrap"><table>').replace(/<\/table>/g, '</table></div>')
}

function ChatMessageWidget({ role, content, isStreaming = false, onEdit }) {
  const isUser = role === 'user'
  const html = useMemo(() => (isUser ? null : renderMarkdown(content)), [isUser, content])

  if (isUser) {
    return (
      <div className="msg msg-user">
        {onEdit && (
          <button className="icon-btn msg-edit" onClick={onEdit} title="Edit pesan" aria-label="Edit pesan">
            <Pencil size={16} />
          </button>
        )}
        <div className="msg-bubble">{content}</div>
      </div>
    )
  }

  return (
    <div className="msg msg-ai">
      <Logo size={32} radius={10} fontSize={11} />
      <div className="msg-ai-body">
        {content
          ? <div className="markdown" dangerouslySetInnerHTML={{ __html: html }} />
          : isStreaming && <div className="typing"><span /><span /><span /></div>}
      </div>
    </div>
  )
}

export default memo(ChatMessageWidget)
