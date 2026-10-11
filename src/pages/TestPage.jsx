import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useChat } from '../hooks/useChat'
import ChatWindow from '../components/Chat/ChatWindow'
import { parseCefrFromResponse } from '../utils/cefrLevels'
import { Award, ArrowRight } from 'lucide-react'

export default function TestPage() {
  const { userData, updateUserData } = useAuth()
  const navigate = useNavigate()
  const [showResults, setShowResults] = useState(false)
  const [cefrResults, setCefrResults] = useState(null)

  const userName = userData?.profile?.name || 'User'
  const gender = userData?.profile?.gender || 'male'
  const language = userData?.settings?.language || 'hybrid'

  const { messages, isLoading, streamingContent, sendMessage, startSession } = useChat(
    'test',
    { userName, gender, level: 'unknown', day: 1, language }
  )

  // Auto-start the test
  useEffect(() => {
    if (messages.length === 0) {
      startSession()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Watch for CEFR results in AI responses
  useEffect(() => {
    for (const msg of messages) {
      if (msg.role === 'assistant') {
        const results = parseCefrFromResponse(msg.content)
        if (results && !cefrResults) {
          setCefrResults(results)
          setShowResults(true)

          // Save to Firestore
          updateUserData({
            cefrLevels: results,
            testCompleted: true
          })
        }
      }
    }
  }, [messages]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ margin: 'calc(-1 * var(--space-xl))', height: 'calc(100vh - 60px)', position: 'relative' }}>
      <ChatWindow
        messages={messages}
        isLoading={isLoading}
        streamingContent={streamingContent}
        onSendMessage={sendMessage}
        title="CEFR Assessment Test"
        subtitle="Discover your English proficiency level"
        emptyMessage="The assessment will test your Speaking, Grammar, Vocabulary, Reading, and Writing skills."
      />

      {/* Results Modal */}
      {showResults && cefrResults && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 520 }}>
            <div className="level-up-modal">
              <div className="level-up-icon">
                <Award size={40} />
              </div>
              <h3>Assessment Complete!</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
                Here are your CEFR levels across all skills:
              </p>

              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: 12, marginBottom: 24
              }}>
                {Object.entries(cefrResults).filter(([k]) => k !== 'overall').map(([skill, level]) => (
                  <div key={skill} style={{
                    padding: '12px 16px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'left'
                  }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'capitalize' }}>
                      {skill}
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                      <span className={`badge badge-${level.toLowerCase()}`}>{level}</span>
                    </div>
                  </div>
                ))}
              </div>

              {cefrResults.overall && (
                <div style={{
                  padding: 16, background: 'rgba(108, 99, 255, 0.1)',
                  borderRadius: 'var(--radius-md)', marginBottom: 24
                }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Overall Level</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                    {cefrResults.overall}
                  </div>
                </div>
              )}

              <button
                className="btn btn-primary btn-lg"
                onClick={() => navigate('/dashboard')}
                style={{ width: '100%' }}
                id="go-to-dashboard-btn"
              >
                Go to Dashboard <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
