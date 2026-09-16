import { describe, expect, it } from 'vitest'
import {
    addDaysToDate,
    calculateAge,
    calculateBusinessDays,
    calculateDateDifference,
    calculateTimeDifference,
    convertToTimestamp,
    getWeekBreakdown,
    subtractDaysFromDate,
} from './timediff.js'

describe('TimeDiff core calculations', () => {
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
    const result = calculateTimeDifference('10:30', '18:45')

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

  it('calculates exact age from date of birth', () => {
    const result = calculateAge('1998-05-10', '2026-09-16')

    expect(result.years).toBe(28)
    expect(result.months).toBe(4)
    expect(result.days).toBe(6)
  })

  it('calculates business-day differences', () => {
    const result = calculateBusinessDays('2026-09-16', '2026-09-30')

    expect(result.workingDays).toBe(11)
    expect(result.weekendDays).toBe(4)
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
})
