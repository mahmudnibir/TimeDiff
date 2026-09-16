import { useMemo, useState } from 'react'
import './App.css'
import {
    addDaysToDate,
    calculateAge,
    calculateBusinessDays,
    calculateDateDifference,
    calculateTimeDifference,
    convertToTimestamp,
    formatDateForDisplay,
    getWeekBreakdown,
    subtractDaysFromDate,
} from './timediff.js'

const tabs = ['Difference', 'Time', 'Add/Subtract', 'Age', 'Business Days', 'Timestamp']

function App() {
  const today = new Date().toISOString().slice(0, 10)

  const [activeTool, setActiveTool] = useState('Difference')
  const [fromDate, setFromDate] = useState('2026-09-16')
  const [toDate, setToDate] = useState('2026-10-30')
  const [fromTime, setFromTime] = useState('10:30')
  const [toTime, setToTime] = useState('18:45')
  const [offsetDate, setOffsetDate] = useState('2026-09-16')
  const [offsetDays, setOffsetDays] = useState(45)
  const [operation, setOperation] = useState('add')
  const [dob, setDob] = useState('1998-05-10')
  const [ageAsOf, setAgeAsOf] = useState(today)
  const [businessStart, setBusinessStart] = useState('2026-09-16')
  const [businessEnd, setBusinessEnd] = useState('2026-09-30')
  const [timestampInput, setTimestampInput] = useState('2026-09-16T00:00:00Z')

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
      const nextDate = operation === 'add' ? addDaysToDate(offsetDate, Number(offsetDays)) : subtractDaysFromDate(offsetDate, Number(offsetDays))
      return nextDate
    } catch {
      return null
    }
  }, [offsetDate, offsetDays, operation])

  const ageResult = useMemo(() => {
    try {
      return calculateAge(dob, ageAsOf)
    } catch {
      return null
    }
  }, [dob, ageAsOf])

  const businessRange = useMemo(() => {
    try {
      return calculateBusinessDays(businessStart, businessEnd)
    } catch {
      return null
    }
  }, [businessStart, businessEnd])

  const timestampValue = useMemo(() => {
    try {
      return convertToTimestamp(timestampInput)
    } catch {
      return null
    }
  }, [timestampInput])

  const weekBreakdown = dateDifference ? getWeekBreakdown(dateDifference.totalDays) : null

  const copyResult = async () => {
    const result =
      activeTool === 'Difference'
        ? `${dateDifference?.totalDays ?? 0} days`
        : activeTool === 'Add/Subtract'
          ? adjustedDate ?? '—'
          : activeTool === 'Age'
            ? `${ageResult?.years ?? 0}y ${ageResult?.months ?? 0}m ${ageResult?.days ?? 0}d`
            : activeTool === 'Business Days'
              ? `${businessRange?.workingDays ?? 0} working days`
              : `${timestampValue ?? '—'} unix timestamp`

    try {
      await navigator.clipboard.writeText(result)
    } catch {
      // no-op for unsupported clipboard environments
    }
  }

  const renderToolPanel = () => {
    if (activeTool === 'Difference') {
      return (
        <div className="tool-panel">
          <div className="field-row">
            <label>
              <span>From</span>
              <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
            </label>
            <label>
              <span>To</span>
              <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
            </label>
          </div>

          <div className="result-card">
            <p className="eyebrow">TIME DIFFERENCE</p>
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
          <div className="field-row">
            <label>
              <span>Start</span>
              <input type="time" value={fromTime} onChange={(event) => setFromTime(event.target.value)} />
            </label>
            <label>
              <span>End</span>
              <input type="time" value={toTime} onChange={(event) => setToTime(event.target.value)} />
            </label>
          </div>

          <div className="result-card compact">
            <p className="eyebrow">TIME DIFFERENCE</p>
            <h2>{timeDifference ? `${timeDifference.hours}h ${timeDifference.minutes}m` : '—'}</h2>
            <p className="meta">{timeDifference ? `${timeDifference.totalMinutes} minutes total` : '—'}</p>
          </div>
        </div>
      )
    }

    if (activeTool === 'Add/Subtract') {
      return (
        <div className="tool-panel">
          <div className="field-row single">
            <label>
              <span>Base date</span>
              <input type="date" value={offsetDate} onChange={(event) => setOffsetDate(event.target.value)} />
            </label>
            <label>
              <span>Days</span>
              <input type="number" min="0" value={offsetDays} onChange={(event) => setOffsetDays(event.target.value)} />
            </label>
          </div>

          <div className="segmented" aria-label="Choose add or subtract">
            <button type="button" className={operation === 'add' ? 'active' : ''} onClick={() => setOperation('add')}>Add</button>
            <button type="button" className={operation === 'subtract' ? 'active' : ''} onClick={() => setOperation('subtract')}>Subtract</button>
          </div>

          <div className="result-card compact">
            <p className="eyebrow">RESULT</p>
            <h2>{adjustedDate ? formatDateForDisplay(adjustedDate) : '—'}</h2>
            <p className="meta">{operation === 'add' ? `${offsetDays} days after` : `${offsetDays} days before`} {offsetDate || '—'}</p>
          </div>
        </div>
      )
    }

    if (activeTool === 'Age') {
      return (
        <div className="tool-panel">
          <div className="field-row">
            <label>
              <span>Date of birth</span>
              <input type="date" value={dob} onChange={(event) => setDob(event.target.value)} />
            </label>
            <label>
              <span>As of</span>
              <input type="date" value={ageAsOf} onChange={(event) => setAgeAsOf(event.target.value)} />
            </label>
          </div>

          <div className="result-card compact">
            <p className="eyebrow">AGE</p>
            <h2>{ageResult ? `${ageResult.years}y ${ageResult.months}m ${ageResult.days}d` : '—'}</h2>
            <p className="meta">Exact age for {ageAsOf}</p>
          </div>
        </div>
      )
    }

    if (activeTool === 'Business Days') {
      return (
        <div className="tool-panel">
          <div className="field-row">
            <label>
              <span>Start</span>
              <input type="date" value={businessStart} onChange={(event) => setBusinessStart(event.target.value)} />
            </label>
            <label>
              <span>End</span>
              <input type="date" value={businessEnd} onChange={(event) => setBusinessEnd(event.target.value)} />
            </label>
          </div>

          <div className="result-card">
            <p className="eyebrow">WORKING DAYS</p>
            <h2>{businessRange ? `${businessRange.workingDays} days` : '—'}</h2>
            <div className="detail-list">
              <span>Business: {businessRange ? businessRange.workingDays : '—'}</span>
              <span>Weekends: {businessRange ? businessRange.weekendDays : '—'}</span>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="tool-panel">
        <div className="field-row single">
          <label>
            <span>Timestamp</span>
            <input type="datetime-local" value={timestampInput.slice(0, 16)} onChange={(event) => setTimestampInput(`${event.target.value}:00Z`)} />
          </label>
        </div>

        <div className="result-card compact">
          <p className="eyebrow">UNIX TIMESTAMP</p>
          <h2>{timestampValue ?? '—'}</h2>
          <p className="meta">{timestampInput}</p>
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
            <h1>What do you want to calculate?</h1>
          </div>
        </header>

        <nav className="tab-nav" aria-label="Calculator tools">
          {tabs.map((tab) => (
            <button type="button" key={tab} className={activeTool === tab ? 'tab active' : 'tab'} onClick={() => setActiveTool(tab)}>
              {tab}
            </button>
          ))}
        </nav>

        {renderToolPanel()}

        <div className="action-row">
          <button type="button" className="primary" onClick={copyResult}>Copy Result</button>
        </div>
      </div>
    </main>
  )
}

export default App
