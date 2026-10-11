import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getSkillLabel, getSkillColor, SKILLS } from '../../utils/dayTracker'

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function TrainingCalendar({ calendar = {} }) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const todayStr = new Date().toISOString().split('T')[0]

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  function getDateString(day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const calendarDays = []

  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      isOtherMonth: true,
      dateStr: null
    })
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = getDateString(d)
    calendarDays.push({
      day: d,
      isOtherMonth: false,
      isToday: dateStr === todayStr,
      dateStr,
      activities: calendar[dateStr]?.activities || []
    })
  }

  // Fill remaining with next month
  const remaining = 42 - calendarDays.length
  for (let d = 1; d <= remaining; d++) {
    calendarDays.push({
      day: d,
      isOtherMonth: true,
      dateStr: null
    })
  }

  return (
    <div className="calendar-container card">
      <div className="calendar-header">
        <h3>Training Calendar</h3>
        <div className="calendar-nav">
          <button className="btn btn-icon btn-ghost" onClick={prevMonth} id="cal-prev">
            <ChevronLeft size={18} />
          </button>
          <span style={{ fontWeight: 600, minWidth: 140, textAlign: 'center' }}>
            {MONTH_NAMES[month]} {year}
          </span>
          <button className="btn btn-icon btn-ghost" onClick={nextMonth} id="cal-next">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="calendar-grid">
        {DAYS_OF_WEEK.map(day => (
          <div key={day} className="calendar-day-name">{day}</div>
        ))}

        {calendarDays.map((cell, i) => (
          <div
            key={i}
            className={`calendar-day ${cell.isOtherMonth ? 'other-month' : ''} ${cell.isToday ? 'today' : ''}`}
          >
            {cell.day}
            {cell.activities && cell.activities.length > 0 && (
              <div className="calendar-dots">
                {cell.activities.map((skill, j) => (
                  <div
                    key={j}
                    className={`calendar-dot ${skill}`}
                    title={getSkillLabel(skill)}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="calendar-legend">
        {SKILLS.map(skill => (
          <div key={skill} className="calendar-legend-item">
            <div className="calendar-legend-dot" style={{ background: getSkillColor(skill) }} />
            {getSkillLabel(skill)}
          </div>
        ))}
      </div>
    </div>
  )
}
