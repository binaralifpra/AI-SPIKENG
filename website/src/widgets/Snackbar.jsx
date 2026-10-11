import { useEffect } from 'react'

export default function Snackbar({ message, onDismiss, duration = 5000 }) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onDismiss, duration)
    return () => clearTimeout(t)
  }, [message, onDismiss, duration])

  if (!message) return null
  return (
    <div className="snackbar" role="alert" onClick={onDismiss}>{message}</div>
  )
}
