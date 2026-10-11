import { BookOpen } from 'lucide-react'
import TrainingPage from './TrainingPage'

export default function VocabularyPage() {
  return (
    <TrainingPage
      skillType="vocabulary"
      title="Vocabulary"
      subtitle="Build your word power"
      icon={BookOpen}
      color="var(--color-vocabulary)"
    />
  )
}
