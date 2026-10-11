import { MessageCircle } from 'lucide-react'
import TrainingPage from './TrainingPage'

export default function ConversationPage() {
  return (
    <TrainingPage
      skillType="conversation"
      title="Conversation"
      subtitle="Practice real dialogues"
      icon={MessageCircle}
      color="var(--color-conversation)"
    />
  )
}
