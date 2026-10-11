import { formatDate } from '../utils/dayTracker'

// Same legend colors as training_calendar_widget.dart (Material Colors.*)
const activityColors = {
  test: '#4CAF50',
  vocabulary: '#9C27B0',
  speaking: '#FF9800',
  grammar: '#2196F3',
  listening: '#F44336',
  conversation: '#E91E63',
}

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function TrainingCalendarWidget({ calendarData = {} }) {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  // Monday-first offset (Dart weekday: Mon=1 … Sun=7)
  const startOffset = (new Date(year, month, 1).getDay() + 6) % 7
  const monthLabel = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const cells = []
  for (let i = 0; i < startOffset; i++) cells.push(<div key={`e${i}`} />)
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDate(new Date(year, month, day))
    const isToday = day === today.getDate()
    const activities = [...new Set(calendarData[dateStr]?.activities ?? [])]
    cells.push(
      <div key={day} className={`cal-day${isToday ? ' today' : ''}`} title={activities.join(', ') || undefined}>
        <span className="cal-num">{day}</span>
        {activities.length > 0 && (
          <div className="cal-dots">
            {activities.map((act) => (
              <span key={act} className="dot" style={{ background: activityColors[act.toLowerCase()] ?? '#9E9E9E' }} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="calendar">
      <div className="cal-title">{monthLabel}</div>
      <div className="cal-legend">
        {Object.entries(activityColors).map(([key, color]) => (
          <span key={key} className="legend-item">
            <span className="dot dot-lg" style={{ background: color }} />
            {key.toUpperCase()}
          </span>
        ))}
      </div>
      <div className="cal-grid cal-head">
        {weekDays.map((d) => <div key={d}>{d}</div>)}
      </div>
      <div className="cal-grid">{cells}</div>
    </div>
  )
}
