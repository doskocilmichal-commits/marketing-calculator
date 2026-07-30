import { describe, it, expect } from 'vitest'
import { fieldError, parseAmount, parseRate } from '@/lib/inputs'

describe('parseAmount', () => {
  it('reads a plain number', () => {
    expect(parseAmount('50000')).toBe(50_000)
    expect(parseAmount('2500.5')).toBe(2500.5)
    expect(parseAmount('0')).toBe(0)
  })

  it('rejects anything unusable', () => {
    expect(parseAmount('')).toBeNaN() // not filled in yet
    expect(parseAmount('-5')).toBeNaN() // a negative budget is nonsense
    expect(parseAmount('abc')).toBeNaN()
  })
})

describe('parseRate', () => {
  it('converts a percentage to a fraction', () => {
    expect(parseRate('35')).toBeCloseTo(0.35, 10)
    expect(parseRate('1.5')).toBeCloseTo(0.015, 10)
    expect(parseRate('100')).toBe(1)
  })

  it('rejects percentages outside 0-100 rather than clamping them', () => {
    // Clamping would show 300 in the field while calculating with 100 — the
    // silently-wrong result this was built to prevent.
    expect(parseRate('300')).toBeNaN()
    expect(parseRate('-5')).toBeNaN()
  })
})

describe('fieldError', () => {
  it('stays quiet for an empty field', () => {
    // Nothing typed yet is not a mistake.
    expect(fieldError('', NaN, 'amount')).toBeUndefined()
    expect(fieldError('   ', NaN, 'rate')).toBeUndefined()
  })

  it('stays quiet for a value that parsed', () => {
    expect(fieldError('35', 0.35, 'rate')).toBeUndefined()
  })

  it('explains a value that was typed but cannot be used', () => {
    expect(fieldError('300', NaN, 'rate')).toMatch(/between 0 and 100/)
    expect(fieldError('-5', NaN, 'amount')).toMatch(/0 or more/)
  })
})
