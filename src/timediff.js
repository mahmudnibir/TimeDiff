const MS_PER_DAY = 1000 * 60 * 60 * 24

function normalizeDateInput(value) {
  if (!value) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
}

function toIsoDate(date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10)
}

export function calculateDateDifference(fromDate, toDate) {
  const start = normalizeDateInput(fromDate)
  const end = normalizeDateInput(toDate)

  if (!start || !end) {
    throw new Error('Both dates must be valid values.')
  }

  const diffMs = end.getTime() - start.getTime()
  const totalDays = Math.round(diffMs / MS_PER_DAY)

  const weeks = Math.floor(totalDays / 7)
  const daysRemainder = totalDays % 7

  const months = Math.floor(totalDays / 30)
  const monthDays = totalDays - months * 30

  return {
    totalDays,
    weeks,
    daysRemainder,
    months,
    monthDays,
    hours: totalDays * 24,
    minutes: totalDays * 24 * 60,
  }
}

export function calculateTimeDifference(fromTime, toTime) {
  const [fromHour, fromMinute] = String(fromTime).split(':').map(Number)
  const [toHour, toMinute] = String(toTime).split(':').map(Number)

  if (
    Number.isNaN(fromHour) ||
    Number.isNaN(fromMinute) ||
    Number.isNaN(toHour) ||
    Number.isNaN(toMinute)
  ) {
    throw new Error('Both times must be valid HH:MM values.')
  }

  const fromTotalMinutes = fromHour * 60 + fromMinute
  const toTotalMinutes = toHour * 60 + toMinute
  const diff = toTotalMinutes - fromTotalMinutes

  if (diff < 0) {
    throw new Error('End time must be later than start time.')
  }

  const hours = Math.floor(diff / 60)
  const minutes = diff % 60

  return {
    totalMinutes: diff,
    hours,
    minutes,
  }
}

export function addDaysToDate(dateString, daysToAdd) {
  const base = normalizeDateInput(dateString)
  if (!base) throw new Error('The date must be valid.')

  const ms = base.getTime() + daysToAdd * MS_PER_DAY
  return toIsoDate(new Date(ms))
}

export function subtractDaysFromDate(dateString, daysToSubtract) {
  const base = normalizeDateInput(dateString)
  if (!base) throw new Error('The date must be valid.')

  const ms = base.getTime() - daysToSubtract * MS_PER_DAY
  return toIsoDate(new Date(ms))
}

export function calculateAge(dateOfBirth, asOfDate) {
  const birth = normalizeDateInput(dateOfBirth)
  const current = normalizeDateInput(asOfDate)

  if (!birth || !current) {
    throw new Error('Both dates must be valid values.')
  }

  let years = current.getUTCFullYear() - birth.getUTCFullYear()
  let months = current.getUTCMonth() - birth.getUTCMonth()
  let days = current.getUTCDate() - birth.getUTCDate()

  if (days < 0) {
    const previousMonth = new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth(), 0))
    days += previousMonth.getUTCDate()
    months -= 1
  }

  if (months < 0) {
    months += 12
    years -= 1
  }

  return { years, months, days }
}

export function calculateBusinessDays(startDate, endDate) {
  const start = normalizeDateInput(startDate)
  const end = normalizeDateInput(endDate)

  if (!start || !end) {
    throw new Error('Both dates must be valid values.')
  }

  let businessDays = 0
  let weekendDays = 0
  const current = new Date(start.getTime())

  while (current <= end) {
    const day = current.getUTCDay()
    if (day === 0 || day === 6) {
      weekendDays += 1
    } else {
      businessDays += 1
    }
    current.setUTCDate(current.getUTCDate() + 1)
  }

  return { workingDays: businessDays, weekendDays }
}

export function getWeekBreakdown(totalDays) {
  const safeValue = Number(totalDays)

  if (!Number.isFinite(safeValue) || safeValue < 0) {
    throw new Error('Total days must be a non-negative number.')
  }

  return {
    weeks: Math.floor(safeValue / 7),
    days: safeValue % 7,
  }
}

export function convertToTimestamp(dateValue) {
  const timestamp = new Date(dateValue).getTime()

  if (Number.isNaN(timestamp)) {
    throw new Error('The timestamp value is invalid.')
  }

  return timestamp
}

export function formatDateForDisplay(dateValue) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateValue))
}
