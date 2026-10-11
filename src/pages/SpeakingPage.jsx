import { Mic } from 'lucide-react'
import TrainingPage from './TrainingPage'

export default function SpeakingPage() {
  return (
    <TrainingPage
      skillType="speaking"
      title="Speaking"
      subtitle="Practice your pronunciation"
      icon={Mic}
      color="var(--color-speaking)"
    />
  )
}
