const MS_PER_DAY = 1000 * 60 * 60 * 24

export const TIME_ZONES = (() => {
  try {
    return Intl.supportedValuesOf('timeZone')
  } catch {
    return [
      'UTC',
      'Asia/Dhaka',
      'Asia/Tokyo',
      'America/New_York',
      'Europe/London',
      'Europe/Paris',
      'America/Los_Angeles',
      'Australia/Sydney',
      'Africa/Cairo',
      'Asia/Singapore',
    ]
  }
})()

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

function parseClock(value) {
  if (!value) return null

  const text = String(value).trim().toUpperCase()
  const match = text.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/)

  if (!match) return null

  let hour = Number(match[1])
  const minute = Number(match[2])
  const suffix = match[3]

  if (suffix === 'AM' && hour === 12) hour = 0
  if (suffix === 'PM' && hour !== 12) hour += 12

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null

  return hour * 60 + minute
}

function parseHolidayList(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
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
  const fromMinutes = parseClock(fromTime)
  const toMinutes = parseClock(toTime)

  if (fromMinutes === null || toMinutes === null) {
    throw new Error('Both times must be valid values.')
  }

  const diff = toMinutes - fromMinutes

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

  const ms = base.getTime() + Number(daysToAdd) * MS_PER_DAY
  return toIsoDate(new Date(ms))
}

export function subtractDaysFromDate(dateString, daysToSubtract) {
  const base = normalizeDateInput(dateString)
  if (!base) throw new Error('The date must be valid.')

  const ms = base.getTime() - Number(daysToSubtract) * MS_PER_DAY
  return toIsoDate(new Date(ms))
}

export function calculateBusinessDays(startDate, endDate, options = {}) {
  const start = normalizeDateInput(startDate)
  const end = normalizeDateInput(endDate)

  if (!start || !end) {
    throw new Error('Both dates must be valid values.')
  }

  const excludeWeekends = options.excludeWeekends ?? true
  const holidays = parseHolidayList(options.holidays)
  const holidaySet = new Set(holidays)
  const weekendSet = new Set((options.weekendDays ?? [0, 6]).map((day) => Number(day)))

  let workingDays = 0
  let weekendDays = 0
  let holidayDays = 0
  let totalDays = 0
  const current = new Date(start.getTime())

  while (current <= end) {
    const isoDate = toIsoDate(current)
    const day = current.getUTCDay()
    totalDays += 1

    if (holidaySet.has(isoDate)) {
      holidayDays += 1
    } else if (excludeWeekends && weekendSet.has(day)) {
      weekendDays += 1
    } else {
      workingDays += 1
    }

    current.setUTCDate(current.getUTCDate() + 1)
  }

  return { workingDays, weekendDays, holidayDays, totalDays }
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

export function generateRecurringDates(startDate, interval, unit, count) {
  const start = normalizeDateInput(startDate)
  if (!start) throw new Error('Start date is invalid.')

  const safeInterval = Number(interval) || 1
  const safeCount = Number(count) || 1
  const results = []
  let current = new Date(start.getTime())

  for (let index = 0; index < safeCount; index += 1) {
    results.push(toIsoDate(current))

    if (unit === 'day') {
      current = new Date(current.getTime() + safeInterval * MS_PER_DAY)
    } else if (unit === 'week') {
      current = new Date(current.getTime() + safeInterval * 7 * MS_PER_DAY)
    } else if (unit === 'month') {
      current = new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() + safeInterval, current.getUTCDate()))
    } else {
      throw new Error('Unsupported recurrence unit.')
    }
  }

  return results
}

export function parseQuickInput(input, referenceDate = new Date().toISOString().slice(0, 10)) {
  const text = String(input || '').trim()

  if (!text) {
    throw new Error('Quick input cannot be empty.')
  }

  const offsetMatch = text.match(/^(\d+)\s+days?\s+(?:from|after|plus)\s+(today|now|\d{4}-\d{2}-\d{2}|[A-Za-z]+\s+\d{1,2}\s+\d{4})$/i)
  if (offsetMatch) {
    const baseText = offsetMatch[2].toLowerCase()
    const baseDate = baseText === 'today' || baseText === 'now' ? referenceDate : offsetMatch[2]

    return {
      kind: 'date-offset',
      result: addDaysToDate(new Date(baseDate).toISOString().slice(0, 10), Number(offsetMatch[1])),
    }
  }

  const dateRangeMatch = text.match(/^(.*?)(?:\s*(?:->|to)\s*)(.*)$/i)
  if (dateRangeMatch) {
    const left = dateRangeMatch[1].trim()
    const right = dateRangeMatch[2].trim()
    const parsedLeft = left ? new Date(left) : new Date(referenceDate)
    const parsedRight = right ? new Date(right) : new Date(referenceDate)

    if (!Number.isNaN(parsedLeft.getTime()) && !Number.isNaN(parsedRight.getTime())) {
      return {
        kind: 'date-difference',
        result: calculateDateDifference(parsedLeft.toISOString().slice(0, 10), parsedRight.toISOString().slice(0, 10)),
      }
    }
  }

  const timeRangeMatch = text.match(/^(\d{1,2}:\d{2}\s*(?:AM|PM)?)\s*(?:->|to)\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)$/i)
  if (timeRangeMatch) {
    return {
      kind: 'time-difference',
      result: calculateTimeDifference(timeRangeMatch[1], timeRangeMatch[2]),
    }
  }

  throw new Error('Unsupported quick input format.')
}

export function getTimeZoneTime(isoDate, timeZone) {
  const time = new Date(isoDate)
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })

  return `${formatter.format(time)} · ${timeZone}`
}

export function buildShareUrl(pathname, state) {
  const params = new URLSearchParams()

  Object.entries(state).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value))
    }
  })

  const query = params.toString()
  return query ? `${pathname}?${query}` : pathname
}

export function formatDateForDisplay(dateValue) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateValue))
}
