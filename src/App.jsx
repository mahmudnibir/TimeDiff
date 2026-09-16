import { useMemo, useState } from 'react'
import './App.css'
import {
    TIME_ZONES,
    addDaysToDate,
    buildShareUrl,
    calculateBusinessDays,
    calculateDateDifference,
    calculateTimeDifference,
    convertToTimestamp,
    formatDateForDisplay,
    generateRecurringDates,
    getTimeZoneTime,
    getWeekBreakdown,
    parseQuickInput,
    subtractDaysFromDate,
} from './timediff.js'

const tabs = ['Quick', 'Date', 'Time', 'Add/Subtract', 'Business Days', 'Timezones', 'Recurring']

const toolHelp = {
  Quick: {
    title: 'How it works',
    description: 'Type a natural time phrase and TimeDiff converts it into an instant answer.',
    examples: ['45 days from today', '10:30 AM -> 6:45 PM'],
  },
  Date: {
    title: 'What it means',
    description: 'This compares two dates and shows the exact day difference, total hours, and broken-down time.',
    examples: ['2026-09-16 → 2026-10-30', 'Weeks, months, and minutes'],
  },
  Time: {
    title: 'What it means',
    description: 'This measures the elapsed duration between two clock times.',
    examples: ['10:30 AM to 6:45 PM', '8h 15m'],
  },
  'Add/Subtract': {
    title: 'How it works',
    description: 'Choose add or subtract and TimeDiff shifts the date by the number of days you enter.',
    examples: ['+45 days', '-12 days'],
  },
  'Business Days': {
    title: 'What it means',
    description: 'This counts working days between two dates and can exclude holidays you list.',
    examples: ['Mon–Fri only', '2026-09-22, 2026-10-01'],
  },
  Timezones: {
    title: 'How it works',
    description: 'Pick a timezone to see the same instant rendered in that location.',
    examples: ['Asia/Tokyo', 'UNIX timestamp'],
  },
  Recurring: {
    title: 'What it means',
    description: 'This builds a repeating schedule based on a start date, interval, and unit.',
    examples: ['Every 2 weeks', '6 future dates'],
  },
}

const readInitialUrlState = () => {
  const params = new URLSearchParams(window.location.search)

  return {
    activeTool: params.get('tool') && tabs.includes(params.get('tool')) ? params.get('tool') : 'Quick',
    quickInput: params.get('quick') || '45 days from today',
    fromDate: params.get('fromDate') || '2026-09-16',
    toDate: params.get('toDate') || '2026-10-30',
  }
}

