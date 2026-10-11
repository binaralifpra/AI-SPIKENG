import { PenTool } from 'lucide-react'
import TrainingPage from './TrainingPage'

export default function GrammarPage() {
  return (
    <TrainingPage
      skillType="grammar"
      title="Grammar"
      subtitle="Master sentence patterns"
      icon={PenTool}
      color="var(--color-grammar)"
    />
  )
}
