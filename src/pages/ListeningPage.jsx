import { Headphones } from 'lucide-react'
import TrainingPage from './TrainingPage'

export default function ListeningPage() {
  return (
    <TrainingPage
      skillType="listening"
      title="Listening"
      subtitle="Improve your comprehension"
      icon={Headphones}
      color="var(--color-listening)"
    />
  )
}