const parseDateValue = (value) => {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

const formatDateValue = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function DatePicker({ label, value, onChange }) {
  const selectedDate = parseDateValue(value)
  const [isOpen, setIsOpen] = useState(false)
  const [visibleMonth, setVisibleMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1))
  const monthLabel = visibleMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  const firstDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1).getDay()
  const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate()
  const calendarDays = Array.from({ length: firstDay + daysInMonth }, (_, index) => {
    if (index < firstDay) return null
    return new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), index - firstDay + 1)
  })

  return (
    <div className="picker-field">
      <span>{label}</span>
      <div className="date-picker">
        <button type="button" className="picker-trigger" onClick={() => setIsOpen((current) => !current)} aria-expanded={isOpen}>
          <span>{selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          <span className="picker-icon" aria-hidden="true">▦</span>
        </button>
        {isOpen && (
          <div className="picker-popover" role="dialog" aria-label={`${label} calendar`}>
            <div className="calendar-header">
              <strong>{monthLabel}</strong>
              <div className="calendar-nav">
                <button type="button" onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))} aria-label="Previous month">‹</button>
                <button type="button" onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))} aria-label="Next month">›</button>
              </div>
            </div>
            <div className="calendar-weekdays">{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div>
            <div className="calendar-grid">
              {calendarDays.map((day, index) => day ? (
                <button
                  type="button"
                  key={formatDateValue(day)}
                  className={formatDateValue(day) === value ? 'calendar-day selected' : 'calendar-day'}
                  onClick={() => {
                    onChange(formatDateValue(day))
                    setIsOpen(false)
                  }}
                >
                  {day.getDate()}
                </button>
              ) : <span className="calendar-empty" key={`empty-${index}`} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function DateTimePicker({ value, onChange }) {
  const dateValue = value.slice(0, 10)
  const timeValue = value.slice(11, 16)

  return (
    <div className="picker-field">
      <span>ISO date</span>
      <div className="datetime-picker">
        <DatePicker label="" value={dateValue} onChange={(nextDate) => onChange(`${nextDate}T${timeValue || '00:00'}:00Z`)} />
        <input className="app-field time-field" type="text" inputMode="numeric" value={timeValue} placeholder="00:00" onChange={(event) => onChange(`${dateValue}T${event.target.value}:00Z`)} aria-label="Time" />
      </div>
    </div>
  )
}

function TimezonePicker({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const filteredZones = TIME_ZONES.filter((zone) => zone.toLowerCase().includes(query.toLowerCase())).slice(0, 80)

  return (
    <div className="picker-field">
      <span>Timezone</span>
      <div className="timezone-picker">
        <button type="button" className="picker-trigger" onClick={() => setIsOpen((current) => !current)} aria-expanded={isOpen}>
          <span>{value}</span>
          <span className="picker-icon" aria-hidden="true">⌄</span>
        </button>
        {isOpen && (
          <div className="timezone-popover" role="dialog" aria-label="Timezone picker">
            <input autoFocus className="app-field timezone-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search timezones" />
            <div className="timezone-options" role="listbox">
              {filteredZones.map((zone) => (
                <button type="button" role="option" aria-selected={zone === value} className={zone === value ? 'timezone-option selected' : 'timezone-option'} key={zone} onClick={() => { onChange(zone); setIsOpen(false); setQuery('') }}>{zone}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function OptionPicker({ label, value, options, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const currentOption = options.find((option) => option.value === value)

  return (
    <div className="picker-field">
      <span>{label}</span>
      <div className="timezone-picker">
        <button type="button" className="picker-trigger" onClick={() => setIsOpen((current) => !current)} aria-expanded={isOpen}>
          <span>{currentOption?.label || value}</span>
          <span className="picker-icon" aria-hidden="true">⌄</span>
        </button>
        {isOpen && (
          <div className="option-popover" role="listbox" aria-label={label}>
            {options.map((option) => (
              <button type="button" role="option" aria-selected={option.value === value} className={option.value === value ? 'timezone-option selected' : 'timezone-option'} key={option.value} onClick={() => { onChange(option.value); setIsOpen(false) }}>{option.label}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function App() {
  const today = new Date().toISOString().slice(0, 10)
  const initialUrlState = readInitialUrlState()

  const [activeTool, setActiveTool] = useState(initialUrlState.activeTool)
  const [quickInput, setQuickInput] = useState(initialUrlState.quickInput)
  const [fromDate, setFromDate] = useState(initialUrlState.fromDate)
  const [toDate, setToDate] = useState(initialUrlState.toDate)
  const [fromTime, setFromTime] = useState('10:30 AM')
  const [toTime, setToTime] = useState('6:45 PM')
  const [offsetDate, setOffsetDate] = useState('2026-09-16')
  const [offsetDays, setOffsetDays] = useState(45)
  const [operation, setOperation] = useState('add')
  const [businessStart, setBusinessStart] = useState('2026-09-16')
  const [businessEnd, setBusinessEnd] = useState('2026-09-30')
  const [holidayInput, setHolidayInput] = useState('2026-09-22, 2026-10-01')
  const [weekendDays, setWeekendDays] = useState([0, 6])
  const [timestampInput, setTimestampInput] = useState('2026-09-16T00:00:00Z')
  const [timeZone, setTimeZone] = useState('Asia/Tokyo')
  const [recurringStart, setRecurringStart] = useState('2026-09-16')
  const [recurringInterval, setRecurringInterval] = useState(2)
  const [recurringUnit, setRecurringUnit] = useState('week')
  const [recurringCount, setRecurringCount] = useState(6)

  const quickResult = useMemo(() => {
    try {
      return parseQuickInput(quickInput, today)
    } catch {
      return null
    }
  }, [quickInput, today])

  const dateDifference = useMemo(() => {
    try {
      return calculateDateDifference(fromDate, toDate)
    } catch {
      return null
    }
  }, [fromDate, toDate])

  const timeDifference = useMemo(() => {
    try {
      return calculateTimeDifference(fromTime, toTime)
    } catch {
      return null
    }
  }, [fromTime, toTime])

  const adjustedDate = useMemo(() => {
    try {
      const nextDate = operation === 'add'
        ? addDaysToDate(offsetDate, Number(offsetDays))
        : subtractDaysFromDate(offsetDate, Number(offsetDays))
      return nextDate
    } catch {
      return null
    }
  }, [offsetDate, offsetDays, operation])

  const businessRange = useMemo(() => {
    try {
      return calculateBusinessDays(businessStart, businessEnd, {
        excludeWeekends: true,
        holidays: holidayInput,
        weekendDays,
      })
    } catch {
      return null
    }
  }, [businessStart, businessEnd, holidayInput, weekendDays])

  const timestampValue = useMemo(() => {
    try {
      return convertToTimestamp(timestampInput)
    } catch {
      return null
    }
  }, [timestampInput])

  const recurringDates = useMemo(() => {
    try {
      return generateRecurringDates(recurringStart, recurringInterval, recurringUnit, recurringCount)
    } catch {
      return []
    }
  }, [recurringStart, recurringInterval, recurringUnit, recurringCount])

  const weekBreakdown = dateDifference ? getWeekBreakdown(dateDifference.totalDays) : null
  const timezoneOutput = getTimeZoneTime(timestampInput, timeZone)

  const formatQuickSummary = () => {
    if (!quickResult) return '—'

    if (quickResult.kind === 'date-offset') {
      return quickResult.result
    }

    if (quickResult.kind === 'date-difference') {
      return `${quickResult.result.totalDays} days`
    }

    if (quickResult.kind === 'time-difference') {
      return `${quickResult.result.hours}h ${quickResult.result.minutes}m`
    }

    return '—'
  }

  const shareUrl = useMemo(() => {
    const state = {
      tool: activeTool,
      quick: quickInput,
      fromDate,
      toDate,
      fromTime,
      toTime,
      offsetDate,
      offsetDays,
      operation,
      businessStart,
      businessEnd,
      holidayInput,
      timestampInput,
      timeZone,
    }

    return buildShareUrl(window.location.pathname, state)
  }, [activeTool, quickInput, fromDate, toDate, fromTime, toTime, offsetDate, offsetDays, operation, businessStart, businessEnd, holidayInput, timestampInput, timeZone])

  const copyResult = async () => {
    let result = '—'

    if (activeTool === 'Quick') {
      result = formatQuickSummary()
    } else if (activeTool === 'Date') {
      result = `${dateDifference?.totalDays ?? 0} days`
    } else if (activeTool === 'Time') {
      result = `${timeDifference?.hours ?? 0}h ${timeDifference?.minutes ?? 0}m`
    } else if (activeTool === 'Add/Subtract') {
      result = adjustedDate ?? '—'
    } else if (activeTool === 'Business Days') {
      result = `${businessRange?.workingDays ?? 0} working days`
    } else if (activeTool === 'Timezones') {
      result = timezoneOutput
    } else if (activeTool === 'Recurring') {
      result = recurringDates.join(', ')
    } else {
      result = `${timestampValue ?? '—'} unix timestamp`
    }

    try {
      await navigator.clipboard.writeText(result)
    } catch {
      // clipboard unavailable
    }
  }

  const copyShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
    } catch {
      // clipboard unavailable
    }
  }

  const renderToolPanel = () => {
    const helpContent = toolHelp[activeTool]

    const helpCard = (
      <div className="help-card" aria-live="polite">
        <p className="help-label">{helpContent.title}</p>
        <strong>{helpContent.description}</strong>
        <div className="help-tags">
          {helpContent.examples.map((example) => (
            <span key={example}>{example}</span>
          ))}
        </div>
      </div>
    )

    if (activeTool === 'Quick') {
      return (
        <div className="tool-panel">
          {helpCard}
          <label className="input-block">
            <span>Quick mode</span>
            <input
              className="app-field"
              type="text"
              value={quickInput}
              onChange={(event) => setQuickInput(event.target.value)}
              placeholder="45 days from today"
            />
          </label>

          <div className="result-card">
            <p className="eyebrow">QUICK RESULT</p>
            <h2>{formatQuickSummary()}</h2>
            <div className="tag-row">
              <span>45 days from today</span>
              <span>Sep 16 2026 → Oct 30 2026</span>
              <span>10:30 AM → 6:45 PM</span>
            </div>
          </div>
        </div>
      )
    }

    if (activeTool === 'Date') {
      return (
        <div className="tool-panel">
          {helpCard}
          <div className="field-row">
            <DatePicker label="From" value={fromDate} onChange={setFromDate} />
            <DatePicker label="To" value={toDate} onChange={setToDate} />
          </div>

          <div className="result-card">
            <p className="eyebrow">DATE DIFFERENCE</p>
            <h2>{dateDifference ? `${dateDifference.totalDays} days` : '—'}</h2>
            <div className="detail-list">
              <span>{weekBreakdown ? `${weekBreakdown.weeks} weeks` : '—'}</span>
              <span>{dateDifference ? `${dateDifference.daysRemainder} days` : '—'}</span>
              <span>{dateDifference ? `${dateDifference.months} month` : '—'}</span>
              <span>{dateDifference ? `${dateDifference.monthDays} days` : '—'}</span>
            </div>
            <p className="meta">≈ {dateDifference ? `${dateDifference.hours.toLocaleString()} hours` : '—'}</p>
            <p className="meta">≈ {dateDifference ? `${dateDifference.minutes.toLocaleString()} minutes` : '—'}</p>
          </div>
        </div>
      )
    }

    if (activeTool === 'Time') {
      return (
        <div className="tool-panel">
          {helpCard}
          <div className="field-row">
            <label>
              <span>Start</span>
              <input className="app-field" type="text" value={fromTime} onChange={(event) => setFromTime(event.target.value)} placeholder="10:30 AM" />
            </label>
            <label>
              <span>End</span>
              <input className="app-field" type="text" value={toTime} onChange={(event) => setToTime(event.target.value)} placeholder="6:45 PM" />
            </label>
          </div>

          <div className="result-card compact">
            <p className="eyebrow">DURATION</p>
            <h2>{timeDifference ? `${timeDifference.hours}h ${timeDifference.minutes}m` : '—'}</h2>
            <p className="meta">{timeDifference ? `${timeDifference.totalMinutes} minutes total` : '—'}</p>
          </div>
        </div>
      )
    }

    if (activeTool === 'Add/Subtract') {
      return (
        <div className="tool-panel">
          {helpCard}
          <div className="field-row single">
            <DatePicker label="Base date" value={offsetDate} onChange={setOffsetDate} />
            <label>
              <span>Days</span>
              <input className="app-field" type="number" min="0" value={offsetDays} onChange={(event) => setOffsetDays(event.target.value)} />
            </label>
          </div>

          <div className="segmented" aria-label="Choose add or subtract">
            <button type="button" className={operation === 'add' ? 'active' : ''} onClick={() => setOperation('add')}>Add</button>
            <button type="button" className={operation === 'subtract' ? 'active' : ''} onClick={() => setOperation('subtract')}>Subtract</button>
          </div>

          <div className="result-card compact">
            <p className="eyebrow">OFFSET DATE</p>
            <h2>{adjustedDate ? formatDateForDisplay(adjustedDate) : '—'}</h2>
            <p className="meta">{operation === 'add' ? `${offsetDays} days after` : `${offsetDays} days before`} {offsetDate || '—'}</p>
          </div>
        </div>
      )
    }

    if (activeTool === 'Business Days') {
      return (
        <div className="tool-panel">
          {helpCard}
          <div className="field-row">
            <DatePicker label="Start" value={businessStart} onChange={setBusinessStart} />
            <DatePicker label="End" value={businessEnd} onChange={setBusinessEnd} />
          </div>

          <label className="input-block">
            <span>Custom holidays</span>
            <input
              className="app-field"
              type="text"
              value={holidayInput}
              onChange={(event) => setHolidayInput(event.target.value)}
              placeholder="2026-09-22, 2026-10-01"
            />
          </label>

          <div className="weekend-selector">
            <span>Weekend days</span>
            <div className="weekend-options">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => {
                const isSelected = weekendDays.includes(index)

                return (
                  <button
                    key={day}
                    type="button"
                    className={isSelected ? 'weekend-option selected' : 'weekend-option'}
                    onClick={() => {
                      setWeekendDays((current) => {
                        const next = current.includes(index)
                          ? current.filter((item) => item !== index)
                          : [...current, index].sort((a, b) => a - b)

                        return next.length ? next : [0, 6]
                      })
                    }}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="result-card">
            <p className="eyebrow">WORKING DAYS</p>
            <h2>{businessRange ? `${businessRange.workingDays} days` : '—'}</h2>
            <div className="detail-list">
              <span>Business: {businessRange ? businessRange.workingDays : '—'}</span>
              <span>Weekends: {businessRange ? businessRange.weekendDays : '—'}</span>
              <span>Holidays: {businessRange ? businessRange.holidayDays : '—'}</span>
            </div>
          </div>
        </div>
      )
    }

    if (activeTool === 'Timezones') {
      return (
        <div className="tool-panel">
          {helpCard}
          <div className="field-row">
            <DateTimePicker value={timestampInput} onChange={setTimestampInput} />
            <TimezonePicker value={timeZone} onChange={setTimeZone} />
          </div>

          <div className="result-card compact">
            <p className="eyebrow">TIMEZONE</p>
            <h2>{timezoneOutput}</h2>
            <p className="meta">UNIX: {timestampValue ?? '—'}</p>
          </div>
        </div>
      )
    }

    return (
      <div className="tool-panel">
        {helpCard}
        <div className="field-row">
          <DatePicker label="Start date" value={recurringStart} onChange={setRecurringStart} />
          <label>
            <span>Interval</span>
            <input className="app-field" type="number" min="1" value={recurringInterval} onChange={(event) => setRecurringInterval(event.target.value)} />
          </label>
        </div>

        <div className="field-row">
          <label>
            <span>Unit</span>
            <OptionPicker
              label="Unit"
              value={recurringUnit}
              options={[{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }]}
              onChange={setRecurringUnit}
            />
          </label>
          <label>
            <span>Count</span>
            <input className="app-field" type="number" min="1" max="30" value={recurringCount} onChange={(event) => setRecurringCount(event.target.value)} />
          </label>
        </div>

        <div className="result-card">
          <p className="eyebrow">RECURRING DATES</p>
          <div className="tag-row">
            {recurringDates.length > 0 ? recurringDates.map((date) => <span key={date}>{date}</span>) : <span>No dates</span>}
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="app-shell">
      <div className="app-card">
        <header className="topbar">
          <div>
            <p className="brand">TimeDiff</p>
            <h1>Built for doing time calculations, not asking questions.</h1>
          </div>
        </header>

        <nav className="tab-nav" aria-label="Calculator tools">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab}
              className={activeTool === tab ? 'tab active' : 'tab'}
              onClick={() => setActiveTool(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>

        {renderToolPanel()}

        <div className="action-row">
          <button type="button" className="secondary" onClick={copyShare}>Copy Share Link</button>
          <button type="button" className="primary" onClick={copyResult}>Copy Result</button>
        </div>
      </div>
    </main>
  )
}

export default App
