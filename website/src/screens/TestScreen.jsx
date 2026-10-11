import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../providers/AuthProvider'
import { getTestPrompt } from '../config/prompts'
import { parseCefrFromResponse } from '../utils/cefrLevels'
import { getTodayString } from '../utils/dayTracker'
import { useChatSession } from '../hooks/useChatSession'
import AppShell from '../widgets/AppShell'
import ChatView from '../widgets/ChatView'
import Dialog from '../widgets/Dialog'
import Snackbar from '../widgets/Snackbar'

export default function TestScreen() {
  const { userData, updateUserData } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [finished, setFinished] = useState(false)
  const userDataRef = useRef(userData)
  userDataRef.current = userData

  const checkCefrResults = async (text) => {
    const results = parseCefrFromResponse(text)
    if (!results) return

    const current = userDataRef.current
    const today = getTodayString()
    const calendar = current?.calendar ?? {}
    const dayActivities = [...(calendar[today]?.activities ?? [])]
    if (!dayActivities.includes('test')) dayActivities.push('test')

    try {
      await updateUserData({
        cefrLevels: results,
        testCompleted: true,
        calendar: { ...calendar, [today]: { activities: dayActivities } },
      })
      setFinished(true)
    } catch (e) {
      setError(`Error: ${e.message}`)
    }
  }

  const session = useChatSession({
    onAssistantDone: checkCefrResults,
    onError: (e) => setError(`Error: ${e.message}`),
  })

  const started = useRef(false)
  useEffect(() => {
    if (started.current) return
    started.current = true
    session.start(getTestPrompt({
      userName: userData?.profile?.name || 'User',
      gender: userData?.profile?.gender || 'male',
      language: userData?.settings?.language || 'hybrid',
    }))
  }, [session, userData])

  const dismissError = useCallback(() => setError(''), [])

  return (
    <AppShell title="CEFR Test" showBack chat>
      <ChatView session={session} />
      <Snackbar message={error} onDismiss={dismissError} />
      {finished && (
        <Dialog
          title="Tes Selesai! 🎉"
          actions={
            <button className="btn-text" onClick={() => navigate('/dashboard', { replace: true })}>
              Kembali ke Dashboard
            </button>
          }
        >
          Kemampuan bahasamu telah diukur. Sekarang kamu bisa memulai latihan harian!
        </Dialog>
      )}
    </AppShell>
  )
}
