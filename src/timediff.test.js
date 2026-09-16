import { describe, expect, it } from 'vitest'
import {
    addDaysToDate,
    calculateBusinessDays,
    calculateDateDifference,
    calculateTimeDifference,
    convertToTimestamp,
    generateRecurringDates,
    getTimeZoneTime,
    getWeekBreakdown,
    parseQuickInput,
    subtractDaysFromDate,
} from './timediff.js'

describe('TimeDiff utility calculations', () => {
  it('calculates a date difference in days and breakdowns', () => {
    const result = calculateDateDifference('2026-09-16', '2026-10-30')

    expect(result.totalDays).toBe(44)
    expect(result.weeks).toBe(6)
    expect(result.daysRemainder).toBe(2)
    expect(result.months).toBe(1)
    expect(result.monthDays).toBe(14)
    expect(result.hours).toBe(1056)
    expect(result.minutes).toBe(63360)
  })

  it('calculates a time difference in hours and minutes', () => {
    const result = calculateTimeDifference('10:30 AM', '6:45 PM')

    expect(result.totalMinutes).toBe(495)
    expect(result.hours).toBe(8)
    expect(result.minutes).toBe(15)
  })

  it('adds days to a date and preserves the date logic', () => {
    expect(addDaysToDate('2026-09-16', 45)).toBe('2026-10-31')
  })

  it('subtracts days from a date and preserves the date logic', () => {
    expect(subtractDaysFromDate('2026-10-30', 20)).toBe('2026-10-10')
  })

  it('calculates business-day differences with weekends excluded', () => {
    const result = calculateBusinessDays('2026-09-16', '2026-09-30')

    expect(result.workingDays).toBe(11)
    expect(result.weekendDays).toBe(4)
  })

  it('respects custom holidays in the business-day count', () => {
    const result = calculateBusinessDays('2026-09-16', '2026-09-30', {
      holidays: '2026-09-22, 2026-09-23',
    })

    expect(result.workingDays).toBe(9)
    expect(result.holidayDays).toBe(2)
  })

  it('generates recurring dates for a chosen interval and unit', () => {
    const result = generateRecurringDates('2026-09-16', 2, 'week', 4)

    expect(result).toEqual([
      '2026-09-16',
      '2026-09-30',
      '2026-10-14',
      '2026-10-28',
    ])
  })

  it('breaks a total day count into weeks and days', () => {
    const result = getWeekBreakdown(100)

    expect(result.weeks).toBe(14)
    expect(result.days).toBe(2)
  })

  it('converts a date to a unix timestamp', () => {
    const result = convertToTimestamp('2026-09-16T00:00:00Z')

    expect(result).toBe(1789516800000)
  })

  it('parses quick expressions for common workflows', () => {
    const offset = parseQuickInput('45 days from today', '2026-09-16')
    const range = parseQuickInput('Sep 16 2026 -> Oct 30 2026', '2026-09-16')
    const timeRange = parseQuickInput('10:30 AM -> 6:45 PM', '2026-09-16')

    expect(offset.kind).toBe('date-offset')
    expect(offset.result).toBe('2026-10-31')
    expect(range.kind).toBe('date-difference')
    expect(range.result.totalDays).toBe(44)
    expect(timeRange.kind).toBe('time-difference')
    expect(timeRange.result.totalMinutes).toBe(495)
  })

  it('formats a timezone-aware time from a city zone', () => {
    const value = getTimeZoneTime('2026-09-16T12:00:00Z', 'Asia/Tokyo')

    expect(value).toContain('2026')
    expect(value).toContain('Tokyo')
  })
})
